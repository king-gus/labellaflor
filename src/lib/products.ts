export type Product = {
  id: string;
  name: string;
  /** Price in centavos (BRL) */
  priceCents: number;
  category: string;
  image: string;
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

/**
 * Mantém só as 2 fotos oficiais do Instagram (luana-hi-1 / luana-hi-2).
 * Demais imagens: geradas em alta no estilo Conjunto Luana.
 */
export const PRODUCTS: Product[] = [
  {
    id: "luana-preto",
    name: "Conjunto Luana — Preto",
    priceCents: 35990,
    category: "Conjuntos",
    image: "/img/luana-hi-1.jpg",
  },
  {
    id: "luana-azul",
    name: "Conjunto Luana — Azul céu",
    priceCents: 35990,
    category: "Conjuntos",
    image: "/img/hq-azul.jpg",
  },
  {
    id: "luana-provador",
    name: "Luana no provador",
    priceCents: 35990,
    category: "Conjuntos",
    image: "/img/hq-provador.jpg",
  },
  {
    id: "blusa-azul",
    name: "Blusa Azul Claro",
    priceCents: 12900,
    category: "Blusas",
    image: "/img/hq-blusa.jpg",
  },
  {
    id: "saia-envelope",
    name: "Saia Envelope",
    priceCents: 15900,
    category: "Saias e shorts",
    image: "/img/hq-saia.jpg",
  },
  {
    id: "luana-detalhe",
    name: "Conjunto Luana — detalhe",
    priceCents: 35990,
    category: "Conjuntos",
    image: "/img/luana-hi-2.jpg",
  },
  {
    id: "top-menta",
    name: "Top Menta",
    priceCents: 11900,
    category: "Blusas",
    image: "/img/hq-menta.jpg",
  },
  {
    id: "conjunto-menta",
    name: "Conjunto Menta",
    priceCents: 23900,
    category: "Conjuntos",
    image: "/img/hq-set-menta.jpg",
  },
];

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
