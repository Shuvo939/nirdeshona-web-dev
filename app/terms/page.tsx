import type { Metadata } from "next";

import LegalPage from "@/app/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service — Nirdeshona Web",
  description: "The terms that apply when you use this website and work with Nirdeshona Web Development.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The terms that apply when you use this website, our client portal and our services."
      updated="23 November 2026"
      summary={[
        "Each project has its own written scope and quote — that document takes priority over these general terms.",
        "You own your website, code and content once the project is paid in full.",
        "Be respectful in comments and support tickets; we may remove abusive content.",
        "Questions? Email us before you sign anything.",
      ]}
      sections={[
        {
          id: "using",
          title: "Using this website",
          body: (
            <p>
              By using {site.url.replace(/^https?:\/\//, "")} you agree to these terms. You may browse, read and share our content for
              personal or informational purposes. Please don't attempt to disrupt the site, access other users' data or scrape it at scale.
            </p>
          ),
        },
        {
          id: "accounts",
          title: "Accounts and the client portal",
          body: (
            <ul>
              <li>You're responsible for keeping your password secure and for activity on your account.</li>
              <li>Client portal access is granted by us and linked to your organisation. Let us know when team members leave.</li>
              <li>We may suspend accounts that are used to abuse the service.</li>
            </ul>
          ),
        },
        {
          id: "projects",
          title: "Projects and payment",
          body: (
            <ul>
              <li>Work begins after the scope and quote are agreed in writing and the first payment is received.</li>
              <li>Unless agreed otherwise, payment is 50% upfront and 50% on launch.</li>
              <li>Changes outside the agreed scope are quoted separately before we do them.</li>
              <li>Delays in feedback or content may move the delivery date.</li>
            </ul>
          ),
        },
        {
          id: "ownership",
          title: "Ownership",
          body: (
            <p>
              On full payment, you own the final website, its code and your content. We may reuse general-purpose techniques and
              non-confidential components, and we may show the finished project in our portfolio unless you ask us not to.
            </p>
          ),
        },
        {
          id: "content",
          title: "Comments and user content",
          body: (
            <p>
              You're responsible for anything you post. We may hide or remove comments that are abusive, spam or unlawful. By posting,
              you allow us to display your comment on the site.
            </p>
          ),
        },
        {
          id: "liability",
          title: "Warranty and liability",
          body: (
            <p>
              We build with care and fix defects reported during the free support period. Beyond that, the site is provided "as is", and
              our total liability for any project is limited to the amount paid for that project.
            </p>
          ),
        },
        {
          id: "contact",
          title: "Contact",
          body: (
            <p>
              Questions about these terms? Email{" "}
              <a className="font-medium text-neutral-950 underline" href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
