"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { CloseFooter } from "@/components/CloseFooter";
import { useCart } from "@/components/cart/CartProvider";
import { FREE_SHIPPING_FROM_CENTS } from "@/lib/products";

export default function CarrinhoPage() {
  const {
    lines,
    count,
    subtotalCents,
    shippingCents,
    totalCents,
    freeShippingRemainingCents,
    format,
    setQuantity,
    removeItem,
    setOpen,
  } = useCart();

  return (
    <>
      <SiteNav />
      <main className="pb-24 pt-10 md:pt-14">
        <div className="wrap">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-accent">
            Sua compra
          </p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)]">
            Carrinho
          </h1>
          <p className="mt-2 text-muted">
            {count === 0
              ? "Seu carrinho está vazio."
              : `${count} ${count === 1 ? "item" : "itens"} selecionados.`}
          </p>

          {lines.length === 0 ? (
            <div className="mt-16 max-w-md">
              <Link href="/#novidades" className="btn">
                Ver novidades
              </Link>
            </div>
          ) : (
            <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_0.8fr]">
              <ul className="space-y-6">
                {lines.map((line) => (
                  <li
                    key={`${line.productId}-${line.size}`}
                    className="flex gap-5 border-b border-ink/10 pb-6"
                  >
                    <div className="relative h-36 w-28 shrink-0 overflow-hidden bg-surface md:h-40 md:w-32">
                      <Image
                        src={line.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-xl leading-snug">
                            {line.name}
                          </p>
                          <p className="mt-1 text-sm text-muted">
                            Tamanho {line.size}
                          </p>
                        </div>
                        <p className="text-sm">{format(line.lineTotalCents)}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <div className="flex items-center border border-ink/15">
                          <button
                            type="button"
                            className="min-h-11 min-w-11"
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
                          <span className="min-w-10 text-center text-sm">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            className="min-h-11 min-w-11"
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
                          className="text-[0.7rem] uppercase tracking-wider text-muted hover:text-ink"
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

              <aside className="h-fit border border-ink/10 bg-surface/60 p-6 md:p-8">
                <h2 className="font-display text-2xl">Resumo</h2>
                {freeShippingRemainingCents > 0 ? (
                  <p className="mt-3 text-sm text-muted">
                    Faltam {format(freeShippingRemainingCents)} para frete
                    grátis (a partir de {format(FREE_SHIPPING_FROM_CENTS)}).
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-accent">Frete grátis.</p>
                )}
                <dl className="mt-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">Subtotal</dt>
                    <dd>{format(subtotalCents)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Frete</dt>
                    <dd>
                      {shippingCents === 0
                        ? "Grátis"
                        : format(shippingCents)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-medium">
                    <dt>Total</dt>
                    <dd>{format(totalCents)}</dd>
                  </div>
                </dl>
                <Link href="/checkout" className="btn mt-8 w-full">
                  Ir para o checkout
                </Link>
                <button
                  type="button"
                  className="mt-4 w-full text-center text-[0.75rem] uppercase tracking-wider text-muted hover:text-ink"
                  onClick={() => setOpen(true)}
                >
                  Abrir resumo rápido
                </button>
              </aside>
            </div>
          )}
        </div>
      </main>
      <CloseFooter />
    </>
  );
}
