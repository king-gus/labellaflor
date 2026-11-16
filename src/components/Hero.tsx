import Image from "next/image";
import { SITE, whatsappUrl } from "@/lib/site";

export function Hero() {
  return (
    <section id="top" className="pb-16 md:pb-24">
      {/* Place hero: full-bleed photograph, nothing on it */}
      <div className="relative h-[min(72vh,680px)] w-full overflow-hidden bg-surface md:h-[min(80vh,760px)]">
        <Image
          src="/img/luana-hi-1.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_18%]"
        />
      </div>

      <div className="wrap mt-10 grid gap-8 md:mt-14 md:grid-cols-[1.1fr_0.9fr] md:items-end md:gap-16">
        <div>
          <p
            data-enter="1"
            className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-accent"
          >
            {SITE.tagline}
          </p>
          <p
            data-enter="2"
            className="mt-4 font-display text-[clamp(3rem,8vw,5.5rem)] leading-[0.92] text-accent"
          >
            La Bella Flor
          </p>
          <h1
            data-enter="3"
            className="mt-5 max-w-md font-display text-[clamp(1.5rem,2.8vw,2.15rem)] leading-[1.15] text-ink"
          >
            Boutique de roupas em Caraguatatuba
          </h1>
        </div>
        <div data-enter="4" className="md:pb-1">
          <p className="max-w-sm text-[0.95rem] leading-relaxed text-muted md:text-[1.05rem]">
            Conjuntos, vestidos e peças leves no tom chic, casual e moderno. Loja
            online com envio para todo o Brasil.
          </p>
          <a href={whatsappUrl()} className="btn mt-8">
            {SITE.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
