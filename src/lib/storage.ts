import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function assertImageFile(file: File) {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Use JPG, PNG, WEBP ou GIF.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Imagem deve ter no máximo 8MB.");
  }
}

function extensionFor(type: string, fallbackName: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  const fromName = fallbackName.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  return "jpg";
}

type EnvWithR2 = {
  PRODUCT_IMAGES?: {
    put: (
      key: string,
      value: ArrayBuffer | ArrayBufferView | string | Blob | null,
      options?: {
        httpMetadata?: { contentType?: string; cacheControl?: string };
      },
    ) => Promise<unknown>;
    get: (key: string) => Promise<{
      body: ReadableStream | null;
      httpMetadata?: { contentType?: string; cacheControl?: string };
      httpEtag?: string;
    } | null>;
  };
};

async function getR2Bucket() {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as EnvWithR2;
    return env.PRODUCT_IMAGES ?? null;
  } catch {
    return null;
  }
}

/** Faz upload e devolve URL pública servida pelo app (`/api/media/...` ou `/uploads/...`). */
export async function uploadProductImage(file: File, productId?: string) {
  assertImageFile(file);
  const ext = extensionFor(file.type, file.name);
  const folder = productId?.trim() || "draft";
  const key = `products/${folder}/${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const bucket = await getR2Bucket();
  if (bucket) {
    await bucket.put(key, bytes, {
      httpMetadata: {
        contentType: file.type || "image/jpeg",
        cacheControl: "public, max-age=31536000, immutable",
      },
    });
    return `/api/media/${key}`;
  }

  // Fallback local (next dev / sem binding R2)
  const diskPath = path.join(process.cwd(), "public", "uploads", key);
  await mkdir(path.dirname(diskPath), { recursive: true });
  await writeFile(diskPath, bytes);
  return `/uploads/${key}`;
}

export async function readProductImageObject(key: string) {
  const clean = key.replace(/^\/+/, "").replace(/\.\./g, "");
  if (!clean.startsWith("products/")) return null;

  const bucket = await getR2Bucket();
  if (!bucket) return null;
  return bucket.get(clean);
}
