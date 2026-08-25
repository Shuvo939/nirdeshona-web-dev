import { sql } from "@/lib/db";
import { Resend } from "resend";
import { z } from "zod";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  service: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ContactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name, email, phone, service, budget, message } = parsed.data;

  await sql`
    insert into contact_requests (name, email, phone, service, budget, message)
    values (${name}, ${email}, ${phone ?? null}, ${service ?? null}, ${budget ?? null}, ${message})
  `;

  if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
    await resend.emails.send({
      from: "Nirdeshona Web <notifications@nirdeshona.com>",
      to: process.env.ADMIN_EMAIL,
      subject: `New contact request from ${name}`,
      text: `${name} (${email}, ${phone ?? "no phone"})\n\nService: ${service ?? "-"}\nBudget: ${budget ?? "-"}\n\n${message}`,
    });
  }

  return NextResponse.json({ ok: true });
}
