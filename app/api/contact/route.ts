import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { isAllowedOrigin } from "@/lib/same-origin";
import { z } from "zod";

import { verifyCaptcha } from "@/lib/captcha";
import { sql } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { headPrivateObject, hasR2 } from "@/lib/r2";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

/* ============================================================
   VALIDATION
============================================================ */

const ContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),

  email: z.string().trim().email("Invalid email address").max(255, "Email is too long"),

  phone: z.string().trim().max(50, "Phone number is too long").optional(),

  service: z.string().trim().max(100, "Service is too long").optional(),

  budget: z.string().trim().max(100, "Budget is too long").optional(),

  preferred_contact_method: z.enum(["Email", "Phone", "WhatsApp"]),

  message: z
    .string()
    .trim()
    .min(20, "Message must be at least 20 characters")
    .max(2000, "Message is too long"),

  // Populated only when the client already uploaded an attachment to R2
  // via /api/contact/upload. This is a raw object key, NOT a URL — we
  // build the public URL ourselves after verifying the object exists.
  attachmentKey: z.string().trim().max(500).optional(),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(200).optional(),
  captchaToken: z.string().optional(),
  captchaAnswer: z.string().optional(),
});

/* ============================================================
   ORIGIN CHECK
============================================================ */


/* ============================================================
   ATTACHMENT VERIFICATION
   Attachments live in the private bucket. We confirm the object really
   exists (and its size) before storing a reference; admins open it via
   /api/admin/contact-attachments/[id] with a short-lived signed URL.
============================================================ */

async function verifyAttachment(key: string) {
  if (!hasR2()) throw new Error("R2 storage is not configured.");
  if (!/^contact-attachments\/\d{4}\/\d{2}\/[0-9a-f-]{36}-[\w.-]{1,120}$/.test(key)) {
    throw new Error("Invalid attachment key.");
  }
  const head = await headPrivateObject(key);
  if (!head || head.size > MAX_ATTACHMENT_SIZE) throw new Error("Attachment missing or too large.");
  return `private:${key}`;
}

/* ============================================================
   RATE LIMIT
   3 requests per email per 24h, 5 per IP per hour. The IP is stored
   only as a salted hash.
============================================================ */

function ipHash(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const salt = process.env.AUTH_SECRET || process.env.SUPABASE_SECRET_KEY || "nirdeshona-web";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/* ============================================================
   POST
============================================================ */

export async function POST(request: Request) {
  try {
    /* --------------------------------------------------------
       ORIGIN
    -------------------------------------------------------- */

    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    /* --------------------------------------------------------
       BODY
    -------------------------------------------------------- */

    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    // Optional fields the visitor left empty arrive as null/"" — treat them as absent.
    const cleaned = Object.fromEntries(
      Object.entries(body as Record<string, unknown>).filter(([, value]) => value !== null && value !== "")
    );

    const parsed = ContactSchema.safeParse(cleaned);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please check the highlighted fields.",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      service,
      budget,
      preferred_contact_method,
      message,
      attachmentKey,
      website,
      captchaToken,
      captchaAnswer,
    } = parsed.data;

    // Bots fill hidden fields — pretend success, store nothing.
    if (website) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const captcha = await verifyCaptcha(captchaToken, captchaAnswer);
    if (!captcha.ok) {
      return NextResponse.json({ error: captcha.error, captcha: true }, { status: 400 });
    }

    const hash = ipHash(request);
    const [{ by_email, by_ip }] = await sql`
      select
        count(*) filter (where lower(email) = lower(${email}) and created_at > now() - interval '24 hours')::int as by_email,
        count(*) filter (where ip_hash = ${hash} and created_at > now() - interval '1 hour')::int as by_ip
      from public.contact_requests
      where created_at > now() - interval '24 hours'
    `;
    if (by_email >= 3 || by_ip >= 5) {
      return NextResponse.json(
        { error: "You've sent several messages recently. Please wait a while, or email us directly." },
        { status: 429 }
      );
    }

    /* --------------------------------------------------------
       ATTACHMENT
    -------------------------------------------------------- */

    let attachmentUrl: string | null = null;

    if (attachmentKey) {
      try {
        attachmentUrl = await verifyAttachment(attachmentKey);
      } catch (error) {
        console.error("Attachment verification failed:", error);

        return NextResponse.json(
          { error: "We couldn't verify your attachment. Please try attaching it again." },
          { status: 400 }
        );
      }
    }

    /* --------------------------------------------------------
       DATABASE
    -------------------------------------------------------- */

    const [saved] = await sql`
      insert into public.contact_requests (
        name,
        email,
        phone,
        service,
        budget,
        message,
        attachment_url,
        preferred_contact_method,
        ip_hash
      )
      values (
        ${name},
        ${email},
        ${phone || null},
        ${service || null},
        ${budget || null},
        ${message},
        ${attachmentUrl},
        ${preferred_contact_method},
        ${hash}
      )
      returning id
    `;

    /* --------------------------------------------------------
       EMAILS (best-effort; never fail the request)
    -------------------------------------------------------- */

    const adminEmail = process.env.ADMIN_EMAIL;
    const details = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "-"}`,
      `Service: ${service || "-"}`,
      `Budget: ${budget || "-"}`,
      `Preferred contact: ${preferred_contact_method}`,
      `Attachment: ${attachmentUrl ? "Yes (open it in the admin panel)" : "None"}`,
    ].join("\n");

    await Promise.all([
      adminEmail
        ? sendEmail({
            to: adminEmail,
            replyTo: email,
            subject: `New contact request from ${name}`,
            heading: "New contact request",
            body: `${details}\n\nMessage:\n${message}`,
            cta: { label: "Open in admin", url: `${site.url}/admin/contacts/${saved.id}` },
          })
        : Promise.resolve(),
      sendEmail({
        to: email,
        replyTo: adminEmail || site.email,
        subject: "We received your message — Nirdeshona Web",
        heading: `Thanks, ${name.split(" ")[0]}!`,
        body: `We've received your message and will reply within one business day.\n\nHere's a copy of what you sent:\n\n${message}`,
        cta: { label: "See our work while you wait", url: `${site.url}/projects` },
      }),
    ]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.json(
      { error: "We couldn't process your request right now. Please try again later." },
      { status: 500 }
    );
  }
}