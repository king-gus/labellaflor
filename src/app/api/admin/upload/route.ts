import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { uploadProductImage } from "@/lib/storage";

export async function POST(request: Request) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const productId = String(form.get("productId") || "");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo obrigatório." }, { status: 400 });
    }
    const url = await uploadProductImage(file, productId || undefined);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha no upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
