"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Seconds to delay (use index * 0.06 for staggered grids) */
  delay?: number;
  /** Pixels to travel up from */
  y?: number;
  className?: string;
}

/**
 * Fades + slides content up the first time it scrolls into view.
 * Elements already in view on load animate in as an entrance.
 */
export function Reveal({ children, delay = 0, y = 26, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
