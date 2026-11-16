"use client";

import { useCart } from "@/components/cart/CartProvider";

export function CartButton({ className = "btn btn--sm" }: { className?: string }) {
  const { count, setOpen } = useCart();

  return (
    <button
      type="button"
      className={className}
      onClick={() => setOpen(true)}
      aria-label={
        count > 0 ? `Abrir carrinho, ${count} itens` : "Abrir carrinho"
      }
    >
      Carrinho{count > 0 ? ` (${count})` : ""}
    </button>
  );
}
