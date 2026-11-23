"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCw } from "lucide-react";

export type CaptchaValue = { token: string; answer: string };
type Challenge = { token: string; image: string };

async function fetchChallenge(): Promise<Challenge | null> {
  try {
    const res = await fetch("/api/captcha", { cache: "no-store" });
    return res.ok ? ((await res.json()) as Challenge) : null;
  } catch {
    return null;
  }
}

/**
 * One bordered box: the sum image | the answer | reload.
 * The first challenge is rendered on the server (instant); a spare is
 * prefetched so "reload" and post-error refreshes are instant too.
 * Bump `refreshKey` after every submit attempt — each challenge works once.
 */
export default function Captcha({
  initial,
  refreshKey = 0,
  onChange,
  name = "captcha",
}: {
  initial: Challenge;
  refreshKey?: number;
  onChange?: (value: CaptchaValue) => void;
  name?: string;
}) {
  const [challenge, setChallenge] = useState(initial);
  const [answer, setAnswer] = useState("");
  const [spinning, setSpinning] = useState(false);
  const spare = useRef<Promise<Challenge | null> | null>(null);
  const firstRender = useRef(true);

  const prefetch = useCallback(() => {
    spare.current = fetchChallenge();
  }, []);

  useEffect(() => {
    prefetch();
  }, [prefetch]);

  const next = useCallback(async () => {
    setSpinning(true);
    const ready = (await spare.current) ?? (await fetchChallenge());
    if (ready) setChallenge(ready);
    setAnswer("");
    prefetch();
    window.setTimeout(() => setSpinning(false), 500);
  }, [prefetch]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    void next();
  }, [refreshKey, next]);

  useEffect(() => {
    onChange?.({ token: challenge.token, answer });
  }, [challenge.token, answer, onChange]);

  return (
    <div>
      <label htmlFor={`${name}-answer`} className="mb-1.5 block text-xs font-medium text-neutral-600">
        Security check — solve the sum
      </label>
      <div className="flex h-12 items-stretch overflow-hidden rounded-xl border border-neutral-200 bg-white focus-within:border-neutral-950 focus-within:ring-2 focus-within:ring-neutral-950/10">
        <div className="flex shrink-0 items-center border-r border-neutral-200 bg-neutral-50 px-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={challenge.image} alt="Security check: solve the sum shown" className="h-[38px] w-auto select-none" draggable={false} />
        </div>
        <input
          id={`${name}-answer`}
          name={`${name}Answer`}
          value={answer}
          onChange={(e) => setAnswer(e.target.value.replace(/[^\d-]/g, "").slice(0, 3))}
          inputMode="numeric"
          autoComplete="off"
          placeholder="Answer"
          required
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
        />
        <input type="hidden" name={`${name}Token`} value={challenge.token} />
        <button
          type="button"
          onClick={() => void next()}
          aria-label="New security check"
          title="New sum"
          className="flex w-11 shrink-0 items-center justify-center border-l border-neutral-200 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
        >
          <RotateCw className={`h-4 w-4 ${spinning ? "animate-[spin_0.5s_linear_1]" : ""}`} />
        </button>
      </div>
    </div>
  );
}
