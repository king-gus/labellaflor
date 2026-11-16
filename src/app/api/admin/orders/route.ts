import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { hasDatabase } from "@/lib/db";
import { listOrders, updateOrder, type OrderStatus } from "@/lib/orders";

const STATUSES: OrderStatus[] = [
  "pending_payment",
  "paid",
  "packing",
  "shipped",
  "cancelled",
];

async function guard() {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  if (!hasDatabase()) {
    return NextResponse.json(
      { error: "DATABASE_URL não configurada. Configure o Neon primeiro." },
      { status: 503 },
    );
  }
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  const orders = await listOrders();
  return NextResponse.json({ orders });
}

export async function PATCH(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    status?: string;
    trackingCode?: string;
    notes?: string;
  } | null;

  if (!body?.id || !body.status || !STATUSES.includes(body.status as OrderStatus)) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  await updateOrder({
    id: body.id,
    status: body.status as OrderStatus,
    trackingCode: body.trackingCode,
    notes: body.notes,
  });

  return NextResponse.json({ ok: true });
}
