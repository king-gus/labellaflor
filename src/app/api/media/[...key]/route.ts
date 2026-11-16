import { NextResponse } from "next/server";
import { readProductImageObject } from "@/lib/storage";

type Params = { params: Promise<{ key: string[] }> };

export async function GET(_request: Request, context: Params) {
  const { key: parts } = await context.params;
  const key = parts.map(decodeURIComponent).join("/");
  const object = await readProductImageObject(key);
  if (!object) {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  const headers = new Headers();
  const contentType =
    object.httpMetadata?.contentType || "application/octet-stream";
  headers.set("Content-Type", contentType);
  headers.set(
    "Cache-Control",
    object.httpMetadata?.cacheControl ||
      "public, max-age=31536000, immutable",
  );
  if (object.httpEtag) headers.set("ETag", object.httpEtag);

  return new NextResponse(object.body, { status: 200, headers });
}
