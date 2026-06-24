"use client";

import { useState, useEffect } from "react";

interface Slide {
  src: string;
  alt: string;
}

/**
 * Full-bleed background slideshow that crossfades between travel images.
 * The active slide gets a slow Ken-Burns drift; transitions are pure opacity.
 */
export function HeroSlideshow({
  slides,
  intervalMs = 5500,
}: {
  slides: Slide[];
  intervalMs?: number;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(
      () => setActive((a) => (a + 1) % slides.length),
      intervalMs
    );
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  return (
    <div className="absolute inset-0 -z-20 overflow-hidden bg-ink-900">
      {slides.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={s.src}
          src={s.src}
          alt={i === active ? s.alt : ""}
          aria-hidden={i !== active}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-in-out ${
            i === active ? "animate-kenburns opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
