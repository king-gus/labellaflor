import { CATEGORIES } from "@/lib/products";

export function Categorias() {
  return (
    <section id="categorias" className="border-y border-ink/10 py-20 md:py-24">
      <div className="wrap grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-end md:gap-20">
        <div>
          <h2 className="font-display text-[clamp(1.85rem,3.2vw,2.5rem)] leading-tight">
            Categorias
          </h2>
          <p className="mt-4 max-w-sm text-muted">
            Do conjunto do dia ao vestido fluido — o que você encontra na boutique.
          </p>
        </div>
        <ul>
          {CATEGORIES.map((category) => (
            <li key={category} className="border-t border-ink/12 last:border-b">
              <a
                href="#novidades"
                className="group flex items-center justify-between py-5 text-[1.2rem] md:text-[1.35rem]"
              >
                <span className="font-display transition-colors group-hover:text-accent">
                  {category}
                </span>
                <span
                  aria-hidden
                  className="text-muted transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-accent"
                >
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
