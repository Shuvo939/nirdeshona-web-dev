/** @type {import('next').NextConfig} */

// Baseline security headers for every response. (No script-src CSP yet:
// Next.js inline scripts and future chat widgets would need nonces.)
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Google's sign-in popup needs to talk back to this window.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'; upgrade-insecure-requests",
  },
];

const nextConfig = {
  poweredByHeader: false,
  // Admin forms send compressed images (~400 KB) with the form itself, so
  // nothing is uploaded unless the save succeeds. Vercel caps bodies at 4.5 MB.
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
  // Share-image fonts are read from disk on Node (lib/og.tsx); make sure the
  // serverless functions carry them.
  outputFileTracingIncludes: { "/**": ["./public/og-fonts/**"] },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
