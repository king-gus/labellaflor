import { NextResponse } from "next/server";
import { formatBRL, SIZES, type Size } from "@/lib/products";
import type { CartItem } from "@/lib/cart";
import { getStoreProduct } from "@/lib/catalog";
import { hasDatabase } from "@/lib/db";
import { createOrder } from "@/lib/orders";

type CheckoutBody = {
  items: CartItem[];
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
    unitPrice: number;
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
      unitPrice: product.priceCents / 100,
    });
  }

  const subtotalCents = lines.reduce(
    (sum, l) => sum + Math.round(l.unitPrice * 100) * l.quantity,
    0,
  );
  const shippingCents = Math.round(shipping.priceCents);
  const totalCents = subtotalCents + shippingCents;
  const orderId = `lbf-${Date.now().toString(36)}`;

  async function persistOrder(mpPreferenceId?: string) {
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
          unitPriceCents: Math.round(l.unitPrice * 100),
        })),
        subtotalCents,
        totalCents,
        mpPreferenceId,
      });
    } catch (err) {
      console.error("Failed to persist order", err);
    }
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!token) {
    await persistOrder();
    return NextResponse.json({
      mode: "manual",
      orderId,
      totalLabel: formatBRL(totalCents),
      checkoutUrl: `${siteUrl}/pedido/sucesso?order=${encodeURIComponent(orderId)}&mode=manual`,
    });
  }

  const preference = {
    external_reference: orderId,
    items: [
      ...lines.map((l) => ({
        id: `${l.productId}-${l.size}`,
        title: l.title,
        quantity: l.quantity,
        currency_id: "BRL",
        unit_price: l.unitPrice,
      })),
      ...(shippingCents > 0
        ? [
            {
              id: `frete-${shipping.serviceId}`,
              title: `Frete · ${shipping.serviceName}`,
              quantity: 1,
              currency_id: "BRL",
              unit_price: shippingCents / 100,
            },
          ]
        : []),
    ],
    payer: {
      name: customer.name,
      email: customer.email,
      phone: { number: customer.phone.replace(/\D/g, "") },
      address: {
        zip_code: customer.cep.replace(/\D/g, ""),
        street_name: customer.street,
        street_number: customer.number,
      },
    },
    metadata: {
      order_id: orderId,
      complement: customer.complement ?? "",
      neighborhood: customer.neighborhood,
      city: customer.city,
      state: customer.state,
      shipping_service_id: String(shipping.serviceId),
      shipping_service_name: shipping.serviceName,
      shipping_days:
        shipping.deliveryDays != null ? String(shipping.deliveryDays) : "",
    },
    back_urls: {
      success: `${siteUrl}/pedido/sucesso`,
      failure: `${siteUrl}/checkout?status=failure`,
      pending: `${siteUrl}/pedido/sucesso?status=pending`,
    },
    auto_return: "approved",
    statement_descriptor: "LA BELLA FLOR",
  };

  const mpRes = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    },
  );

  if (!mpRes.ok) {
    const detail = await mpRes.text();
    console.error("Mercado Pago error", mpRes.status, detail);
    return NextResponse.json(
      { error: "Não foi possível iniciar o pagamento. Tente de novo." },
      { status: 502 },
    );
  }

  const data = (await mpRes.json()) as {
    id: string;
    init_point?: string;
    sandbox_init_point?: string;
  };

  const checkoutUrl =
    process.env.MERCADOPAGO_SANDBOX === "true"
      ? data.sandbox_init_point || data.init_point
      : data.init_point || data.sandbox_init_point;

  if (!checkoutUrl) {
    return NextResponse.json(
      { error: "Checkout sem URL de pagamento." },
      { status: 502 },
    );
  }

  await persistOrder(data.id);

  return NextResponse.json({
    mode: "mercadopago",
    orderId,
    preferenceId: data.id,
    checkoutUrl,
  });
}
