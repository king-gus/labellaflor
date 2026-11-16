import type { Size } from "@/lib/products";

export type CartItem = {
  productId: string;
  size: Size;
  quantity: number;
};

export type CartLine = CartItem & {
  name: string;
  image: string;
  priceCents: number;
  lineTotalCents: number;
};

export const CART_STORAGE_KEY = "labellaflor-cart-v1";

export function cartLineKey(productId: string, size: Size) {
  return `${productId}::${size}`;
}
