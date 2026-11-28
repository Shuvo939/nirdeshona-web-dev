"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children into <body>. Needed for overlays opened from inside the
 * header: its backdrop-blur makes `position: fixed` relative to the header,
 * so a dialog would otherwise be pinned to the top of the screen.
 */
export default function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

/** Stops the page behind a dialog from scrolling (also on iOS / Android). */
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    const body = document.body;
    const prev = { html: html.style.overflow, body: body.style.overflow, pad: body.style.paddingRight };
    // Keep the layout from jumping when the desktop scrollbar disappears.
    const gap = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      html.style.overflow = prev.html;
      body.style.overflow = prev.body;
      body.style.paddingRight = prev.pad;
    };
  }, [active]);
}

/**
 * Height of the part of the screen that is actually visible. On phones the
 * browser's address bar slides in and out, and a `fixed inset-0` overlay can
 * keep the old height, leaving a bottom sheet floating above the bottom edge.
 * Give the overlay this height so its bottom always sits on the screen edge.
 */
export function useVisibleHeight(active = true) {
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    if (!active) return;
    const vv = window.visualViewport;
    const update = () => setHeight(vv ? vv.height + vv.offsetTop : window.innerHeight);
    update();
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [active]);
  return height;
}
