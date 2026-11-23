import type { Metadata } from "next";

import LegalPage from "@/app/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy — Nirdeshona Web",
  description: "How Nirdeshona Web Development collects, uses and protects your information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How we collect, use and protect your information when you use this website and our client portal."
      updated="23 November 2026"
      summary={[
        "We only collect what we need to reply to you and deliver your project.",
        "We never sell your data or share it for advertising.",
        "Your data is stored with trusted providers and protected with access controls.",
        `You can ask us to see, correct or delete your data at any time: ${site.email}.`,
      ]}
      sections={[
        {
          id: "information",
          title: "Information we collect",
          body: (
            <>
              <p>We collect information you give us directly:</p>
              <ul>
                <li>Contact form details — name, email, phone, the service you're interested in, budget, message and any file you attach.</li>
                <li>Account details — name, email address and password (stored securely, never in plain text) when you register.</li>
                <li>Client portal content — support tickets, messages and files you share with us.</li>
                <li>Blog activity — comments and reactions you post while signed in.</li>
              </ul>
              <p>We also collect limited technical data automatically, such as an anonymous visitor identifier used to count article views fairly.</p>
            </>
          ),
        },
        {
          id: "use",
          title: "How we use it",
          body: (
            <ul>
              <li>To reply to enquiries and prepare quotes.</li>
              <li>To deliver, support and maintain projects for our clients.</li>
              <li>To send transactional emails such as account confirmations, password resets and ticket updates.</li>
              <li>To keep the site secure and prevent spam and abuse.</li>
            </ul>
          ),
        },
        {
          id: "cookies",
          title: "Cookies",
          body: (
            <>
              <p>We use a small number of essential cookies:</p>
              <ul>
                <li>Authentication cookies that keep you signed in.</li>
                <li>An anonymous visitor cookie used to count unique article views.</li>
                <li>A local preference to remember that you dismissed a notice.</li>
              </ul>
              <p>We do not use advertising or cross-site tracking cookies.</p>
            </>
          ),
        },
        {
          id: "providers",
          title: "Service providers",
          body: (
            <>
              <p>We rely on trusted providers to run this site. They process data only on our behalf:</p>
              <ul>
                <li>Supabase — database and authentication.</li>
                <li>Cloudflare — file storage (R2), DNS and security.</li>
                <li>Vercel — website hosting.</li>
                <li>Resend — email delivery.</li>
                <li>Crisp — live chat, where enabled.</li>
              </ul>
            </>
          ),
        },
        {
          id: "retention",
          title: "Retention and security",
          body: (
            <p>
              We keep enquiries for as long as needed to respond and follow up, and client project records for the duration of our
              working relationship plus any period required for accounting. Data is protected using HTTPS, access controls and
              database row-level security so clients can only see their own projects and tickets.
            </p>
          ),
        },
        {
          id: "rights",
          title: "Your rights",
          body: (
            <p>
              You can ask to access, correct, export or delete your personal information, or close your account, by emailing{" "}
              <a className="font-medium text-neutral-950 underline" href={`mailto:${site.email}`}>{site.email}</a>. We'll respond within 30 days.
            </p>
          ),
        },
        {
          id: "changes",
          title: "Changes to this policy",
          body: <p>If we make material changes we'll update the date at the top of this page. Continued use of the site means you accept the updated policy.</p>,
        },
      ]}
    />
  );
}
