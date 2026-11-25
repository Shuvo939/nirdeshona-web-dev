import type { Metadata } from "next";

import LegalPage from "@/app/components/legal-page";
import { getI18n, localeAlternates } from "@/lib/i18n/server";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { L, locale } = await getI18n();
  return {
    title: L("Terms of Service — Nirdeshona Web", "সেবার শর্তাবলি — নির্দেশনা ওয়েব"),
    description: L(
      "The terms that apply when you use this website and work with Nirdeshona Web Development.",
      "এই ওয়েবসাইট ব্যবহার ও নির্দেশনা ওয়েব ডেভেলপমেন্টের সাথে কাজ করার ক্ষেত্রে প্রযোজ্য শর্তাবলি।",
    ),
    alternates: localeAlternates(locale, "/terms"),
  };
}

export default async function TermsPage() {
  const { L } = await getI18n();
  const domain = site.url.replace(/^https?:\/\//, "");

  return (
    <LegalPage
      title={L("Terms of Service", "সেবার শর্তাবলি")}
      description={L(
        "The terms that apply when you use this website, our client portal and our services.",
        "এই ওয়েবসাইট, আমাদের ক্লায়েন্ট পোর্টাল ও সেবা ব্যবহারের ক্ষেত্রে প্রযোজ্য শর্তাবলি।",
      )}
      updated={L("25 November 2026", "২৫ নভেম্বর ২০২৬")}
      summary={[
        L(
          "Each project has its own written scope and quote — that document takes priority over these general terms.",
          "প্রতিটি প্রজেক্টের নিজস্ব লিখিত পরিসর ও কোটেশন থাকে — এই সাধারণ শর্তের চেয়ে সেটিই অগ্রাধিকার পায়।",
        ),
        L("You own your website, code and content once the project is paid in full.", "পুরো পেমেন্টের পর ওয়েবসাইট, কোড ও কনটেন্টের মালিক আপনি।"),
        L("Be respectful in comments and support tickets; we may remove abusive content.", "কমেন্ট ও সাপোর্ট টিকিটে শ্রদ্ধাশীল থাকুন; আপত্তিকর কনটেন্ট আমরা সরিয়ে দিতে পারি।"),
        L("Questions? Email us before you sign anything.", "প্রশ্ন আছে? কিছুতে সম্মতি দেওয়ার আগে আমাদের ইমেইল করুন।"),
      ]}
      sections={[
        {
          id: "using",
          title: L("Using this website", "এই ওয়েবসাইট ব্যবহার"),
          body: (
            <p>
              {L(
                `By using ${domain} you agree to these terms. You may browse, read and share our content for personal or informational purposes. Please don't attempt to disrupt the site, access other users' data or scrape it at scale.`,
                `${domain} ব্যবহার করে আপনি এই শর্তাবলিতে সম্মতি দিচ্ছেন। ব্যক্তিগত বা তথ্যগত প্রয়োজনে আমাদের কনটেন্ট দেখতে, পড়তে ও শেয়ার করতে পারেন। দয়া করে সাইটে বিঘ্ন ঘটানো, অন্য ব্যবহারকারীর তথ্যে প্রবেশ বা ব্যাপকভাবে তথ্য সংগ্রহের চেষ্টা করবেন না।`,
              )}
            </p>
          ),
        },
        {
          id: "accounts",
          title: L("Accounts and the client portal", "অ্যাকাউন্ট ও ক্লায়েন্ট পোর্টাল"),
          body: (
            <ul>
              <li>{L("You're responsible for keeping your password secure and for activity on your account.", "পাসওয়ার্ড নিরাপদ রাখা ও অ্যাকাউন্টের কার্যক্রমের দায়িত্ব আপনার।")}</li>
              <li>
                {L(
                  "Client portal access is granted by us and linked to your organisation. Let us know when team members leave.",
                  "ক্লায়েন্ট পোর্টালের অ্যাক্সেস আমরা দিই এবং তা আপনার প্রতিষ্ঠানের সাথে যুক্ত। টিমের কেউ চলে গেলে আমাদের জানান।",
                )}
              </li>
              <li>{L("We may suspend accounts that are used to abuse the service.", "সেবার অপব্যবহারে ব্যবহৃত অ্যাকাউন্ট আমরা স্থগিত করতে পারি।")}</li>
            </ul>
          ),
        },
        {
          id: "projects",
          title: L("Projects and payment", "প্রজেক্ট ও পেমেন্ট"),
          body: (
            <ul>
              <li>
                {L(
                  "Work begins after the scope and quote are agreed in writing and the first payment is received.",
                  "পরিসর ও কোটেশন লিখিতভাবে চূড়ান্ত হওয়া এবং প্রথম পেমেন্ট পাওয়ার পর কাজ শুরু হয়।",
                )}
              </li>
              <li>{L("Unless agreed otherwise, payment is 50% upfront and 50% on launch.", "ভিন্নভাবে সম্মত না হলে, পেমেন্ট শুরুতে ৫০% এবং লঞ্চে ৫০%।")}</li>
              <li>{L("Changes outside the agreed scope are quoted separately before we do them.", "সম্মত পরিসরের বাইরের পরিবর্তনের জন্য কাজের আগে আলাদা কোটেশন দেওয়া হয়।")}</li>
              <li>{L("Delays in feedback or content may move the delivery date.", "মতামত বা কনটেন্ট দিতে দেরি হলে ডেলিভারির তারিখ পিছিয়ে যেতে পারে।")}</li>
            </ul>
          ),
        },
        {
          id: "ownership",
          title: L("Ownership", "মালিকানা"),
          body: (
            <p>
              {L(
                "On full payment, you own the final website, its code and your content. We may reuse general-purpose techniques and non-confidential components, and we may show the finished project in our portfolio unless you ask us not to.",
                "পুরো পেমেন্টের পর চূড়ান্ত ওয়েবসাইট, এর কোড ও আপনার কনটেন্টের মালিক আপনি। আমরা সাধারণ কৌশল ও গোপনীয় নয় এমন কম্পোনেন্ট পুনরায় ব্যবহার করতে পারি, এবং আপনি নিষেধ না করলে সম্পন্ন প্রজেক্টটি আমাদের পোর্টফোলিওতে দেখাতে পারি।",
              )}
            </p>
          ),
        },
        {
          id: "content",
          title: L("Comments and user content", "কমেন্ট ও ব্যবহারকারীর কনটেন্ট"),
          body: (
            <p>
              {L(
                "You're responsible for anything you post. We may hide or remove comments that are abusive, spam or unlawful. By posting, you allow us to display your comment on the site.",
                "আপনি যা পোস্ট করেন তার দায়িত্ব আপনার। আপত্তিকর, স্প্যাম বা বেআইনি কমেন্ট আমরা লুকিয়ে বা সরিয়ে দিতে পারি। পোস্ট করার মাধ্যমে আপনি আমাদের সাইটে কমেন্টটি দেখানোর অনুমতি দিচ্ছেন।",
              )}
            </p>
          ),
        },
        {
          id: "liability",
          title: L("Warranty and liability", "নিশ্চয়তা ও দায়"),
          body: (
            <p>
              {L(
                'We build with care and fix defects reported during the free support period. Beyond that, the site is provided "as is", and our total liability for any project is limited to the amount paid for that project.',
                "আমরা যত্ন নিয়ে কাজ করি এবং ফ্রি সাপোর্টের সময়ে জানানো ত্রুটি ঠিক করে দিই। এর বাইরে সাইটটি “যেমন আছে” অবস্থায় দেওয়া হয়, এবং কোনো প্রজেক্টের জন্য আমাদের মোট দায় সেই প্রজেক্টে পরিশোধিত অর্থের মধ্যে সীমিত।",
              )}
            </p>
          ),
        },
        {
          id: "contact",
          title: L("Contact", "যোগাযোগ"),
          body: (
            <p>
              {L("Questions about these terms? Email ", "এই শর্তাবলি নিয়ে প্রশ্ন? ইমেইল করুন ")}
              <a className="font-medium text-neutral-950 underline" href={`mailto:${site.email}`}>
                {site.email}
              </a>
              {L(".", "-এ।")}
            </p>
          ),
        },
      ]}
    />
  );
}
