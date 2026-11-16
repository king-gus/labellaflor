"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { SITE } from "@/lib/site";

export function PhoneBar() {
  const { count, setOpen } = useCart();

  return (
    <div className="phone-bar">
      {count > 0 ? (
        <button type="button" className="btn w-full" onClick={() => setOpen(true)}>
          {SITE.cartCta}
          {count > 0 ? ` · ${count}` : ""}
        </button>
      ) : (
        <Link href="/#novidades" className="btn w-full">
          {SITE.cta}
        </Link>
      )}
    </div>
  );
}
