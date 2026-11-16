import { NextResponse } from "next/server";
import type { CartItem } from "@/lib/cart";
import { getStoreProduct } from "@/lib/catalog";
import { SIZES, type Size } from "@/lib/products";
import { quoteSuperfrete } from "@/lib/shipping";

type Body = {
  cep: string;
  items: CartItem[];
};

function isSize(value: string): value is Size {
  return (SIZES as readonly string[]).includes(value);
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!body.cep || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { error: "Informe o CEP e os itens do carrinho." },
      { status: 400 },
    );
  }

  const items: CartItem[] = [];
  const catalog = [];
  let insurance = 0;
  for (const item of body.items) {
    if (!item?.productId || !isSize(item.size) || item.quantity < 1) {
      return NextResponse.json({ error: "Item inválido." }, { status: 400 });
    }
    const product = await getStoreProduct(item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Produto não encontrado: ${item.productId}` },
        { status: 400 },
      );
    }
    const qty = Math.min(item.quantity, 10);
    items.push({ productId: item.productId, size: item.size, quantity: qty });
    catalog.push(product);
    insurance += (product.priceCents / 100) * qty;
  }

  try {
    const options = await quoteSuperfrete({
      toCep: body.cep,
      items,
      catalog,
      insuranceValueReais: Math.round(insurance * 100) / 100,
    });

    if (options.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma opção de frete disponível para este CEP." },
        { status: 404 },
      );
    }

    return NextResponse.json({ options });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Falha ao cotar frete.";
    const status = message.includes("não configurado") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
