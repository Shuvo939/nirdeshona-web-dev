import type { Metadata } from "next";

import LegalPage from "@/app/components/legal-page";
import { pageMeta } from "@/lib/seo";
import { getI18n } from "@/lib/i18n/server";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { L, locale } = await getI18n();
  return pageMeta({
    locale,
    og: { title: "Privacy Policy" },
    path: "/privacy",
    title: L("Privacy Policy — Nirdeshona Web", "গোপনীয়তা নীতি — নির্দেশনা ওয়েব"),
    description: L(
      "How Nirdeshona Web Development collects, uses and protects your information.",
      "নির্দেশনা ওয়েব ডেভেলপমেন্ট কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষিত রাখে।",
    ),
  });
}

export default async function PrivacyPage() {
  const { L } = await getI18n();
  const mail = (
    <a className="font-medium text-neutral-950 underline" href={`mailto:${site.email}`}>
      {site.email}
    </a>
  );

  return (
    <LegalPage
      title={L("Privacy Policy", "গোপনীয়তা নীতি")}
      description={L(
        "How we collect, use and protect your information when you use this website and our client portal.",
        "এই ওয়েবসাইট ও আমাদের ক্লায়েন্ট পোর্টাল ব্যবহারের সময় আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষিত রাখি।",
      )}
      updated={L("28 November 2026", "২৮ নভেম্বর ২০২৬")}
      summary={[
        L("We only collect what we need to reply to you and deliver your project.", "আপনাকে উত্তর দিতে ও প্রজেক্ট সম্পন্ন করতে যতটুকু দরকার, শুধু ততটুকুই সংগ্রহ করি।"),
        L("We never sell your data or share it for advertising.", "আপনার তথ্য আমরা কখনো বিক্রি করি না বা বিজ্ঞাপনের জন্য শেয়ার করি না।"),
        L("Your data is stored with trusted providers and protected with access controls.", "আপনার তথ্য বিশ্বস্ত সেবাদাতার কাছে সংরক্ষিত এবং অ্যাক্সেস নিয়ন্ত্রণ দিয়ে সুরক্ষিত।"),
        L(
          `You can ask us to see, correct or delete your data at any time: ${site.email}.`,
          `যেকোনো সময় আপনার তথ্য দেখতে, সংশোধন বা মুছে ফেলতে বলতে পারেন: ${site.email}।`,
        ),
      ]}
      sections={[
        {
          id: "information",
          title: L("Information we collect", "আমরা যে তথ্য সংগ্রহ করি"),
          body: (
            <>
              <p>{L("We collect information you give us directly:", "আপনি সরাসরি যে তথ্য দেন, তা সংগ্রহ করি:")}</p>
              <ul>
                <li>
                  {L(
                    "Contact form details — name, email, phone, the service you're interested in, budget, message and any file you attach.",
                    "যোগাযোগ ফর্মের তথ্য — নাম, ইমেইল, ফোন, আগ্রহের সার্ভিস, বাজেট, বার্তা এবং সংযুক্ত ফাইল।",
                  )}
                </li>
                <li>
                  {L(
                    "Account details — name, email address and password (stored securely, never in plain text) when you register.",
                    "অ্যাকাউন্টের তথ্য — রেজিস্টার করলে নাম, ইমেইল ঠিকানা ও পাসওয়ার্ড (নিরাপদে সংরক্ষিত, কখনো সাধারণ লেখায় নয়)।",
                  )}
                </li>
                <li>{L("Client portal content — support tickets, messages and files you share with us.", "ক্লায়েন্ট পোর্টালের কনটেন্ট — সাপোর্ট টিকেট, বার্তা ও আপনার শেয়ার করা ফাইল।")}</li>
                <li>{L("Blog activity — comments and reactions you post while signed in.", "ব্লগে কার্যক্রম — লগইন অবস্থায় আপনার মন্তব্য ও রিঅ্যাকশন।")}</li>
              </ul>
              <p>
                {L(
                  "We also collect limited technical data automatically, such as an anonymous visitor identifier used to count article views fairly.",
                  "এছাড়া কিছু সীমিত কারিগরি তথ্য স্বয়ংক্রিয়ভাবে সংগ্রহ হয়, যেমন লেখার ভিউ ন্যায্যভাবে গোনার জন্য একটি বেনামি ভিজিটর আইডি।",
                )}
              </p>
            </>
          ),
        },
        {
          id: "use",
          title: L("How we use it", "যেভাবে ব্যবহার করি"),
          body: (
            <ul>
              <li>{L("To reply to enquiries and prepare quotes.", "অনুসন্ধানের উত্তর দিতে ও কোটেশন তৈরি করতে।")}</li>
              <li>{L("To deliver, support and maintain projects for our clients.", "ক্লায়েন্টদের প্রজেক্ট সম্পন্ন, সাপোর্ট ও রক্ষণাবেক্ষণ করতে।")}</li>
              <li>
                {L(
                  "To send transactional emails such as account confirmations, password resets and ticket updates.",
                  "অ্যাকাউন্ট নিশ্চিতকরণ, পাসওয়ার্ড রিসেট ও টিকেট আপডেটের মতো প্রয়োজনীয় ইমেইল পাঠাতে।",
                )}
              </li>
              <li>{L("To keep the site secure and prevent spam and abuse.", "সাইট নিরাপদ রাখতে এবং স্প্যাম ও অপব্যবহার ঠেকাতে।")}</li>
            </ul>
          ),
        },
        {
          id: "cookies",
          title: L("Cookies", "কুকি"),
          body: (
            <>
              <p>
                {L(
                  "We only use cookies that the site needs to work or that remember a choice you made. There are no advertising, analytics or cross-site tracking cookies — which is why we don't show a cookie banner.",
                  "আমরা শুধু সেই কুকিগুলোই ব্যবহার করি, যেগুলো ছাড়া সাইট চলে না অথবা যেগুলো আপনার নিজের বেছে নেওয়া পছন্দ মনে রাখে। বিজ্ঞাপন, অ্যানালিটিক্স বা অন্য সাইটে অনুসরণের কোনো কুকি নেই — তাই আমরা কুকি ব্যানার দেখাই না।",
                )}
              </p>
              <ul className="not-prose !ml-0 !list-none divide-y divide-neutral-200 border-y border-neutral-200 !pl-0">
                <li className="!ml-0 !list-none py-3 !pl-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-950">sb-…-auth-token</code>
                    <span className="text-xs text-neutral-500">{L("Until you close the browser or sign out; up to 400 days with “Remember me”", "ব্রাউজার বন্ধ বা লগআউট পর্যন্ত; “আমাকে মনে রাখুন” দিলে সর্বোচ্চ ৪০০ দিন")}</span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-700">{L("Keeps you signed in (split into numbered parts when large).", "লগইন ধরে রাখে (বড় হলে কয়েক ভাগে ভাগ হয়)।")}</p>
                </li>
                <li className="!ml-0 !list-none py-3 !pl-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-950">nw_remember</code>
                    <span className="text-xs text-neutral-500">{L("400 days", "৪০০ দিন")}</span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-700">{L("Remembers that you ticked “Remember me”.", "“আমাকে মনে রাখুন” বেছে নিয়েছেন কি না মনে রাখে।")}</p>
                </li>
                <li className="!ml-0 !list-none py-3 !pl-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-950">nw_locale</code>
                    <span className="text-xs text-neutral-500">{L("1 year", "১ বছর")}</span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-700">{L("Your language — Bangla or English.", "আপনার ভাষা — বাংলা বা ইংরেজি।")}</p>
                </li>
                <li className="!ml-0 !list-none py-3 !pl-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-950">nw_theme</code>
                    <span className="text-xs text-neutral-500">{L("1 year", "১ বছর")}</span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-700">{L("Light, dark or system theme.", "লাইট, ডার্ক বা সিস্টেম থিম।")}</p>
                </li>
              </ul>
              <p>
                {L(
                  "Counting article views uses no cookie. Each day we combine your IP address, browser and language with a secret value that changes every day, and keep only the resulting code. It can't be turned back into your IP address and can't link your visits on different days.",
                  "লেখার ভিউ গুনতে কোনো কুকি লাগে না। প্রতিদিন আপনার IP ঠিকানা, ব্রাউজার আর ভাষার সঙ্গে প্রতিদিন বদলানো একটি গোপন মান মিলিয়ে একটি কোড তৈরি হয়, আমরা শুধু সেই কোডটাই রাখি। এটা থেকে IP ঠিকানা বের করা যায় না, আর ভিন্ন দিনের ভিজিট একসঙ্গে জোড়াও যায় না।",
                )}
              </p>
              <p>
                {L(
                  "If you sign in with Google, Google may set its own cookies on its sign-in window under Google's privacy policy. You can delete or block cookies in your browser settings; the site will still work, but you'll be signed out and your language and theme will reset.",
                  "Google দিয়ে লগইন করলে Google তার নিজের লগইন উইন্ডোতে নিজস্ব গোপনীয়তা নীতি অনুযায়ী কুকি রাখতে পারে। ব্রাউজারের সেটিংস থেকে কুকি মুছে ফেলতে বা বন্ধ করতে পারেন; তাতে সাইট চলবে, তবে আপনি লগআউট হয়ে যাবেন আর ভাষা ও থিম আগের অবস্থায় ফিরে যাবে।",
                )}
              </p>
            </>
          ),
        },
        {
          id: "providers",
          title: L("Service providers", "সেবাদাতা প্রতিষ্ঠান"),
          body: (
            <>
              <p>
                {L(
                  "We rely on trusted providers to run this site. They process data only on our behalf:",
                  "এই সাইট চালাতে আমরা বিশ্বস্ত সেবাদাতার ওপর নির্ভর করি। তারা শুধু আমাদের পক্ষে তথ্য প্রক্রিয়া করে:",
                )}
              </p>
              <ul>
                <li>{L("Supabase — database and authentication.", "Supabase — ডেটাবেস ও অথেনটিকেশন।")}</li>
                <li>{L("Cloudflare — file storage (R2), DNS and security.", "Cloudflare — ফাইল সংরক্ষণ (R2), DNS ও নিরাপত্তা।")}</li>
                <li>{L("Vercel — website hosting.", "Vercel — ওয়েবসাইট হোস্টিং।")}</li>
                <li>{L("Resend — email delivery.", "Resend — ইমেইল পাঠানো।")}</li>
              </ul>
            </>
          ),
        },
        {
          id: "retention",
          title: L("Retention and security", "সংরক্ষণকাল ও নিরাপত্তা"),
          body: (
            <p>
              {L(
                "We keep enquiries for as long as needed to respond and follow up, and client project records for the duration of our working relationship plus any period required for accounting. Deleted items stay in a recycle bin for 30 days before they are removed permanently. Data is protected using HTTPS, access controls and database row-level security so clients can only see their own projects and tickets.",
                "অনুসন্ধানগুলো উত্তর ও পরবর্তী যোগাযোগের জন্য যতদিন দরকার ততদিন রাখি; ক্লায়েন্টের প্রজেক্টের রেকর্ড রাখি একসঙ্গে কাজের পুরো সময় এবং হিসাবের প্রয়োজনে নির্ধারিত সময় পর্যন্ত। মুছে ফেলা জিনিস স্থায়ীভাবে মোছার আগে ৩০ দিন রিসাইকেল বিনে থাকে। HTTPS, অ্যাক্সেস নিয়ন্ত্রণ ও ডেটাবেসের রো-লেভেল নিরাপত্তা দিয়ে তথ্য সুরক্ষিত রাখা হয়, তাই প্রত্যেক ক্লায়েন্ট শুধু নিজের প্রজেক্ট ও টিকেট দেখতে পান।",
              )}
            </p>
          ),
        },
        {
          id: "rights",
          title: L("Your rights", "আপনার অধিকার"),
          body: (
            <p>
              {L(
                "You can ask to access, correct, export or delete your personal information, or close your account, by emailing ",
                "আপনার ব্যক্তিগত তথ্য দেখা, সংশোধন, রপ্তানি বা মুছে ফেলা, কিংবা অ্যাকাউন্ট বন্ধের জন্য ইমেইল করুন ",
              )}
              {mail}
              {L(". We'll respond within 30 days.", "-এ। আমরা ৩০ দিনের মধ্যে উত্তর দেব।")}
            </p>
          ),
        },
        {
          id: "changes",
          title: L("Changes to this policy", "নীতিতে পরিবর্তন"),
          body: (
            <p>
              {L(
                "If we make material changes we'll update the date at the top of this page. Continued use of the site means you accept the updated policy.",
                "উল্লেখযোগ্য কোনো পরিবর্তন করলে এই পেজের ওপরের তারিখ হালনাগাদ করব। এরপরও সাইট ব্যবহার করলে ধরে নেওয়া হবে আপনি হালনাগাদ নীতি মেনে নিয়েছেন।",
              )}
            </p>
          ),
        },
      ]}
    />
  );
}
