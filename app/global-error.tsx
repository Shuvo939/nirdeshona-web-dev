"use client";

import "./globals.css";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/600.css";
import "@fontsource/hind-siliguri/700.css";

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
