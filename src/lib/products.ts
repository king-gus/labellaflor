export type Product = {
  id: string;
  name: string;
  price: string;
  category: string;
  image: string;
};

export const CATEGORIES = [
  "Conjuntos",
  "Vestidos",
  "Blusas",
  "Saias e shorts",
  "Tricô",
] as const;

/**
 * Mantém só as 2 fotos oficiais do Instagram (luana-hi-1 / luana-hi-2).
 * Demais imagens: geradas em alta no estilo Conjunto Luana.
 */
export const PRODUCTS: Product[] = [
  {
    id: "luana-preto",
    name: "Conjunto Luana — Preto",
    price: "R$ 359,90",
    category: "Conjuntos",
    image: "/img/luana-hi-1.jpg",
  },
  {
    id: "luana-azul",
    name: "Conjunto Luana — Azul céu",
    price: "R$ 359,90",
    category: "Conjuntos",
    image: "/img/hq-azul.jpg",
  },
  {
    id: "luana-provador",
    name: "Luana no provador",
    price: "R$ 359,90",
    category: "Conjuntos",
    image: "/img/hq-provador.jpg",
  },
  {
    id: "blusa-azul",
    name: "Blusa Azul Claro",
    price: "R$ 129",
    category: "Blusas",
    image: "/img/hq-blusa.jpg",
  },
  {
    id: "saia-envelope",
    name: "Saia Envelope",
    price: "R$ 159",
    category: "Saias e shorts",
    image: "/img/hq-saia.jpg",
  },
  {
    id: "luana-detalhe",
    name: "Conjunto Luana — detalhe",
    price: "R$ 359,90",
    category: "Conjuntos",
    image: "/img/luana-hi-2.jpg",
  },
  {
    id: "top-menta",
    name: "Top Menta",
    price: "R$ 119",
    category: "Blusas",
    image: "/img/hq-menta.jpg",
  },
  {
    id: "conjunto-menta",
    name: "Conjunto Menta",
    price: "R$ 239",
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
