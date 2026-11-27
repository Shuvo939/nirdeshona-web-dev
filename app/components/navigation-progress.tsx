"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const START_EVENT = "nw:navigation-start";

// Call before router.push() so programmatic navigations show the bar too.
export function startNavigationProgress() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(START_EVENT));
}

function isNavigatingLink(anchor: HTMLAnchorElement, event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download") || anchor.hasAttribute("data-no-progress")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  if (url.pathname.startsWith("/api/")) return false;
  // Same page (only the hash differs) — no navigation.
  return url.pathname !== window.location.pathname || url.search !== window.location.search;
}

/**
 * Thin progress bar at the top of the page while moving between pages.
 * Starts on internal link clicks, back/forward and programmatic navigations,
 * trickles towards 90% and completes when the new route has rendered.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | null>(null);
  const safety = useRef<number | null>(null);
  const active = useRef(false);

  function clear() {
    if (timer.current) window.clearInterval(timer.current);
    if (safety.current) window.clearTimeout(safety.current);
    timer.current = null;
    safety.current = null;
  }

  function finish() {
    if (!active.current) return;
    active.current = false;
    clear();
    setProgress(100);
    window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => setProgress(0), 250);
    }, 220);
  }

  function start() {
    if (active.current) return;
    active.current = true;
    clear();
    setVisible(true);
    setProgress(8);
    timer.current = window.setInterval(() => {
      // Fast at first, slower as it approaches 90%.
      setProgress((p) => (p >= 90 ? p : p + Math.max(0.5, (90 - p) * 0.08)));
    }, 180);
    safety.current = window.setTimeout(finish, 15000);
  }

  // Route finished rendering → complete the bar.
  useEffect(() => {
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (anchor instanceof HTMLAnchorElement && isNavigatingLink(anchor, event)) start();
    }
    function onSubmit(event: SubmitEvent) {
      const form = event.target as HTMLFormElement;
      // GET forms (search boxes, filters) navigate to a new URL.
      if (!event.defaultPrevented && form.method.toLowerCase() === "get" && form.getAttribute("action")?.startsWith("/")) start();
    }
    const onPop = () => start();
    window.addEventListener("click", onClick, true);
    window.addEventListener("submit", onSubmit);
    window.addEventListener("popstate", onPop);
    window.addEventListener(START_EVENT, start);
    return () => {
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("submit", onSubmit);
      window.removeEventListener("popstate", onPop);
      window.removeEventListener(START_EVENT, start);
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[10000] h-[3px] transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        data-nav-progress
        className="relative h-full bg-neutral-950 shadow-[0_0_10px_rgba(10,10,10,0.5)] transition-[width] duration-200 ease-out motion-reduce:transition-none"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute right-0 top-0 h-full w-24 max-w-full bg-gradient-to-r from-transparent to-emerald-400/80" />
      </div>
    </div>
  );
}
