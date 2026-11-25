import { NextResponse } from "next/server";
import { formatBRL, SIZES, type Size } from "@/lib/products";
import type { CartRequestItem } from "@/lib/cart";
import { getStoreProduct } from "@/lib/catalog";
import { hasDatabase } from "@/lib/db";
import { createOrder } from "@/lib/orders";
import { createStonePaymentLink, hasStonePayment } from "@/lib/stone";

type CheckoutBody = {
  items: CartRequestItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  shipping: {
    serviceId: number;
    serviceName: string;
    priceCents: number;
    deliveryDays?: number | null;
  };
};

function isSize(value: string): value is Size {
  return (SIZES as readonly string[]).includes(value);
}

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { items, customer, shipping } = body;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
  }

  if (
    !shipping ||
    typeof shipping.serviceId !== "number" ||
    typeof shipping.priceCents !== "number" ||
    shipping.priceCents < 0 ||
    !shipping.serviceName
  ) {
    return NextResponse.json(
      { error: "Selecione uma opção de frete válida." },
      { status: 400 },
    );
  }

  const required = [
    customer?.name,
    customer?.email,
    customer?.phone,
    customer?.cep,
    customer?.street,
    customer?.number,
    customer?.neighborhood,
    customer?.city,
    customer?.state,
  ];
  if (required.some((v) => !v || String(v).trim().length < 2)) {
    return NextResponse.json(
      { error: "Preencha todos os dados de entrega." },
      { status: 400 },
    );
  }

  const lines: {
    productId: string;
    size: Size;
    quantity: number;
    title: string;
    unitPriceCents: number;
  }[] = [];

  for (const item of items) {
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
    lines.push({
      productId: product.id,
      size: item.size,
      quantity: Math.min(item.quantity, 10),
      title: `${product.name} · Tam. ${item.size}`,
      unitPriceCents: product.priceCents,
    });
  }

  const subtotalCents = lines.reduce(
    (sum, l) => sum + l.unitPriceCents * l.quantity,
    0,
  );
  const shippingCents = Math.round(shipping.priceCents);
  const totalCents = subtotalCents + shippingCents;
  const orderId = `lbf-${Date.now().toString(36)}`;

  async function persistOrder(paymentExternalId?: string) {
    if (!hasDatabase()) return;
    try {
      await createOrder({
        id: orderId,
        status: "pending_payment",
        customer,
        shipping,
        items: lines.map((l) => ({
          productId: l.productId,
          productName: l.title.replace(/ · Tam\. .*$/, ""),
          size: l.size,
          quantity: l.quantity,
          unitPriceCents: l.unitPriceCents,
        })),
        subtotalCents,
        totalCents,
        paymentExternalId,
      });
    } catch (err) {
      console.error("Failed to persist order", err);
    }
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://labellaflor.labellaflor.workers.dev";

  if (!hasStonePayment()) {
    await persistOrder();
    return NextResponse.json({
      mode: "manual",
      orderId,
      totalLabel: formatBRL(totalCents),
      checkoutUrl: `${siteUrl}/pedido/sucesso?order=${encodeURIComponent(orderId)}&mode=manual`,
    });
  }

  const stoneItems = [
    ...lines.map((l) => ({
      name: l.title,
      amountCents: l.unitPriceCents,
      quantity: l.quantity,
      description: l.title,
    })),
    ...(shippingCents > 0
      ? [
          {
            name: `Frete · ${shipping.serviceName}`.slice(0, 64),
            amountCents: shippingCents,
            quantity: 1,
            description: shipping.serviceName,
          },
        ]
      : []),
  ];

  try {
    const link = await createStonePaymentLink({
      orderId,
      items: stoneItems,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      successUrl: `${siteUrl}/pedido/sucesso?order=${encodeURIComponent(orderId)}`,
    });

    await persistOrder(link.id);

    return NextResponse.json({
      mode: "stone",
      orderId,
      paymentLinkId: link.id,
      checkoutUrl: link.url,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Não foi possível iniciar o pagamento. Tente de novo.",
      },
      { status: 502 },
    );
  }
}
