"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CART_STORAGE_KEY,
  cartLineKey,
  type CartItem,
  type CartLine,
} from "@/lib/cart";
import {
  FREE_SHIPPING_FROM_CENTS,
  formatBRL,
  shippingForSubtotal,
  type Size,
} from "@/lib/products";

type CartContextValue = {
  items: CartItem[];
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  freeShippingRemainingCents: number;
  format: typeof formatBRL;
  open: boolean;
  setOpen: (open: boolean) => void;
  addItem: (
    product: {
      productId: string;
      name: string;
      image: string;
      priceCents: number;
    },
    size: Size,
    quantity?: number,
  ) => void;
  setQuantity: (productId: string, size: Size, quantity: number) => void;
  removeItem: (productId: string, size: Size) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalize(items: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of items) {
    if (!item.productId || item.quantity < 1 || !item.name) continue;
    const key = cartLineKey(item.productId, item.size);
    const prev = map.get(key);
    if (prev) {
      map.set(key, { ...prev, quantity: prev.quantity + item.quantity });
    } else {
      map.set(key, item);
    }
  }
  return [...map.values()];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) setItems(normalize(JSON.parse(raw) as CartItem[]));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback(
    (
      product: {
        productId: string;
        name: string;
        image: string;
        priceCents: number;
      },
      size: Size,
      quantity = 1,
    ) => {
      if (!product.productId || quantity < 1 || !product.name) return;
      setItems((prev) =>
        normalize([
          ...prev,
          {
            productId: product.productId,
            size,
            quantity,
            name: product.name,
            image: product.image,
            priceCents: product.priceCents,
          },
        ]),
      );
      setOpen(true);
    },
    [],
  );

  const setQuantity = useCallback(
    (productId: string, size: Size, quantity: number) => {
      setItems((prev) => {
        if (quantity < 1) {
          return prev.filter(
            (i) => !(i.productId === productId && i.size === size),
          );
        }
        return prev.map((i) =>
          i.productId === productId && i.size === size
            ? { ...i, quantity }
            : i,
        );
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string, size: Size) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.size === size)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const lines = useMemo<CartLine[]>(
    () =>
      items.map((item) => ({
        ...item,
        lineTotalCents: item.priceCents * item.quantity,
      })),
    [items],
  );

  const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
  const shippingCents = shippingForSubtotal(subtotalCents);
  const totalCents = subtotalCents + shippingCents;
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const freeShippingRemainingCents = Math.max(
    0,
    FREE_SHIPPING_FROM_CENTS - subtotalCents,
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      lines,
      count,
      subtotalCents,
      shippingCents,
      totalCents,
      freeShippingRemainingCents,
      format: formatBRL,
      open,
      setOpen,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [
      items,
      lines,
      count,
      subtotalCents,
      shippingCents,
      totalCents,
      freeShippingRemainingCents,
      open,
      addItem,
      setQuantity,
      removeItem,
      clear,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
