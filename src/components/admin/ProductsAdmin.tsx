"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CATEGORIES, SIZES, formatBRL, type Size } from "@/lib/products";
import type { AdminProduct } from "@/lib/catalog";

type FormState = {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  description: string;
  active: boolean;
  stock: Record<Size, string>;
};

function emptyForm(): FormState {
  return {
    id: "",
    name: "",
    category: CATEGORIES[0],
    price: "",
    image: "/img/luana-hi-1.jpg",
    description: "",
    active: true,
    stock: { P: "0", M: "0", G: "0", GG: "0" },
  };
}

function fromProduct(p: AdminProduct): FormState {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: (p.priceCents / 100).toFixed(2).replace(".", ","),
    image: p.image,
    description: p.description,
    active: p.active,
    stock: {
      P: String(p.stock.P),
      M: String(p.stock.M),
      G: String(p.stock.G),
      GG: String(p.stock.GG),
    },
  };
}

export function ProductsAdmin() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setError(null);
    const res = await fetch("/api/admin/products");
    const data = (await res.json()) as {
      products?: AdminProduct[];
      error?: string;
    };
    if (!res.ok) {
      setError(data.error || "Não foi possível carregar produtos.");
      return;
    }
    setProducts(data.products || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const priceNumber = Number(
      form.price.replace(/\./g, "").replace(",", "."),
    );
    const priceCents = Math.round(priceNumber * 100);
    const stock = Object.fromEntries(
      SIZES.map((s) => [s, Number(form.stock[s] || 0)]),
    ) as Record<Size, number>;

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id || form.name.toLowerCase().replace(/\s+/g, "-"),
          name: form.name,
          category: form.category,
          image: form.image,
          description: form.description,
          active: form.active,
          priceCents,
          stock,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Falha ao salvar.");
        setBusy(false);
        return;
      }
      setMessage("Produto salvo.");
      setForm(emptyForm());
      await load();
    } catch {
      setError("Falha de conexão.");
    } finally {
      setBusy(false);
    }
  }

  async function seed() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "seed" }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) setError(data.error || "Falha no seed.");
    else {
      setMessage("Catálogo inicial importado (5 un. por tamanho).");
      await load();
    }
    setBusy(false);
  }

  async function remove(id: string) {
    if (!confirm(`Excluir produto ${id}?`)) return;
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) setError(data.error || "Falha ao excluir.");
    else await load();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin";
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Produtos</h1>
          <p className="mt-1 text-sm text-muted">
            Cadastro, preço, imagem e quantidade por tamanho (P/M/G/GG).
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn--ghost btn--sm" onClick={seed} disabled={busy}>
            Importar catálogo atual
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
            Sair
          </button>
        </div>
      </div>

      {error && (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {message && (
        <p className="border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent">
          {message}
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-4 border border-ink/10 p-5">
        <h2 className="font-display text-xl">
          {form.id ? "Editar produto" : "Novo produto"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="ID (slug)"
            value={form.id}
            onChange={(v) => setForm((f) => ({ ...f, id: v }))}
            placeholder="luana-preto"
            required
          />
          <Field
            label="Nome"
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            required
          />
          <label className="block">
            <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted">
              Categoria
            </span>
            <select
              className="min-h-12 w-full border border-ink/15 bg-bg px-3"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Preço (R$)"
            value={form.price}
            onChange={(v) => setForm((f) => ({ ...f, price: v }))}
            placeholder="359,90"
            required
          />
          <Field
            label="URL da imagem"
            value={form.image}
            onChange={(v) => setForm((f) => ({ ...f, image: v }))}
            required
          />
          <label className="flex items-center gap-2 pt-7 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
            />
            Ativo na loja
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted">
            Descrição
          </span>
          <textarea
            className="min-h-24 w-full border border-ink/15 bg-bg px-3 py-2"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </label>
        <div>
          <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted">
            Estoque por tamanho
          </p>
          <div className="grid grid-cols-4 gap-2">
            {SIZES.map((size) => (
              <label key={size} className="block text-center">
                <span className="mb-1 block text-xs text-muted">{size}</span>
                <input
                  type="number"
                  min={0}
                  className="min-h-11 w-full border border-ink/15 bg-bg px-2 text-center"
                  value={form.stock[size]}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      stock: { ...f.stock, [size]: e.target.value },
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn" disabled={busy}>
            {busy ? "Salvando…" : "Salvar produto"}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setForm(emptyForm())}
          >
            Limpar
          </button>
        </div>
      </form>

      <ul className="space-y-3">
        {products.map((p) => (
          <li
            key={p.id}
            className="flex flex-col gap-3 border border-ink/10 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-display text-lg">
                {p.name}{" "}
                {!p.active && (
                  <span className="text-sm text-muted">(inativo)</span>
                )}
              </p>
              <p className="text-sm text-muted">
                {p.category} · {formatBRL(p.priceCents)} · {p.id}
              </p>
              <p className="mt-1 text-xs text-muted">
                Estoque:{" "}
                {SIZES.map((s) => `${s} ${p.stock[s]}`).join(" · ")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setForm(fromProduct(p))}
              >
                Editar
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => remove(p.id)}
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      <input
        className="min-h-12 w-full border border-ink/15 bg-bg px-3"
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
