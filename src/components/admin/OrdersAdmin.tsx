"use client";

import { useEffect, useState } from "react";
import { formatBRL } from "@/lib/products";
import type { OrderRow, OrderStatus } from "@/lib/orders";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Aguardando pagamento",
  paid: "Pago",
  packing: "Separando",
  shipped: "Enviado",
  cancelled: "Cancelado",
};

export function OrdersAdmin() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setError(null);
    const res = await fetch("/api/admin/orders");
    const data = (await res.json()) as { orders?: OrderRow[]; error?: string };
    if (!res.ok) {
      setError(data.error || "Não foi possível carregar pedidos.");
      return;
    }
    setOrders(data.orders || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(
    order: OrderRow,
    patch: { status: OrderStatus; trackingCode: string; notes: string },
  ) {
    setBusyId(order.id);
    setError(null);
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, ...patch }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) setError(data.error || "Falha ao atualizar.");
    else await load();
    setBusyId(null);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Pedidos</h1>
        <p className="mt-1 text-sm text-muted">
          Acompanhe pagamentos, separe o pedido e registre o envio.
        </p>
      </div>

      {error && (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {orders.length === 0 && !error && (
        <p className="text-sm text-muted">Nenhum pedido ainda.</p>
      )}

      <ul className="space-y-6">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            busy={busyId === order.id}
            onSave={(patch) => save(order, patch)}
          />
        ))}
      </ul>
    </div>
  );
}

function OrderCard({
  order,
  busy,
  onSave,
}: {
  order: OrderRow;
  busy: boolean;
  onSave: (patch: {
    status: OrderStatus;
    trackingCode: string;
    notes: string;
  }) => void;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [trackingCode, setTrackingCode] = useState(order.trackingCode);
  const [notes, setNotes] = useState(order.notes);

  useEffect(() => {
    setStatus(order.status);
    setTrackingCode(order.trackingCode);
    setNotes(order.notes);
  }, [order]);

  return (
    <li className="border border-ink/10 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl">{order.id}</p>
          <p className="text-sm text-muted">
            {new Date(order.createdAt).toLocaleString("pt-BR")} ·{" "}
            {STATUS_LABEL[order.status]}
          </p>
        </div>
        <p className="text-sm font-medium">{formatBRL(order.totalCents)}</p>
      </div>

      <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
        <div>
          <p className="text-[0.7rem] uppercase tracking-wider text-muted">
            Cliente
          </p>
          <p>{order.customerName}</p>
          <p className="text-muted">{order.customerEmail}</p>
          <p className="text-muted">{order.customerPhone}</p>
        </div>
        <div>
          <p className="text-[0.7rem] uppercase tracking-wider text-muted">
            Entrega
          </p>
          <p>
            {order.addressStreet}, {order.addressNumber}
            {order.addressComplement ? ` · ${order.addressComplement}` : ""}
          </p>
          <p className="text-muted">
            {order.addressNeighborhood} · {order.addressCity}/{order.addressState}{" "}
            · CEP {order.addressCep}
          </p>
          <p className="mt-1 text-muted">
            Frete: {order.shippingServiceName || "—"} (
            {formatBRL(order.shippingCents)})
            {order.shippingDays != null
              ? ` · ${order.shippingDays} dia(s)`
              : ""}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-1 border-t border-ink/8 pt-3 text-sm">
        {order.items.map((item, idx) => (
          <li key={`${item.productId}-${item.size}-${idx}`} className="flex justify-between gap-3">
            <span>
              {item.productName} · {item.size} × {item.quantity}
            </span>
            <span>{formatBRL(item.unitPriceCents * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block text-[0.7rem] uppercase tracking-wider text-muted">
            Status
          </span>
          <select
            className="min-h-11 w-full border border-ink/15 bg-bg px-2"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
          >
            {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="mb-1 block text-[0.7rem] uppercase tracking-wider text-muted">
            Código de rastreio
          </span>
          <input
            className="min-h-11 w-full border border-ink/15 bg-bg px-3"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
          />
        </label>
        <label className="block text-sm md:col-span-3">
          <span className="mb-1 block text-[0.7rem] uppercase tracking-wider text-muted">
            Observações
          </span>
          <input
            className="min-h-11 w-full border border-ink/15 bg-bg px-3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
      </div>

      <button
        type="button"
        className="btn btn--sm mt-4"
        disabled={busy}
        onClick={() => onSave({ status, trackingCode, notes })}
      >
        {busy ? "Salvando…" : "Salvar pedido"}
      </button>
    </li>
  );
}
