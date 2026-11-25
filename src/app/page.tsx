import { Suspense } from "react";
import { SiteNav } from "@/components/SiteNav";
import { Hero } from "@/components/Hero";
import { Visit } from "@/components/Visit";
import { Novidades } from "@/components/Novidades";
import { Categorias } from "@/components/Categorias";
import { PhotoChapters } from "@/components/PhotoChapters";
import { BleedStory } from "@/components/BleedStory";
import { WordMoment } from "@/components/WordMoment";
import { CloseFooter } from "@/components/CloseFooter";
import { PhoneBar } from "@/components/PhoneBar";

/**
 * place · shop · Caraguatatuba
 * remodel deal: nav-split | footer-visit | colour-band | arrow | logo | pair | bleed | name
 * moments: word-highlight + photo-chapters
 * brand: #006078 + neutros do feed · Cormorant / Montserrat
 * vibe: chic · casual · moderna (conjuntos, linho, luz clara)
 * CTA: Carrinho + checkout (Stone / Pagar.me)
 */
export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <Suspense
          fallback={
            <section className="py-20 md:py-28">
              <div className="wrap text-muted">Carregando novidades…</div>
            </section>
          }
        >
          <Novidades />
        </Suspense>
        <Categorias />
        <PhotoChapters />
        <BleedStory />
        <WordMoment />
        <Visit />
      </main>
      <CloseFooter />
      <PhoneBar />
    </>
  );
}
