"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { SiteNav } from "@/components/SiteNav";
import { CloseFooter } from "@/components/CloseFooter";
import { useCart } from "@/components/cart/CartProvider";
import type { ShippingQuoteOption } from "@/lib/shipping";

type FormState = {
  name: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

const empty: FormState = {
  name: "",
  email: "",
  phone: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, items, subtotalCents, format, clear } = useCart();
  const [form, setForm] = useState<FormState>(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [options, setOptions] = useState<ShippingQuoteOption[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = useMemo(
    () => options.find((o) => o.id === selectedId) ?? null,
    [options, selectedId],
  );
  const shippingCents = selected?.priceCents ?? 0;
  const totalCents = subtotalCents + shippingCents;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    const cep = onlyDigits(form.cep);
    if (cep.length !== 8 || items.length === 0) {
      setOptions([]);
      setSelectedId(null);
      setQuoteError(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        const res = await fetch("/api/shipping/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cep, items }),
        });
        const data = (await res.json()) as {
          error?: string;
          options?: ShippingQuoteOption[];
        };
        if (cancelled) return;
        if (!res.ok || !data.options?.length) {
          setOptions([]);
          setSelectedId(null);
          setQuoteError(data.error || "Não foi possível cotar o frete.");
          return;
        }
        setOptions(data.options);
        setSelectedId(data.options[0].id);
      } catch {
        if (!cancelled) {
          setOptions([]);
          setSelectedId(null);
          setQuoteError("Falha ao consultar a SuperFrete.");
        }
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.cep, items]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    if (!selected) {
      setError("Escolha uma opção de frete antes de pagar.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer: form,
          shipping: {
            serviceId: selected.id,
            serviceName: `${selected.company} · ${selected.name}`,
            priceCents: selected.priceCents,
            deliveryDays: selected.deliveryDays,
          },
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        checkoutUrl?: string;
        orderId?: string;
        mode?: string;
      };
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error || "Não foi possível concluir o pedido.");
        setBusy(false);
        return;
      }
      clear();
      if (data.mode === "mercadopago") {
        window.location.href = data.checkoutUrl;
        return;
      }
      router.push(data.checkoutUrl);
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setBusy(false);
    }
  }

  if (lines.length === 0) {
    return (
      <>
        <SiteNav />
        <main className="wrap py-20">
          <h1 className="font-display text-3xl">Checkout</h1>
          <p className="mt-3 text-muted">Seu carrinho está vazio.</p>
          <Link href="/#novidades" className="btn mt-8">
            Ver novidades
          </Link>
        </main>
        <CloseFooter />
      </>
    );
  }

  return (
    <>
      <SiteNav />
      <main className="pb-24 pt-10 md:pt-14">
        <div className="wrap grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-accent">
              Pagamento seguro
            </p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)]">
              Checkout
            </h1>
            <p className="mt-2 max-w-md text-muted">
              Frete cotado pela SuperFrete. Pagamento no Mercado Pago (Pix,
              cartão ou boleto).
            </p>

            <form className="mt-10 space-y-8" onSubmit={onSubmit}>
              <fieldset className="space-y-4">
                <legend className="font-display text-xl">Contato</legend>
                <Field
                  label="Nome completo"
                  value={form.name}
                  onChange={(v) => update("name", v)}
                  autoComplete="name"
                  required
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="E-mail"
                    type="email"
                    value={form.email}
                    onChange={(v) => update("email", v)}
                    autoComplete="email"
                    required
                  />
                  <Field
                    label="Telefone / WhatsApp"
                    value={form.phone}
                    onChange={(v) => update("phone", v)}
                    autoComplete="tel"
                    required
                  />
                </div>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="font-display text-xl">Entrega</legend>
                <Field
                  label="CEP"
                  value={form.cep}
                  onChange={(v) => update("cep", v)}
                  autoComplete="postal-code"
                  required
                />
                <Field
                  label="Rua"
                  value={form.street}
                  onChange={(v) => update("street", v)}
                  autoComplete="address-line1"
                  required
                />
                <div className="grid gap-4 md:grid-cols-[0.4fr_1fr]">
                  <Field
                    label="Número"
                    value={form.number}
                    onChange={(v) => update("number", v)}
                    required
                  />
                  <Field
                    label="Complemento"
                    value={form.complement}
                    onChange={(v) => update("complement", v)}
                  />
                </div>
                <Field
                  label="Bairro"
                  value={form.neighborhood}
                  onChange={(v) => update("neighborhood", v)}
                  required
                />
                <div className="grid gap-4 md:grid-cols-[1fr_0.35fr]">
                  <Field
                    label="Cidade"
                    value={form.city}
                    onChange={(v) => update("city", v)}
                    autoComplete="address-level2"
                    required
                  />
                  <Field
                    label="UF"
                    value={form.state}
                    onChange={(v) =>
                      update("state", v.toUpperCase().slice(0, 2))
                    }
                    autoComplete="address-level1"
                    required
                  />
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="font-display text-xl">Frete</legend>
                {onlyDigits(form.cep).length !== 8 && (
                  <p className="text-sm text-muted">
                    Digite o CEP completo para ver as opções da SuperFrete.
                  </p>
                )}
                {quoteLoading && (
                  <p className="text-sm text-muted">Calculando frete…</p>
                )}
                {quoteError && (
                  <p className="text-sm text-red-700" role="alert">
                    {quoteError}
                  </p>
                )}
                <ul className="space-y-2">
                  {options.map((opt) => {
                    const checked = selectedId === opt.id;
                    return (
                      <li key={opt.id}>
                        <label
                          className={`flex cursor-pointer items-start justify-between gap-4 border px-4 py-3 transition ${
                            checked
                              ? "border-accent bg-accent/5"
                              : "border-ink/12 hover:border-ink/25"
                          }`}
                        >
                          <span className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              className="mt-1"
                              checked={checked}
                              onChange={() => setSelectedId(opt.id)}
                            />
                            <span>
                              <span className="block text-sm font-medium">
                                {opt.company} · {opt.name}
                              </span>
                              {opt.deliveryDays != null && (
                                <span className="mt-0.5 block text-[0.75rem] text-muted">
                                  Prazo: até {opt.deliveryDays}{" "}
                                  {opt.deliveryDays === 1 ? "dia útil" : "dias úteis"}
                                </span>
                              )}
                            </span>
                          </span>
                          <span className="shrink-0 text-sm">
                            {format(opt.priceCents)}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>

              {error && (
                <p className="text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="btn w-full md:w-auto"
                disabled={busy || !selected}
              >
                {busy ? "Redirecionando…" : "Pagar agora"}
              </button>
            </form>
          </div>

          <aside className="h-fit border border-ink/10 bg-surface/60 p-6 md:sticky md:top-24 md:p-8">
            <h2 className="font-display text-2xl">Pedido</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {lines.map((line) => (
                <li
                  key={`${line.productId}-${line.size}`}
                  className="flex justify-between gap-4"
                >
                  <span className="text-muted">
                    {line.name} · {line.size} × {line.quantity}
                  </span>
                  <span>{format(line.lineTotalCents)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-ink/10 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>{format(subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Frete</dt>
                <dd>
                  {selected ? format(shippingCents) : "Calcule no CEP"}
                </dd>
              </div>
              <div className="flex justify-between text-base font-medium">
                <dt>Total</dt>
                <dd>{format(totalCents)}</dd>
              </div>
            </dl>
            <Link
              href="/carrinho"
              className="mt-6 inline-block text-[0.75rem] uppercase tracking-wider text-muted hover:text-ink"
            >
              Voltar ao carrinho
            </Link>
          </aside>
        </div>
      </main>
      <CloseFooter />
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 w-full border border-ink/15 bg-bg px-3 text-[0.95rem] outline-none transition focus:border-accent"
      />
    </label>
  );
}
