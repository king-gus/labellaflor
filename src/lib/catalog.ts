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

function normalizeImages(cover: string, extras: string[] = []) {
  const list = [cover, ...extras]
    .map((u) => u.trim())
    .filter(Boolean);
  const unique = [...new Set(list)];
  return {
    image: unique[0] || "",
    images: unique,
  };
}

async function loadImagesByProduct(productIds: string[]) {
  const map = new Map<string, string[]>();
  if (!productIds.length) return map;
  const sql = getSql();
  const rows = await sql`
    SELECT product_id AS "productId", url, sort_order AS "sortOrder"
    FROM product_images
    ORDER BY sort_order ASC, id ASC
  `;
  for (const row of rows) {
    const pid = String(row.productId);
    if (!productIds.includes(pid)) continue;
    const list = map.get(pid) || [];
    list.push(String(row.url));
    map.set(pid, list);
  }
  return map;
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
  const ids = rows.map((r) => String(r.id));
  const imagesMap = await loadImagesByProduct(ids);
  return rows.map((r) => {
    const id = String(r.id);
    const cover = String(r.image || "");
    const gallery = imagesMap.get(id) || [];
    const images = normalizeImages(cover, gallery);
    return {
      id,
      name: String(r.name),
      category: String(r.category),
      priceCents: Number(r.priceCents),
      ...images,
    };
  });
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
  const imagesMap = await loadImagesByProduct([String(r.id)]);
  const gallery = imagesMap.get(String(r.id)) || [];
  return {
    id: String(r.id),
    name: String(r.name),
    category: String(r.category),
    priceCents: Number(r.priceCents),
    ...normalizeImages(String(r.image || ""), gallery),
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

  const ids = products.map((p) => String(p.id));
  const imagesMap = await loadImagesByProduct(ids);

  return products.map((p) => {
    const id = String(p.id);
    const images = normalizeImages(
      String(p.image || ""),
      imagesMap.get(id) || [],
    );
    return {
      id,
      name: String(p.name),
      category: String(p.category),
      priceCents: Number(p.priceCents),
      description: String(p.description || ""),
      active: Boolean(p.active),
      stock: stockByProduct.get(id) || emptyStock(),
      ...images,
    };
  });
}

export async function upsertProduct(input: {
  id: string;
  name: string;
  category: string;
  priceCents: number;
  images: string[];
  description?: string;
  active?: boolean;
  stock?: Partial<StockMap>;
}) {
  const sql = getSql();
  const id = input.id.trim();
  const images = [...new Set(input.images.map((u) => u.trim()).filter(Boolean))];
  if (!images.length) {
    throw new Error("Envie ao menos uma imagem do produto.");
  }
  const cover = images[0];

  await sql`
    INSERT INTO products (id, name, category, price_cents, image_url, description, active, updated_at)
    VALUES (
      ${id},
      ${input.name.trim()},
      ${input.category.trim()},
      ${input.priceCents},
      ${cover},
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

  await sql`DELETE FROM product_images WHERE product_id = ${id}`;
  for (let i = 0; i < images.length; i++) {
    await sql`
      INSERT INTO product_images (product_id, url, sort_order)
      VALUES (${id}, ${images[i]}, ${i})
    `;
  }

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
      id: p.id,
      name: p.name,
      category: p.category,
      priceCents: p.priceCents,
      images: p.images,
      description: "",
      active: true,
      stock: { P: 5, M: 5, G: 5, GG: 5 },
    });
  }
}
