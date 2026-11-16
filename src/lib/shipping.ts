import { getProduct } from "@/lib/products";
import type { CartItem } from "@/lib/cart";

/** Dimensões padrão de encomenda de roupa (cm / kg) quando o produto não define. */
export const DEFAULT_PACKAGE = {
  height: 8,
  width: 28,
  length: 36,
  weight: 0.45,
} as const;

export const SUPERFRETE_SERVICES = "1,2,17" as const;

export type ShippingQuoteOption = {
  id: number;
  name: string;
  company: string;
  priceCents: number;
  deliveryDays: number | null;
  currency: "BRL";
};

export type SuperfreteQuoteRaw = {
  id?: number;
  name?: string;
  company?: { name?: string } | string;
  price?: number | string;
  custom_price?: number | string;
  delivery_time?: number;
  custom_delivery_time?: number;
  has_error?: boolean;
  error?: string;
};

function digits(cep: string) {
  return cep.replace(/\D/g, "").slice(0, 8);
}

function toCents(value: number | string | undefined) {
  if (value == null) return null;
  const n = typeof value === "string" ? Number(value.replace(",", ".")) : value;
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function buildProductsPayload(items: CartItem[]) {
  return items.flatMap((item) => {
    const product = getProduct(item.productId);
    if (!product || item.quantity < 1) return [];
    return [
      {
        name: product.name,
        quantity: Math.min(item.quantity, 10),
        unitary_value: product.priceCents / 100,
        weight: DEFAULT_PACKAGE.weight,
        height: DEFAULT_PACKAGE.height,
        width: DEFAULT_PACKAGE.width,
        length: DEFAULT_PACKAGE.length,
      },
    ];
  });
}

export function mapSuperfreteQuotes(
  raw: SuperfreteQuoteRaw[],
): ShippingQuoteOption[] {
  return raw
    .filter((q) => !q.has_error && q.id != null)
    .map((q) => {
      const priceCents =
        toCents(q.custom_price) ?? toCents(q.price) ?? null;
      if (priceCents == null) return null;
      const company =
        typeof q.company === "string"
          ? q.company
          : q.company?.name || "Transportadora";
      return {
        id: q.id as number,
        name: q.name || `Serviço ${q.id}`,
        company,
        priceCents,
        deliveryDays: q.custom_delivery_time ?? q.delivery_time ?? null,
        currency: "BRL" as const,
      };
    })
    .filter((q): q is ShippingQuoteOption => q != null)
    .sort((a, b) => a.priceCents - b.priceCents);
}

export function superfreteBaseUrl() {
  return process.env.SUPERFRETE_SANDBOX === "true"
    ? "https://sandbox.superfrete.com"
    : "https://api.superfrete.com";
}

export async function quoteSuperfrete(args: {
  toCep: string;
  items: CartItem[];
  insuranceValueReais?: number;
}): Promise<ShippingQuoteOption[]> {
  const token = process.env.SUPERFRETE_TOKEN;
  const fromCep = digits(process.env.SUPERFRETE_ORIGIN_CEP || "");
  const toCep = digits(args.toCep);

  if (!token) {
    throw new Error("SUPERFRETE_TOKEN não configurado.");
  }
  if (fromCep.length !== 8) {
    throw new Error("SUPERFRETE_ORIGIN_CEP inválido (use 8 dígitos).");
  }
  if (toCep.length !== 8) {
    throw new Error("CEP de destino inválido.");
  }

  const products = buildProductsPayload(args.items);
  if (products.length === 0) {
    throw new Error("Carrinho sem produtos válidos para cotar.");
  }

  const userAgent =
    process.env.SUPERFRETE_USER_AGENT ||
    "LaBellaFlor/1.0 (contato@labellaflor.boutique)";

  const res = await fetch(`${superfreteBaseUrl()}/api/v0/calculator`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": userAgent,
    },
    body: JSON.stringify({
      from: { postal_code: fromCep },
      to: { postal_code: toCep },
      services: process.env.SUPERFRETE_SERVICES || SUPERFRETE_SERVICES,
      options: {
        own_hand: false,
        receipt: false,
        insurance_value: args.insuranceValueReais ?? 0,
        use_insurance_value: Boolean(args.insuranceValueReais),
      },
      products,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("SuperFrete quote error", res.status, detail);
    throw new Error("Não foi possível cotar o frete agora.");
  }

  const data = (await res.json()) as SuperfreteQuoteRaw[] | { data?: SuperfreteQuoteRaw[] };
  const list = Array.isArray(data) ? data : data.data || [];
  return mapSuperfreteQuotes(list);
}
