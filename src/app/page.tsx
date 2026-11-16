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
 * CTA: Comprar no WhatsApp
 */
export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <Novidades />
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
