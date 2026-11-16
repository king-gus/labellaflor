import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin · La Bella Flor",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-ink/10 bg-bg/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/admin" className="font-display text-xl text-accent">
            Admin · La Bella Flor
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted">
            <Link href="/admin/produtos" className="hover:text-ink">
              Produtos
            </Link>
            <Link href="/admin/pedidos" className="hover:text-ink">
              Pedidos
            </Link>
            <Link href="/" className="hover:text-ink">
              Ver loja
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
