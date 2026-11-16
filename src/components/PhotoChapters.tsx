"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CHAPTERS } from "@/lib/products";

export function PhotoChapters() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setActive(CHAPTERS.length - 1);
      return;
    }

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const view = window.innerHeight || 1;
      const progress = Math.min(
        1,
        Math.max(0, (view * 0.55 - rect.top) / Math.max(rect.height - view * 0.35, 1)),
      );
      setActive(Math.min(CHAPTERS.length - 1, Math.floor(progress * CHAPTERS.length)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const chapter = CHAPTERS[active] ?? CHAPTERS[0];

  return (
    <section
      ref={ref}
      id="capitulos"
      className="chapters py-20 md:py-28"
      style={{ minHeight: "180vh" }}
      aria-label="A loja em capítulos"
    >
      <div className="wrap sticky top-[calc(var(--nav-h)+1rem)]">
        <h2 className="font-display text-[clamp(1.85rem,3.2vw,2.5rem)] leading-tight">
          A loja
        </h2>
        <p className="mt-3 max-w-md text-muted">
          O clima das Bellas: luz clara, peças leves e o caimento do dia a dia.
        </p>

        <div className="chapters__stage mt-10">
          {CHAPTERS.map((item, index) => (
            <div
              key={item.n}
              className={`chapters__shot ${index === active ? "is-active" : ""}`}
            >
              <Image
                src={item.image}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                priority={index === 0}
              />
            </div>
          ))}
          <div className="chapters__panel">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted">
              {chapter.n}
            </p>
            <p className="mt-2 font-display text-[1.45rem] leading-tight">{chapter.title}</p>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">{chapter.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
