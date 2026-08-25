import type { Metadata } from "next";

import "./globals.css";

import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer";
import ConstructionPopup from "@/app/components/construction-popup";

export const metadata: Metadata = {
  title:
    "Nirdeshona Web — Web Development, Design & Digital Solutions",

  description:
    "Web development, WordPress, Next.js, and digital solutions from Nirdeshona Web.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-950 antialiased">
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