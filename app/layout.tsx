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
    openGraph: {
      type: "website",
      siteName: site.legalName,
      title,
      description,
      url: site.url,
      locale: locale === "bn" ? "bn_BD" : "en_US",
      alternateLocale: locale === "bn" ? ["en_US"] : ["bn_BD"],
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.legalName,
  url: site.url,
  email: site.email,
  description: site.description,
  areaServed: "Worldwide",
  address: { "@type": "PostalAddress", addressCountry: "BD", addressLocality: "Dhaka" },
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