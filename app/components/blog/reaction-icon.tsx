import { useId } from "react";

import type { ReactionType } from "@/lib/comments";

/**
 * Round, filled reaction icons (the Facebook-style look): a gradient disc that
 * fills the whole circle with a white glyph, or a face for wow / sad.
 * Pure SVG — crisp at any size and identical on every phone.
 */
export default function ReactionIcon({ type, size = 20, className = "" }: { type: ReactionType; size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const g = (name: string) => `${id}-${name}`;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={`shrink-0 ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={g("like")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3FA2FF" />
          <stop offset="1" stopColor="#0A66E8" />
        </linearGradient>
        <linearGradient id={g("love")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF6B81" />
          <stop offset="1" stopColor="#E5193F" />
        </linearGradient>
        <linearGradient id={g("helpful")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3DDC97" />
          <stop offset="1" stopColor="#0E9F6E" />
        </linearGradient>
        <linearGradient id={g("celebrate")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B57BFF" />
          <stop offset="1" stopColor="#7A3FE4" />
        </linearGradient>
        <linearGradient id={g("face")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFDA6A" />
          <stop offset="1" stopColor="#F5B02E" />
        </linearGradient>
      </defs>

      {type === "like" && (
        <>
          <circle cx="20" cy="20" r="20" fill={`url(#${g("like")})`} />
          <path
            fill="#fff"
            d="M11 18.2h3.6c.6 0 1 .4 1 1v9.6c0 .6-.4 1-1 1H11c-.6 0-1-.4-1-1v-9.6c0-.6.4-1 1-1Zm6.4.4 4.2-6.9c.5-.9 1.7-1.2 2.5-.6.7.4 1 1.3.8 2.1l-1.1 4.2h5.4c1.5 0 2.6 1.4 2.3 2.9l-1.6 7.6c-.3 1.2-1.3 2-2.5 2h-8.9c-.6 0-1.1-.5-1.1-1.1v-10.2Z"
          />
        </>
      )}

      {type === "love" && (
        <>
          <circle cx="20" cy="20" r="20" fill={`url(#${g("love")})`} />
          <path
            fill="#fff"
            d="M20 30.2s-9.6-5.7-9.6-12.3c0-3 2.3-5.3 5.2-5.3 1.9 0 3.5 1 4.4 2.5.9-1.5 2.5-2.5 4.4-2.5 2.9 0 5.2 2.3 5.2 5.3 0 6.6-9.6 12.3-9.6 12.3Z"
          />
        </>
      )}

      {type === "helpful" && (
        <>
          <circle cx="20" cy="20" r="20" fill={`url(#${g("helpful")})`} />
          {/* light bulb */}
          <path fill="#fff" d="M20 9.5c-4.4 0-7.8 3.4-7.8 7.6 0 2.6 1.3 4.6 3.1 6 .7.6 1.1 1.3 1.1 2.1v.9h7.2v-.9c0-.8.4-1.5 1.1-2.1 1.8-1.4 3.1-3.4 3.1-6 0-4.2-3.4-7.6-7.8-7.6Z" />
          <rect x="16.4" y="27.6" width="7.2" height="1.9" rx=".9" fill="#fff" />
          <rect x="17.4" y="30.3" width="5.2" height="1.9" rx=".9" fill="#fff" />
        </>
      )}

      {type === "celebrate" && (
        <>
          <circle cx="20" cy="20" r="20" fill={`url(#${g("celebrate")})`} />
          {/* party popper + confetti */}
          <path fill="#fff" d="M10.5 30.6 15 17.4l8.6 8.6-13.1 4.6Z" />
          <path fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" d="M21.5 11.2c.9 1.6.6 3.2-.7 4.6M26.6 18.7c1.5-1 3.2-1 4.6.2" />
          <circle cx="25.4" cy="12.4" r="1.4" fill="#fff" />
          <circle cx="29.4" cy="23.3" r="1.3" fill="#fff" />
          <path fill="#fff" d="m28.9 13.6.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6.6-1.5Z" />
        </>
      )}

      {(type === "wow" || type === "sad") && (
        <circle cx="20" cy="20" r="20" fill={`url(#${g("face")})`} />
      )}

      {type === "wow" && (
        <>
          <path fill="none" stroke="#8A4B0F" strokeWidth="1.6" strokeLinecap="round" d="M11.6 11.8c1.2-1.3 3-1.6 4.5-.9M28.4 11.8c-1.2-1.3-3-1.6-4.5-.9" />
          <ellipse cx="14" cy="17.4" rx="2.2" ry="2.8" fill="#3A2411" />
          <ellipse cx="26" cy="17.4" rx="2.2" ry="2.8" fill="#3A2411" />
          <ellipse cx="20" cy="27.6" rx="4" ry="5" fill="#6B3410" />
        </>
      )}

      {type === "sad" && (
        <>
          <path fill="none" stroke="#8A4B0F" strokeWidth="1.6" strokeLinecap="round" d="M10.8 15c1.7-.3 3.4-1.2 4.6-2.6M29.2 15c-1.7-.3-3.4-1.2-4.6-2.6" />
          <ellipse cx="14.4" cy="19.6" rx="2.1" ry="2.5" fill="#3A2411" />
          <ellipse cx="25.6" cy="19.6" rx="2.1" ry="2.5" fill="#3A2411" />
          <path fill="none" stroke="#6B3410" strokeWidth="2" strokeLinecap="round" d="M15.2 29.4c2.8-2.6 6.8-2.6 9.6 0" />
          <path fill="#3BA3F5" d="M29.6 22.6c1.3 2 2.2 3.4 2.2 4.6a2.2 2.2 0 0 1-4.4 0c0-1.2.9-2.6 2.2-4.6Z" />
        </>
      )}
    </svg>
  );
}
