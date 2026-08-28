import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

import { sql } from "@/lib/db";

export const runtime = "nodejs";

/* ============================================================
   CONFIGURATION
============================================================ */

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const r2 =
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY
    ? new S3Client({
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      })
    : null;

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
});

/* ============================================================
   ORIGIN CHECK
============================================================ */

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  const allowedOrigins = new Set(
    [
      process.env.NEXT_PUBLIC_SITE_URL,
      "https://nirdeshona.com",
      "https://www.nirdeshona.com",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ]
      .filter(Boolean)
      .map((value) => value!.replace(/\/+$/, ""))
  );

  return allowedOrigins.has(origin.replace(/\/+$/, ""));
}

/* ============================================================
   ATTACHMENT VERIFICATION
============================================================ */

function getPublicFileUrl(key: string) {
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");

  if (!publicUrl) {
    throw new Error("R2_PUBLIC_URL is not configured.");
  }

  return `${publicUrl}/${key}`;
}

/**
 * The client uploads the attachment directly to R2 via a presigned URL
 * before ever calling this route. We never trust a key blindly — we
 * confirm the object actually landed in the bucket before persisting
 * a URL to it in the database.
 */
async function verifyAttachmentExists(key: string) {
  if (!r2 || !process.env.R2_BUCKET_NAME) {
    throw new Error("R2 storage is not configured.");
  }

  // Defense in depth: reject keys that don't look like ones we issued.
  if (!key.startsWith("contact-attachments/")) {
    throw new Error("Invalid attachment key.");
  }

  await r2.send(
    new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    })
  );

  return getPublicFileUrl(key);
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

    const parsed = ContactSchema.safeParse(body);

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
    } = parsed.data;

    /* --------------------------------------------------------
       ATTACHMENT
    -------------------------------------------------------- */

    let attachmentUrl: string | null = null;

    if (attachmentKey) {
      try {
        attachmentUrl = await verifyAttachmentExists(attachmentKey);
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

    await sql`
      insert into public.contact_requests (
        name,
        email,
        phone,
        service,
        budget,
        message,
        attachment_url,
        preferred_contact_method
      )
      values (
        ${name},
        ${email},
        ${phone || null},
        ${service || null},
        ${budget || null},
        ${message},
        ${attachmentUrl},
        ${preferred_contact_method}
      )
    `;

    /* --------------------------------------------------------
       ADMIN EMAIL
    -------------------------------------------------------- */

    if (resend && process.env.ADMIN_EMAIL) {
      const attachmentText = attachmentUrl ? `Attachment: ${attachmentUrl}` : "Attachment: None";

      await resend.emails.send({
        from: "Nirdeshona Web <notifications@nirdeshona.com>",
        to: process.env.ADMIN_EMAIL,
        replyTo: email,
        subject: `New contact request from ${name}`,
        text: [
          "New contact request",
          "",
          `Name: ${name}`,
          `Email: ${email}`,
          `Phone: ${phone || "-"}`,
          `Service: ${service || "-"}`,
          `Budget: ${budget || "-"}`,
          `Preferred contact: ${preferred_contact_method}`,
          "",
          "Message:",
          message,
          "",
          attachmentText,
        ].join("\n"),
      });
    }

    /* --------------------------------------------------------
       SUCCESS
    -------------------------------------------------------- */

    return NextResponse.json({ ok: true, attachmentUrl }, { status: 200 });
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.json(
      { error: "We couldn't process your request right now. Please try again later." },
      { status: 500 }
    );
  }
}