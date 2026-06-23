"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface CountUpProps {
  /** Display string like "10,000+", "98%", "12+", "4.8★" */
  value: string;
  durationMs?: number;
  className?: string;
}

/**
 * Counts the numeric portion of a display string up from 0 the first time
 * it scrolls into view, preserving any prefix/suffix (+, %, ★, commas).
 */
export function CountUp({ value, durationMs = 1400, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(() => formatZero(value));

  const match = value.match(/[\d.,]+/);
  const numStr = match ? match[0].replace(/,/g, "") : "";
  const target = numStr ? parseFloat(numStr) : 0;
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  const prefix = match ? value.slice(0, match.index) : "";
  const suffix = match ? value.slice((match.index ?? 0) + match[0].length) : value;

  useEffect(() => {
    if (!inView || !match) {
      if (!match) setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const current = target * eased;
      setDisplay(prefix + formatNum(current, decimals) + suffix);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return <span ref={ref} className={className}>{display}</span>;
}

function formatNum(n: number, decimals: number): string {
  const fixed = n.toFixed(decimals);
  const [int, dec] = fixed.split(".");
  const withCommas = Number(int).toLocaleString("en-IN");
  return dec ? `${withCommas}.${dec}` : withCommas;
}

function formatZero(value: string): string {
  const match = value.match(/[\d.,]+/);
  if (!match) return value;
  const numStr = match[0].replace(/,/g, "");
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  const prefix = value.slice(0, match.index);
  const suffix = value.slice((match.index ?? 0) + match[0].length);
  return prefix + (0).toFixed(decimals) + suffix;
}
