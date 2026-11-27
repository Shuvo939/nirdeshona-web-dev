import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS home-screen icon, drawn from the same "N" mark as icon.svg.
export default function AppleIcon() {
  return new ImageResponse(<BrandMark size={180} />, size);
}

export function BrandMark({ size }: { size: number }) {
  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="16 14 32 36">
        <path d="M20 46V18h5.2l13.6 18.7V18H44v28h-5.2L25.2 27.3V46z" fill="#fff" />
      </svg>
    </div>
  );
}
