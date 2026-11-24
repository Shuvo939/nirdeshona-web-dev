"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Eases a displayed percentage toward `target`, so progress climbs smoothly
 * instead of jumping 0 → 100 when work finishes in a few large steps.
 */
export function useSmoothProgress(target: number | null) {
  const [shown, setShown] = useState(0);
  const value = useRef(0);

  useEffect(() => {
    if (target === null) {
      value.current = 0;
      setShown(0);
      return;
    }
    let frame = 0;
    const tick = () => {
      const diff = target - value.current;
      // Move ~12% of the remaining distance per frame (at least 0.6%), never overshooting.
      value.current = Math.abs(diff) < 0.6 ? target : value.current + Math.max(0.6, Math.abs(diff) * 0.12) * Math.sign(diff);
      setShown(Math.round(value.current));
      if (value.current !== target) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return shown;
}
