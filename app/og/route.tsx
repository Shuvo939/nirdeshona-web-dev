import { renderOgImage } from "@/lib/og";

// Share image for any page: /og?title=…&eyebrow=…
// Inputs are only rendered as text, and lengths are capped.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  // The image renderer can't shape Bangla conjuncts, so Bangla text falls back to the brand line.
  const bangla = /[\u0980-\u09FF]/;
  const fallback = "Websites, web apps and digital products that work for real people.";
  const rawTitle = params.get("title") || fallback;
  const title = (bangla.test(rawTitle) ? fallback : rawTitle).slice(0, 120);
  const rawEyebrow = params.get("eyebrow")?.slice(0, 40);
  const eyebrow = rawEyebrow && !bangla.test(rawEyebrow) ? rawEyebrow : undefined;
  const image = await renderOgImage({ title, eyebrow });
  image.headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400");
  return image;
}
