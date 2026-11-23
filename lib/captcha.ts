import "server-only";

import crypto from "node:crypto";

import { sql } from "@/lib/db";

/*
 * Own captcha (no third party):
 * - an easy sum (7+2, 11+2, 9−3) drawn as SVG strokes (no <text>, so the
 *   numbers can't simply be read from the markup)
 * - a signed token that carries only an HMAC of the answer, never the answer
 * - one-time use (captcha_used), at least 1.5 s old, expires after 10 min
 */

export type CaptchaChallenge = { token: string; image: string };

const MIN_AGE_MS = 1500;
const TTL_MS = 10 * 60 * 1000;

function secret() {
  const raw = process.env.AUTH_SECRET || process.env.SUPABASE_SECRET_KEY || process.env.DATABASE_URL;
  if (!raw) throw new Error("No secret available for captcha signing.");
  return crypto.createHash("sha256").update(`captcha:${raw}`).digest();
}

const b64 = (v: Buffer | string) => Buffer.from(v).toString("base64url");
const hmac = (data: string) => crypto.createHmac("sha256", secret()).update(data).digest("base64url");
const rand = (min: number, max: number) => crypto.randomInt(min, max + 1);

/* ---------------- stroke "font" (7-segment style + symbols) ---------------- */

// Segment endpoints in a 16×28 cell.
const SEG: Record<string, [number, number, number, number]> = {
  a: [2, 2, 14, 2],
  b: [14, 2, 14, 14],
  c: [14, 14, 14, 26],
  d: [2, 26, 14, 26],
  e: [2, 14, 2, 26],
  f: [2, 2, 2, 14],
  g: [2, 14, 14, 14],
};
const DIGITS: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abged",
  "3": "abgcd",
  "4": "fgbc",
  "5": "afgcd",
  "6": "afgedc",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
};
const SYMBOLS: Record<string, [number, number, number, number][]> = {
  "+": [
    [2, 14, 14, 14],
    [8, 8, 8, 20],
  ],
  "−": [[2, 14, 14, 14]],
  "=": [
    [2, 10, 14, 10],
    [2, 18, 14, 18],
  ],
  "?": [
    [3, 5, 8, 2],
    [8, 2, 13, 5],
    [13, 5, 13, 10],
    [13, 10, 8, 14],
    [8, 14, 8, 19],
    [8, 24, 8, 26],
  ],
};

function jitter(v: number) {
  return (v + (crypto.randomInt(0, 21) - 10) / 10).toFixed(1);
}

function glyph(ch: string, x: number) {
  const lines = DIGITS[ch] ? DIGITS[ch].split("").map((s) => SEG[s]) : (SYMBOLS[ch] ?? []);
  const rot = crypto.randomInt(-9, 10);
  const dy = crypto.randomInt(-3, 4);
  const d = lines.map(([x1, y1, x2, y2]) => `M${jitter(x1)} ${jitter(y1)}L${jitter(x2)} ${jitter(y2)}`).join("");
  return `<path transform="translate(${x} ${8 + dy}) rotate(${rot} 8 14)" d="${d}"/>`;
}

function renderSvg(text: string) {
  const chars = [...text];
  const width = 14 + chars.length * 21;
  const noise = Array.from({ length: 4 }, () => {
    const y1 = rand(6, 40);
    const y2 = rand(6, 40);
    return `<path d="M0 ${y1} Q${rand(20, width - 20)} ${rand(0, 46)} ${width} ${y2}" stroke="#a3a3a3" stroke-width="1" fill="none" opacity=".6"/>`;
  }).join("");
  const dots = Array.from({ length: 14 }, () => `<circle cx="${rand(0, width)}" cy="${rand(0, 46)}" r="${rand(5, 12) / 10}" fill="#a3a3a3"/>`).join("");
  const glyphs = chars.map((c, i) => glyph(c, 8 + i * 21)).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="46" viewBox="0 0 ${width} 46"><rect width="100%" height="100%" fill="#fafafa"/>${noise}${dots}<g stroke="#171717" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none">${glyphs}</g></svg>`;
}

/* ---------------- challenge + verification ---------------- */

export function createCaptcha(): CaptchaChallenge {
  const plus = crypto.randomInt(0, 3) > 0; // mostly additions
  const a = plus ? rand(2, 12) : rand(6, 15);
  const b = plus ? rand(1, 9) : rand(1, Math.min(9, a - 1));
  const answer = plus ? a + b : a - b;

  const jti = crypto.randomBytes(12).toString("hex");
  const now = Date.now();
  const payload = b64(JSON.stringify({ j: jti, i: now, e: now + TTL_MS, h: hmac(`answer:${jti}:${answer}`) }));
  const token = `${payload}.${hmac(payload)}`;
  const svg = renderSvg(`${a}${plus ? "+" : "−"}${b}=?`);
  return { token, image: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}` };
}

export async function verifyCaptcha(token: unknown, answer: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  const fail = (error = "Please solve the security check again.") => ({ ok: false as const, error });
  if (typeof token !== "string" || typeof answer !== "string") return fail("Please complete the security check.");

  const [payload, sig] = token.split(".");
  if (!payload || !sig) return fail();
  const expected = Buffer.from(hmac(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return fail();

  let data: { j: string; i: number; e: number; h: string };
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return fail();
  }

  const now = Date.now();
  if (now > data.e) return fail("The security check expired. Please try the new one.");
  if (now - data.i < MIN_AGE_MS) return fail("That was a little too fast — please try again.");

  // One attempt per challenge: consume it before checking the answer, so a
  // wrong guess can't be retried (no brute-forcing the small answer space).
  const inserted = await sql`insert into captcha_used (jti) values (${data.j}) on conflict do nothing returning jti`;
  if (inserted.length === 0) return fail();

  const clean = answer.trim().replace(/[^\d-]/g, "");
  if (!clean || hmac(`answer:${data.j}:${Number(clean)}`) !== data.h) return fail("The answer to the security check is wrong — try the new one.");

  // Occasional cleanup of old entries.
  if (crypto.randomInt(0, 50) === 0) {
    void sql`delete from captcha_used where used_at < now() - interval '1 day'`.catch(() => undefined);
  }
  return { ok: true };
}
