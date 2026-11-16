import Image from "next/image";
import { SITE, whatsappUrl } from "@/lib/site";

export function Visit() {
  return (
    <section id="visita" className="bg-surface py-20 md:py-28">
      <div className="wrap grid items-start gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <h2 className="font-display text-[clamp(1.85rem,3.2vw,2.5rem)] leading-tight">
            Encontre a gente
          </h2>
          {/* type moment: name — brand name set large */}
          <p className="mt-6 font-display text-[clamp(2.75rem,7vw,4.75rem)] leading-[0.95] tracking-[-0.03em] text-accent">
            {SITE.shortName}
          </p>
          <p className="mt-3 text-[0.95rem] text-muted">
            Caraguatatuba · Litoral Norte de São Paulo
          </p>

          <dl className="mt-12 space-y-6 border-t border-ink/10 pt-8 text-[0.9375rem]">
            <div className="grid gap-1 sm:grid-cols-[9rem_1fr]">
              <dt className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted">
                Loja online
              </dt>
              <dd>{SITE.shipping}</dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[9rem_1fr]">
              <dt className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted">
                Pedidos
              </dt>
              <dd>Loja online com carrinho · segunda a sábado</dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[9rem_1fr]">
              <dt className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted">
                Instagram
              </dt>
              <dd>
                <a
                  href={SITE.instagram}
                  className="link-draw"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {SITE.handle}
                </a>
              </dd>
            </div>
          </dl>

          <a
            href={whatsappUrl(
              "Olá! Tenho uma dúvida sobre a Loja La Bella Flor.",
            )}
            className="link-draw mt-10 inline-flex text-[0.8rem] font-medium uppercase tracking-[0.12em]"
          >
            Dúvidas no WhatsApp
          </a>
        </div>

        <div className="photo-frame aspect-square w-full md:aspect-[4/5]">
          <Image
            src="/img/luana-hi-1.jpg"
            alt=""
            width={900}
            height={1125}
            className="h-full w-full object-cover"
            sizes="(min-width: 768px) 45vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
