import Image from "next/image";

/** Place composition: bleed — head on wrap, then full-viewport photograph */
export function BleedStory() {
  return (
    <section id="historia" className="pb-4 pt-20 md:pt-28">
      <div className="wrap mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
        <h2 className="font-display text-[clamp(1.85rem,3.2vw,2.5rem)] leading-tight">
          Uma boutique do litoral
        </h2>
        <p className="max-w-sm text-[0.95rem] text-muted md:text-right">
          Peças escolhidas para o dia a dia em Caraguatatuba — leves, limpas e fáceis de vestir.
        </p>
      </div>
      <div className="relative h-[min(56vw,520px)] min-h-[280px] w-full overflow-hidden bg-surface">
        <Image
          src="/img/hq-look-preto.jpg"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>
    </section>
  );
}
