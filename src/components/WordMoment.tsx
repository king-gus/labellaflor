"use client";

import { useEffect, useRef, useState } from "react";

const WORDS = [
  { text: "Chic.", accent: false },
  { text: "Casual.", accent: false },
  { text: "Moderna.", accent: true },
  { text: "Como", accent: false },
  { text: "as", accent: false },
  { text: "Bellas", accent: true },
  { text: "vestem", accent: false },
  { text: "em", accent: false },
  { text: "Caraguatatuba.", accent: false },
];

export function WordMoment() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setActive(WORDS.length);
      return;
    }

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const mid = (window.innerHeight || 1) * 0.5;
      const start = rect.top;
      const end = rect.bottom;
      if (end < mid || start > mid) {
        setActive(start > mid ? 0 : WORDS.length);
        return;
      }
      const progress = (mid - start) / Math.max(end - start, 1);
      setActive(Math.ceil(progress * WORDS.length));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={ref}
      id="momento"
      className="word-moment border-y border-ink/10 py-[min(26vh,11rem)]"
      aria-label="Estilo La Bella Flor"
    >
      <p className="wrap font-display text-[clamp(2.4rem,6.5vw,4.75rem)] leading-[1.12]">
        {WORDS.map((word, index) => (
          <span
            key={`${word.text}-${index}`}
            className={`word mr-[0.28em] inline-block ${index < active ? "is-on" : ""} ${
              index < active && word.accent ? "is-accent" : ""
            }`}
          >
            {word.text}
          </span>
        ))}
      </p>
    </section>
  );
}
