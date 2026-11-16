import Image from "next/image";
import { PRODUCTS, formatBRL } from "@/lib/products";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export function Novidades() {
  const lead = PRODUCTS.slice(0, 2);
  const rest = PRODUCTS.slice(2);

  return (
    <section id="novidades" className="py-20 md:py-28">
      <div className="wrap">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-lg">
            <h2 className="font-display text-[clamp(1.85rem,3.2vw,2.5rem)] leading-tight">
              Novidades
            </h2>
            <p className="mt-3 text-muted">
              Conjunto Luana em preto e azul céu — viscose com linho, P ao GG.
              Adicione ao carrinho e finalize no site.
            </p>
          </div>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-2 md:gap-8">
          {lead.map((product) => (
            <li key={product.id} className="product-card">
              <div className="block">
                <span className="photo-frame aspect-square">
                  <Image
                    src={product.image}
                    alt=""
                    width={900}
                    height={900}
                    className="h-full w-full object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </span>
                <span className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <span>
                    <span className="block font-display text-[1.35rem] leading-snug">
                      {product.name}
                    </span>
                    <span className="mt-1 block text-[0.8125rem] tracking-wide text-muted">
                      {formatBRL(product.priceCents)}
                    </span>
                  </span>
                  <AddToCartButton productId={product.id} />
                </span>
              </div>
            </li>
          ))}
        </ul>

        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-14 md:grid-cols-3 md:gap-x-7">
          {rest.map((product) => (
            <li key={product.id} className="product-card">
              <div className="block">
                <span className="photo-frame aspect-square">
                  <Image
                    src={product.image}
                    alt=""
                    width={700}
                    height={700}
                    className="h-full w-full object-cover"
                    sizes="(min-width: 768px) 33vw, 50vw"
                  />
                </span>
                <span className="mt-4 block">
                  <span className="block text-[0.9375rem] leading-snug">
                    {product.name}
                  </span>
                  <span className="mt-1 block text-[0.8125rem] text-muted">
                    {formatBRL(product.priceCents)}
                  </span>
                </span>
                <div className="mt-4">
                  <AddToCartButton productId={product.id} fullWidth />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
