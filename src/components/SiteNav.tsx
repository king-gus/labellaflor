import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { CartButton } from "@/components/cart/CartButton";
import { SITE } from "@/lib/site";

const links = [
  { href: "/#novidades", label: "Novidades" },
  { href: "/#categorias", label: "Categorias" },
  { href: "/#capitulos", label: "A loja" },
  { href: "/#visita", label: "Visita" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/8 bg-bg/95 backdrop-blur-md">
      <nav
        className="wrap flex h-[var(--nav-h)] items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr]"
        aria-label="Principal"
      >
        <ul className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="link-draw text-[0.7rem] font-medium uppercase tracking-[0.14em] text-ink/80"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/" className="md:justify-self-center" aria-label={SITE.name}>
          <BrandMark size="sm" />
        </Link>

        <div className="md:justify-self-end">
          <CartButton />
        </div>
      </nav>
    </header>
  );
}
