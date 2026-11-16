import { BrandMark } from "@/components/BrandMark";
import { SITE, whatsappUrl } from "@/lib/site";

export function CloseFooter() {
  return (
    <footer className="closing">
      {/* colour-band close */}
      <div className="bg-accent py-20 text-accent-ink md:py-28">
        <div className="wrap flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] text-white">
              Peça sua próxima peça
            </h2>
            <p className="mt-4 text-[1.05rem] text-white/75">
              Envio para todo o Brasil. Atendimento pelo WhatsApp.
            </p>
          </div>
          <a href={whatsappUrl()} className="btn btn--on-dark shrink-0">
            {SITE.cta}
          </a>
        </div>
        <p className="wrap mt-16 font-display text-[clamp(2.75rem,11vw,7.5rem)] leading-none tracking-[-0.03em] text-white/20 md:mt-24">
          La Bella Flor
        </p>
      </div>

      {/* footer-visit */}
      <div className="border-t border-ink/10 bg-ink py-14 text-[0.875rem] text-white/70">
        <div className="wrap grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <BrandMark tone="light" size="md" />
            <p className="mt-5 max-w-xs leading-relaxed text-white/55">
              Boutique de roupas em Caraguatatuba. Chic, casual e moderna.
            </p>
          </div>
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/40">
              Visita
            </p>
            <ul className="mt-4 space-y-2">
              <li>Caraguatatuba, SP</li>
              <li>Litoral Norte</li>
              <li>{SITE.shipping}</li>
              <li className="pt-2">
                <a href={whatsappUrl()} className="link-draw text-white">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/40">
              Loja
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#novidades" className="link-draw text-white">
                  Novidades
                </a>
              </li>
              <li>
                <a href="#categorias" className="link-draw text-white">
                  Categorias
                </a>
              </li>
              <li>
                <a href="#capitulos" className="link-draw text-white">
                  A loja
                </a>
              </li>
              <li>
                <a
                  href={SITE.instagram}
                  className="link-draw text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="wrap mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-[0.72rem] text-white/35 md:flex-row md:justify-between">
          <p>© 2026 {SITE.name}</p>
          <p>
            Fotos oficiais do Conjunto Luana (@labellaflor.boutique) e imagens
            de vitrine no mesmo estilo.
          </p>
        </div>
      </div>
    </footer>
  );
}
