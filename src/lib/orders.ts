import { getSql } from "@/lib/db";
import type { Size } from "@/lib/products";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "packing"
  | "shipped"
  | "cancelled";

export type OrderItemInput = {
  productId: string;
  productName: string;
  size: Size;
  quantity: number;
  unitPriceCents: number;
};

export type CreateOrderInput = {
  id: string;
  status?: OrderStatus;
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
  items: OrderItemInput[];
  subtotalCents: number;
  totalCents: number;
  mpPreferenceId?: string;
};

export type OrderRow = {
  id: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressCep: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  shippingServiceName: string;
  shippingCents: number;
  shippingDays: number | null;
  subtotalCents: number;
  totalCents: number;
  trackingCode: string;
  notes: string;
  createdAt: string;
  items: {
    productId: string;
    productName: string;
    size: string;
    quantity: number;
    unitPriceCents: number;
  }[];
};

export async function createOrder(input: CreateOrderInput) {
  const sql = getSql();
  const c = input.customer;
  await sql`
    INSERT INTO orders (
      id, status,
      customer_name, customer_email, customer_phone,
      address_cep, address_street, address_number, address_complement,
      address_neighborhood, address_city, address_state,
      shipping_service_id, shipping_service_name, shipping_cents, shipping_days,
      subtotal_cents, total_cents, mp_preference_id
    ) VALUES (
      ${input.id},
      ${input.status || "pending_payment"},
      ${c.name}, ${c.email}, ${c.phone},
      ${c.cep}, ${c.street}, ${c.number}, ${c.complement || ""},
      ${c.neighborhood}, ${c.city}, ${c.state},
      ${input.shipping.serviceId},
      ${input.shipping.serviceName},
      ${input.shipping.priceCents},
      ${input.shipping.deliveryDays ?? null},
      ${input.subtotalCents},
      ${input.totalCents},
      ${input.mpPreferenceId || null}
    )
  `;

  for (const item of input.items) {
    await sql`
      INSERT INTO order_items (
        order_id, product_id, product_name, size, quantity, unit_price_cents
      ) VALUES (
        ${input.id},
        ${item.productId},
        ${item.productName},
        ${item.size},
        ${item.quantity},
        ${item.unitPriceCents}
      )
    `;
  }
}

export async function listOrders(): Promise<OrderRow[]> {
  const sql = getSql();
  const orders = await sql`
    SELECT
      id,
      status,
      customer_name AS "customerName",
      customer_email AS "customerEmail",
      customer_phone AS "customerPhone",
      address_cep AS "addressCep",
      address_street AS "addressStreet",
      address_number AS "addressNumber",
      address_complement AS "addressComplement",
      address_neighborhood AS "addressNeighborhood",
      address_city AS "addressCity",
      address_state AS "addressState",
      shipping_service_name AS "shippingServiceName",
      shipping_cents AS "shippingCents",
      shipping_days AS "shippingDays",
      subtotal_cents AS "subtotalCents",
      total_cents AS "totalCents",
      tracking_code AS "trackingCode",
      notes,
      created_at AS "createdAt"
    FROM orders
    ORDER BY created_at DESC
    LIMIT 200
  `;

  if (!orders.length) return [];

  const items = await sql`
    SELECT
      order_id AS "orderId",
      product_id AS "productId",
      product_name AS "productName",
      size,
      quantity,
      unit_price_cents AS "unitPriceCents"
    FROM order_items
    ORDER BY id ASC
  `;

  const byOrder = new Map<string, OrderRow["items"]>();
  for (const item of items) {
    const oid = String(item.orderId);
    const list = byOrder.get(oid) || [];
    list.push({
      productId: String(item.productId),
      productName: String(item.productName),
      size: String(item.size),
      quantity: Number(item.quantity),
      unitPriceCents: Number(item.unitPriceCents),
    });
    byOrder.set(oid, list);
  }

  return orders.map((o) => ({
    id: String(o.id),
    status: String(o.status) as OrderStatus,
    customerName: String(o.customerName),
    customerEmail: String(o.customerEmail),
    customerPhone: String(o.customerPhone),
    addressCep: String(o.addressCep),
    addressStreet: String(o.addressStreet),
    addressNumber: String(o.addressNumber),
    addressComplement: String(o.addressComplement || ""),
    addressNeighborhood: String(o.addressNeighborhood),
    addressCity: String(o.addressCity),
    addressState: String(o.addressState),
    shippingServiceName: String(o.shippingServiceName || ""),
    shippingCents: Number(o.shippingCents),
    shippingDays: o.shippingDays == null ? null : Number(o.shippingDays),
    subtotalCents: Number(o.subtotalCents),
    totalCents: Number(o.totalCents),
    trackingCode: String(o.trackingCode || ""),
    notes: String(o.notes || ""),
    createdAt: String(o.createdAt),
    items: byOrder.get(String(o.id)) || [],
  }));
}

export async function updateOrder(input: {
  id: string;
  status: OrderStatus;
  trackingCode?: string;
  notes?: string;
}) {
  const sql = getSql();
  await sql`
    UPDATE orders
    SET
      status = ${input.status},
      tracking_code = ${input.trackingCode?.trim() || ""},
      notes = ${input.notes?.trim() || ""},
      updated_at = NOW()
    WHERE id = ${input.id}
  `;
}
