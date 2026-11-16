import { getSql, hasDatabase } from "@/lib/db";
import {
  PRODUCTS,
  SIZES,
  type Product,
  type Size,
} from "@/lib/products";

export type StockMap = Record<Size, number>;

export type AdminProduct = Product & {
  description: string;
  active: boolean;
  stock: StockMap;
};

function emptyStock(): StockMap {
  return { P: 0, M: 0, G: 0, GG: 0 };
}

export async function listStoreProducts(): Promise<Product[]> {
  if (!hasDatabase()) return PRODUCTS;
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, category, price_cents AS "priceCents", image_url AS image
    FROM products
    WHERE active = TRUE
    ORDER BY updated_at DESC, name ASC
  `;
  if (!rows.length) return PRODUCTS;
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    category: String(r.category),
    priceCents: Number(r.priceCents),
    image: String(r.image),
  }));
}

export async function getStoreProduct(id: string): Promise<Product | undefined> {
  if (!hasDatabase()) return PRODUCTS.find((p) => p.id === id);
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, category, price_cents AS "priceCents", image_url AS image
    FROM products
    WHERE id = ${id} AND active = TRUE
    LIMIT 1
  `;
  if (!rows[0]) return PRODUCTS.find((p) => p.id === id);
  const r = rows[0];
  return {
    id: String(r.id),
    name: String(r.name),
    category: String(r.category),
    priceCents: Number(r.priceCents),
    image: String(r.image),
  };
}

export async function listAdminProducts(): Promise<AdminProduct[]> {
  const sql = getSql();
  const products = await sql`
    SELECT id, name, category, price_cents AS "priceCents",
           image_url AS image, description, active
    FROM products
    ORDER BY updated_at DESC, name ASC
  `;
  const stockRows = await sql`
    SELECT product_id AS "productId", size, quantity
    FROM product_stock
  `;
  const stockByProduct = new Map<string, StockMap>();
  for (const row of stockRows) {
    const pid = String(row.productId);
    const size = String(row.size) as Size;
    if (!SIZES.includes(size)) continue;
    const map = stockByProduct.get(pid) || emptyStock();
    map[size] = Number(row.quantity);
    stockByProduct.set(pid, map);
  }
  return products.map((p) => ({
    id: String(p.id),
    name: String(p.name),
    category: String(p.category),
    priceCents: Number(p.priceCents),
    image: String(p.image),
    description: String(p.description || ""),
    active: Boolean(p.active),
    stock: stockByProduct.get(String(p.id)) || emptyStock(),
  }));
}

export async function upsertProduct(input: {
  id: string;
  name: string;
  category: string;
  priceCents: number;
  image: string;
  description?: string;
  active?: boolean;
  stock?: Partial<StockMap>;
}) {
  const sql = getSql();
  const id = input.id.trim();
  await sql`
    INSERT INTO products (id, name, category, price_cents, image_url, description, active, updated_at)
    VALUES (
      ${id},
      ${input.name.trim()},
      ${input.category.trim()},
      ${input.priceCents},
      ${input.image.trim()},
      ${input.description?.trim() || ""},
      ${input.active ?? true},
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      category = EXCLUDED.category,
      price_cents = EXCLUDED.price_cents,
      image_url = EXCLUDED.image_url,
      description = EXCLUDED.description,
      active = EXCLUDED.active,
      updated_at = NOW()
  `;

  for (const size of SIZES) {
    const qty = Math.max(0, Math.floor(input.stock?.[size] ?? 0));
    await sql`
      INSERT INTO product_stock (product_id, size, quantity)
      VALUES (${id}, ${size}, ${qty})
      ON CONFLICT (product_id, size) DO UPDATE SET quantity = EXCLUDED.quantity
    `;
  }
}

export async function deleteProduct(id: string) {
  const sql = getSql();
  await sql`DELETE FROM products WHERE id = ${id}`;
}

export async function seedProductsFromStatic() {
  for (const p of PRODUCTS) {
    await upsertProduct({
      ...p,
      description: "",
      active: true,
      stock: { P: 5, M: 5, G: 5, GG: 5 },
    });
  }
}
