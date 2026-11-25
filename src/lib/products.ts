export type Product = {
  id: string;
  name: string;
  /** Price in centavos (BRL) */
  priceCents: number;
  category: string;
  /** Capa (primeira imagem) */
  image: string;
  /** Galeria completa (capa + extras) */
  images: string[];
};

export const SIZES = ["P", "M", "G", "GG"] as const;
export type Size = (typeof SIZES)[number];

export const CATEGORIES = [
  "Conjuntos",
  "Vestidos",
  "Blusas",
  "Saias e shorts",
  "Tricô",
] as const;

/** Frete fixo; grátis a partir deste valor (centavos). */
export const SHIPPING_CENTS = 2500;
export const FREE_SHIPPING_FROM_CENTS = 29900;

/** Catálogo inicial vazio — produtos vêm só do admin / Neon. */
export const PRODUCTS: Product[] = [];

export const CHAPTERS = [
  {
    n: "01",
    title: "No provador",
    body: "Conjunto em azul céu — caimento leve no dia a dia.",
    image: "/img/hq-provador.jpg",
  },
  {
    n: "02",
    title: "Conjunto Luana",
    body: "Viscose com linho, saia-shorts transpassada com ilhós. Preto e azul céu.",
    image: "/img/luana-hi-1.jpg",
  },
  {
    n: "03",
    title: "Luz de boutique",
    body: "Peças leves no tom chic, casual e moderna.",
    image: "/img/hq-look-preto.jpg",
  },
] as const;

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

export function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function shippingForSubtotal(subtotalCents: number) {
  if (subtotalCents <= 0) return 0;
  if (subtotalCents >= FREE_SHIPPING_FROM_CENTS) return 0;
  return SHIPPING_CENTS;
}
