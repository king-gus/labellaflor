import { NextResponse } from "next/server";
import {
  adminCookieOptions,
  createAdminSessionToken,
  isAdminConfigured,
  normalizeAdminEmail,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "ADMIN_EMAIL e ADMIN_PASSWORD ainda não foram configuradas na Vercel.",
      },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;

  const email = body?.email || "";
  const password = body?.password || "";

  if (!verifyAdminCredentials(email, password)) {
    return NextResponse.json(
      { error: "E-mail ou senha incorretos." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  const cookie = adminCookieOptions(
    createAdminSessionToken(normalizeAdminEmail(email)),
  );
  res.cookies.set(cookie);
  return res;
}
