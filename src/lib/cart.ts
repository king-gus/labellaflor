import type { Size } from "@/lib/products";

/** Payload mínimo enviado às APIs (frete/checkout). */
export type CartRequestItem = {
  productId: string;
  size: Size;
  quantity: number;
};

export type CartItem = CartRequestItem & {
  /** Snapshot do produto no momento da adição (admin/Neon). */
  name: string;
  image: string;
  priceCents: number;
};

export type CartLine = CartItem & {
  lineTotalCents: number;
};

export const CART_STORAGE_KEY = "labellaflor-cart-v2";

export function cartLineKey(productId: string, size: Size) {
  return `${productId}::${size}`;
}
