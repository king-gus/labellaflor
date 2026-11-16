import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { hasDatabase } from "@/lib/db";
import {
  deleteProduct,
  listAdminProducts,
  seedProductsFromStatic,
  upsertProduct,
} from "@/lib/catalog";
import { SIZES, type Size } from "@/lib/products";

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
  const products = await listAdminProducts();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (body.action === "seed") {
    await seedProductsFromStatic();
    return NextResponse.json({ ok: true });
  }

  const id = String(body.id || "").trim();
  const name = String(body.name || "").trim();
  const category = String(body.category || "").trim();
  const image = String(body.image || "").trim();
  const priceCents = Number(body.priceCents);
  if (!id || !name || !category || !image || !Number.isFinite(priceCents)) {
    return NextResponse.json({ error: "Dados do produto incompletos." }, { status: 400 });
  }

  const stockRaw = (body.stock || {}) as Partial<Record<Size, number>>;
  const stock: Partial<Record<Size, number>> = {};
  for (const size of SIZES) {
    stock[size] = Math.max(0, Math.floor(Number(stockRaw[size] || 0)));
  }

  await upsertProduct({
    id,
    name,
    category,
    image,
    priceCents: Math.max(0, Math.round(priceCents)),
    description: String(body.description || ""),
    active: body.active !== false,
    stock,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "id obrigatório." }, { status: 400 });
  }
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
