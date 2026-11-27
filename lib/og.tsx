import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

// Social share image (1200×630) in the site's style. Hind Siliguri covers
// Latin and Bangla, so titles in either language render correctly.
export const OG_SIZE = { width: 1200, height: 630 };

const fontFiles = Promise.all(
  ["latin-700", "bengali-700", "latin-500", "bengali-500"].map((f) =>
    readFile(join(process.cwd(), `assets/fonts/hind-siliguri-${f}-normal.woff`)),
  ),
);

export async function renderOgImage({ title, eyebrow, footer }: { title: string; eyebrow?: string; footer?: string }) {
  const [l700, b700, l500, b500] = await fontFiles;
  const size = title.length > 70 ? 54 : title.length > 40 ? 64 : 76;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 55%, #e9e9e9 100%)",
          fontFamily: "HindLatin, HindBengali",
          color: "#0a0a0a",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#0a0a0a",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            N
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>Nirdeshona Web</span>
            <span style={{ fontSize: 20, fontWeight: 500, color: "#737373", letterSpacing: 3 }}>WEB DEVELOPMENT</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {eyebrow && (
            <span
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "8px 18px",
                borderRadius: 999,
                border: "1px solid #d4d4d4",
                background: "#fff",
                fontSize: 22,
                fontWeight: 500,
                color: "#525252",
              }}
            >
              {eyebrow}
            </span>
          )}
          <span style={{ fontSize: size, fontWeight: 700, lineHeight: 1.15, letterSpacing: -1, maxWidth: 1000 }}>{title}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 24, color: "#525252" }}>
          <span>{footer ?? "web.nirdeshona.com"}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 12, height: 12, borderRadius: 999, background: "#10b981" }} />
            Websites · Web apps · Android · Social media
          </span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "HindLatin", data: l700, weight: 700, style: "normal" },
        { name: "HindLatin", data: l500, weight: 500, style: "normal" },
        { name: "HindBengali", data: b700, weight: 700, style: "normal" },
        { name: "HindBengali", data: b500, weight: 500, style: "normal" },
      ],
    },
  );
}
