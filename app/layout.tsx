import type { Metadata, Viewport } from "next";

import "./globals.css";

import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer";
import ConstructionPopup from "@/app/components/construction-popup";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Nirdeshona Web — Web Development, Design & Digital Solutions",
    template: "%s",
  },
  description: site.description,
  applicationName: site.legalName,
  openGraph: {
    type: "website",
    siteName: site.legalName,
    title: "Nirdeshona Web — Web Development, Design & Digital Solutions",
    description: site.description,
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-950 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <div className="flex min-h-screen flex-col">

          <Header />

          <main className="flex-1">
            {children}
          </main>

          <Footer />

        </div>
        <ConstructionPopup />
      </body>
    </html>
  );
}