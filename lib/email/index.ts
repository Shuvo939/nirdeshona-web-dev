import { Resend } from "resend";

import { site } from "@/lib/site";

let resend: Resend | null | undefined;

function getResend() {
  if (resend === undefined) {
    resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  }
  return resend;
}

const FROM = process.env.RESEND_FROM_EMAIL || "Nirdeshona Web <notifications@nirdeshona.com>";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
}

// Branded, minimal HTML wrapper. Brand colours are inlined because email
// clients don't support CSS variables.
export function emailLayout({ heading, body, cta }: { heading: string; body: string; cta?: { label: string; url: string } }) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;font-size:14px;line-height:22px;color:#404040">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const button = cta
    ? `<a href="${cta.url}" style="display:inline-block;margin-top:8px;background:#0a0a0a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:14px;font-weight:600">${escapeHtml(cta.label)}</a>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:20px;border:1px solid #e5e5e5;overflow:hidden">
<tr><td style="padding:24px 28px;border-bottom:1px solid #f0f0f0"><span style="display:inline-block;width:32px;height:32px;line-height:32px;text-align:center;background:#0a0a0a;color:#fff;border-radius:10px;font-weight:700">N</span>
<span style="margin-left:10px;font-weight:700;color:#0a0a0a;font-size:15px">${escapeHtml(site.name)}</span></td></tr>
<tr><td style="padding:28px"><h1 style="margin:0 0 16px;font-size:20px;color:#0a0a0a">${escapeHtml(heading)}</h1>${paragraphs}${button}</td></tr>
<tr><td style="padding:18px 28px;background:#fafafa;font-size:12px;color:#737373">${escapeHtml(site.legalName)} · <a href="${site.url}" style="color:#737373">${site.url.replace(/^https?:\/\//, "")}</a></td></tr>
</table></td></tr></table></body></html>`;
}

export async function sendEmail({
  to,
  subject,
  heading,
  body,
  cta,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  heading: string;
  body: string;
  cta?: { label: string; url: string };
  replyTo?: string;
}) {
  const client = getResend();
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (!client || recipients.length === 0) return;

  try {
    await client.emails.send({
      from: FROM,
      to: recipients,
      subject,
      replyTo,
      text: `${heading}\n\n${body}${cta ? `\n\n${cta.label}: ${cta.url}` : ""}`,
      html: emailLayout({ heading, body, cta }),
    });
  } catch (error) {
    // Email is best-effort; never fail the user's action because of it.
    console.error("sendEmail failed", error);
  }
}
