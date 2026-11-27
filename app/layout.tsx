import type { Metadata, Viewport } from "next";
import { Suspense } from "react";

import "./globals.css";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/500.css";
import "@fontsource/hind-siliguri/600.css";
import "@fontsource/hind-siliguri/700.css";

import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer";
import NavigationProgress from "@/app/components/navigation-progress";
import { site } from "@/lib/site";
import { jsonLd } from "@/lib/json-ld";
import { socialMeta } from "@/lib/seo";
import { LocaleProvider } from "@/lib/i18n/client";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { L, locale } = await getI18n();
  const title = L("Nirdeshona Web — Web Development, Design & Digital Solutions", "নির্দেশনা ওয়েব — ওয়েব ডেভেলপমেন্ট, ডিজাইন ও ডিজিটাল সমাধান");
  const description = L(
    site.description,
    "প্রতিষ্ঠান, ব্যবসা ও ব্যক্তির জন্য আধুনিক ওয়েবসাইট, ওয়েব অ্যাপ ও ওয়ার্ডপ্রেস সমাধান — মোবাইল-ফার্স্ট ডিজাইন, টেকসই নির্মাণ এবং লঞ্চের পরও নিয়মিত সাপোর্ট।",
  );
  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: "%s" },
    description,
    applicationName: site.legalName,
    authors: [{ name: site.legalName, url: site.url }],
    creator: site.legalName,
    publisher: site.legalName,
    category: "technology",
    keywords: L(
      "web development Bangladesh, website design Dhaka, web app development, WordPress developer, Next.js agency, Android app development, Facebook page setup, Facebook ads, social media management, e-commerce website",
      "ওয়েবসাইট তৈরি, ওয়েব ডেভেলপমেন্ট বাংলাদেশ, ওয়েবসাইট ডিজাইন ঢাকা, ওয়েব অ্যাপ, ওয়ার্ডপ্রেস, অ্যান্ড্রয়েড অ্যাপ তৈরি, ফেসবুক পেজ সেটআপ, ফেসবুক বিজ্ঞাপন, বুস্ট, সোশ্যাল মিডিয়া ব্যবস্থাপনা, ই-কমার্স ওয়েবসাইট",
    ).split(", "),
    formatDetection: { telephone: false, email: false, address: false },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    // Set in Vercel to verify the site in Google Search Console / Bing Webmaster Tools.
    verification: {
      ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
      ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
    },
    ...socialMeta({ title, description, path: "/", locale }),
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${site.url}/#organization`,
      name: site.legalName,
      alternateName: ["Nirdeshona Web", "নির্দেশনা ওয়েব"],
      url: site.url,
      logo: `${site.url}/icon.svg`,
      image: `${site.url}/og`,
      email: site.email,
      telephone: site.phone,
      description: site.description,
      priceRange: "৳৳",
      areaServed: [{ "@type": "Country", name: "Bangladesh" }, "Worldwide"],
      address: { "@type": "PostalAddress", addressCountry: "BD", addressLocality: "Dhaka" },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: site.email,
        telephone: site.phone,
        availableLanguage: ["Bengali", "English"],
      },
      knowsAbout: ["Web development", "Next.js", "WordPress", "UI/UX design", "E-commerce", "Android app development", "Facebook marketing"],
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.legalName,
      inLanguage: ["bn-BD", "en"],
      publisher: { "@id": `${site.url}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${site.url}/bn/search?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale } = await getI18n();
  return (
    <html lang={locale === "bn" ? "bn" : "en"}>
      <body className={`min-h-screen bg-white text-neutral-950 antialiased ${locale === "bn" ? "font-bangla" : ""}`}>
        <LocaleProvider locale={locale}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationJsonLd) }}
        />
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <div className="flex min-h-screen flex-col">

          <Header />

          <main className="flex-1">
            {children}
          </main>

          <Footer />

        </div>
        </LocaleProvider>
      </body>
    </html>
  );
}