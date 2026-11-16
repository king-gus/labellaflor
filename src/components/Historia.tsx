import Image from "next/image";
import { SITE } from "@/lib/site";

export function Historia() {
  return (
    <section id="historia" className="py-[var(--pad-section)]">
      <div className="wrap grid items-center gap-10 md:grid-cols-2 md:gap-14">
        <div>
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight">
            Uma boutique do litoral
          </h2>
          <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-muted">
            A {SITE.shortName} nasceu em Caraguatatuba para quem quer vestir bem no dia a dia:
            peças chic, casuais e modernas, escolhidas com cuidado e enviadas para todo o Brasil.
          </p>
        </div>
        <div className="photo-frame aspect-[4/3]">
          <Image
            src="/products/look-1.jpg"
            alt=""
            width={900}
            height={675}
            className="h-full w-full object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
