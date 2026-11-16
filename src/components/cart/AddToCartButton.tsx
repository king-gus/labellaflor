"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { SIZES, type Size } from "@/lib/products";

type Props = {
  productId: string;
  className?: string;
  label?: string;
  fullWidth?: boolean;
};

export function AddToCartButton({
  productId,
  className = "btn btn--sm btn--ghost",
  label = "Adicionar",
  fullWidth,
}: Props) {
  const { addItem } = useCart();
  const [size, setSize] = useState<Size>("M");
  const [picking, setPicking] = useState(false);

  if (!picking) {
    return (
      <button
        type="button"
        className={`${className}${fullWidth ? " w-full" : ""}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPicking(true);
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      className={`flex flex-col gap-2${fullWidth ? " w-full" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tamanho">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            className={`min-h-10 min-w-10 px-2 text-[0.75rem] tracking-wide transition ${
              size === s
                ? "bg-accent text-accent-ink"
                : "bg-surface text-ink hover:bg-ink/8"
            }`}
            aria-pressed={size === s}
            onClick={() => setSize(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <button
        type="button"
        className={`btn btn--sm${fullWidth ? " w-full" : ""}`}
        onClick={() => {
          addItem(productId, size);
          setPicking(false);
        }}
      >
        Adicionar · {size}
      </button>
    </div>
  );
}
