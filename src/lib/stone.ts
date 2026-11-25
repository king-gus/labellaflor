/** Stone online = Pagar.me (API v5). */

export function pagarmeBaseUrl() {
  const explicit = process.env.PAGARME_BASE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  const key = process.env.PAGARME_SECRET_KEY?.trim() || "";
  if (key.startsWith("sk_test")) {
    return "https://sdx-api.pagar.me/core/v5";
  }
  return "https://api.pagar.me/core/v5";
}

export function hasStonePayment() {
  return Boolean(process.env.PAGARME_SECRET_KEY?.trim());
}

function basicAuthHeader(secretKey: string) {
  const bytes = new TextEncoder().encode(`${secretKey}:`);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return `Basic ${btoa(binary)}`;
}

export type StoneCheckoutItem = {
  name: string;
  amountCents: number;
  quantity: number;
  description?: string;
};

export type StoneCheckoutCustomer = {
  name: string;
  email: string;
  phone: string;
};

export async function createStonePaymentLink(args: {
  orderId: string;
  items: StoneCheckoutItem[];
  customer: StoneCheckoutCustomer;
  successUrl: string;
}): Promise<{ id: string; url: string }> {
  const secret = process.env.PAGARME_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error("PAGARME_SECRET_KEY não configurada.");
  }

  const methods = (
    process.env.PAGARME_PAYMENT_METHODS || "credit_card,pix,boleto"
  )
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  const payload = {
    type: "order",
    name: `La Bella Flor · ${args.orderId}`.slice(0, 64),
    order_code: args.orderId,
    expires_in: 60 * 24,
    max_paid_sessions: 1,
    payment_settings: {
      accepted_payment_methods: methods.length
        ? methods
        : ["credit_card", "pix", "boleto"],
      success_url: args.successUrl,
    },
    cart_settings: {
      items: args.items.map((item) => ({
        name: item.name.slice(0, 64),
        amount: Math.max(1, Math.round(item.amountCents)),
        default_quantity: Math.max(1, Math.min(item.quantity, 10)),
        description: (item.description || item.name).slice(0, 256),
      })),
    },
    customer_settings: {
      customer: {
        name: args.customer.name,
        email: args.customer.email,
        type: "individual",
        phones: {
          mobile_phone: {
            country_code: "55",
            area_code: phoneParts(args.customer.phone).area,
            number: phoneParts(args.customer.phone).number,
          },
        },
      },
    },
  };

  const res = await fetch(`${pagarmeBaseUrl()}/paymentlinks`, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(secret),
      "Content-Type": "application/json",
      "User-Agent": "labellaflor-stone/1.0 (nathaliasacheti@hotmail.com)",
    },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  if (!res.ok) {
    console.error("Stone/Pagar.me error", res.status, raw);
    throw new Error("Não foi possível iniciar o pagamento na Stone.");
  }

  let data: { id?: string; url?: string };
  try {
    data = JSON.parse(raw) as { id?: string; url?: string };
  } catch {
    throw new Error("Resposta inválida da Stone.");
  }

  if (!data.id || !data.url) {
    throw new Error("Checkout Stone sem URL de pagamento.");
  }

  return { id: data.id, url: data.url };
}

function phoneParts(phone: string) {
  const d = phone.replace(/\D/g, "");
  // 11999999999 or 999999999
  if (d.length >= 10) {
    return { area: d.slice(0, 2), number: d.slice(2, 11) };
  }
  return { area: "12", number: d.padEnd(9, "0").slice(0, 9) };
}
