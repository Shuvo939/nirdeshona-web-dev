"use client";

import "./globals.css";
// Tiro Bangla for Bangla script only; Latin text keeps the sans stack.
import "@fontsource/tiro-bangla/bengali-400.css";

import ErrorView from "@/app/components/error-view";

// Replaces the root layout when it fails, so it brings its own document.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="bn">
      <body className="font-bangla bg-white text-neutral-950 antialiased">
        <title>Something went wrong — Nirdeshona Web</title>
        <ErrorView error={error} retry={retry} />
      </body>
    </html>
  );
}
