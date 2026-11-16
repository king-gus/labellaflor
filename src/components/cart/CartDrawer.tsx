"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { FREE_SHIPPING_FROM_CENTS } from "@/lib/products";

export function CartDrawer() {
  const {
    open,
    setOpen,
    lines,
    count,
    subtotalCents,
    shippingCents,
    totalCents,
    freeShippingRemainingCents,
    format,
    setQuantity,
    removeItem,
  } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal aria-label="Carrinho">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label="Fechar carrinho"
        onClick={() => setOpen(false)}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bg shadow-[-12px_0_40px_rgba(0,0,0,0.12)]">
        <header className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <div>
            <p className="font-display text-xl">Carrinho</p>
            <p className="text-[0.75rem] text-muted">
              {count === 0
                ? "Vazio"
                : `${count} ${count === 1 ? "item" : "itens"}`}
            </p>
          </div>
          <button
            type="button"
            className="min-h-11 min-w-11 text-[0.75rem] uppercase tracking-wider text-muted hover:text-ink"
            onClick={() => setOpen(false)}
          >
            Fechar
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-2xl">Nada por aqui ainda</p>
              <p className="mt-2 text-sm text-muted">
                Escolha uma peça nas novidades.
              </p>
              <Link
                href="/#novidades"
                className="btn mt-8"
                onClick={() => setOpen(false)}
              >
                Ver novidades
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {lines.map((line) => (
                <li
                  key={`${line.productId}-${line.size}`}
                  className="flex gap-4 border-b border-ink/8 pb-5"
                >
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-surface">
                    <Image
                      src={line.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.95rem] leading-snug">
                      {line.name}
                    </p>
                    <p className="mt-1 text-[0.75rem] text-muted">
                      Tam. {line.size}
                    </p>
                    <p className="mt-2 text-[0.875rem]">
                      {format(line.priceCents)}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center border border-ink/15">
                        <button
                          type="button"
                          className="min-h-10 min-w-10 text-lg"
                          aria-label="Diminuir"
                          onClick={() =>
                            setQuantity(
                              line.productId,
                              line.size,
                              line.quantity - 1,
                            )
                          }
                        >
                          −
                        </button>
                        <span className="min-w-8 text-center text-sm">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="min-h-10 min-w-10 text-lg"
                          aria-label="Aumentar"
                          onClick={() =>
                            setQuantity(
                              line.productId,
                              line.size,
                              line.quantity + 1,
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-[0.7rem] uppercase tracking-wider text-muted underline-offset-2 hover:text-ink hover:underline"
                        onClick={() =>
                          removeItem(line.productId, line.size)
                        }
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="border-t border-ink/10 px-5 py-5">
            {freeShippingRemainingCents > 0 ? (
              <p className="mb-3 text-[0.75rem] text-muted">
                Faltam {format(freeShippingRemainingCents)} para frete grátis
                (a partir de {format(FREE_SHIPPING_FROM_CENTS)}).
              </p>
            ) : (
              <p className="mb-3 text-[0.75rem] text-accent">
                Frete grátis neste pedido.
              </p>
            )}
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>{format(subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Frete</dt>
                <dd>
                  {shippingCents === 0 ? "Grátis" : format(shippingCents)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-medium">
                <dt>Total</dt>
                <dd>{format(totalCents)}</dd>
              </div>
            </dl>
            <Link
              href="/checkout"
              className="btn mt-5 w-full"
              onClick={() => setOpen(false)}
            >
              Finalizar compra
            </Link>
            <Link
              href="/carrinho"
              className="mt-3 block text-center text-[0.75rem] uppercase tracking-wider text-muted hover:text-ink"
              onClick={() => setOpen(false)}
            >
              Ver carrinho
            </Link>
          </footer>
        )}
      </aside>
    </div>
  );
}
