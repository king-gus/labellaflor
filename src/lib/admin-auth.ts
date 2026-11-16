import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "lbf_admin_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

function secret() {
  return (
    process.env.ADMIN_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    ""
  );
}

function sign(payload: string) {
  const key = secret();
  if (!key) throw new Error("ADMIN_SECRET ou ADMIN_PASSWORD não configurado.");
  return createHmac("sha256", key).update(payload).digest("hex");
}

function safeEqualString(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function normalizeAdminEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getAdminEmail() {
  return normalizeAdminEmail(process.env.ADMIN_EMAIL || "");
}

export function isAdminConfigured() {
  return Boolean(getAdminEmail() && process.env.ADMIN_PASSWORD?.trim());
}

export function verifyAdminCredentials(email: string, password: string) {
  const expectedEmail = getAdminEmail();
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim() || "";
  if (!expectedEmail || !expectedPassword || !email || !password) return false;

  const emailOk = safeEqualString(normalizeAdminEmail(email), expectedEmail);
  const passOk = safeEqualString(password, expectedPassword);
  return emailOk && passOk;
}

export function createAdminSessionToken(email: string) {
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const payload = `${normalizeAdminEmail(email)}:${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionToken(token: string | undefined | null) {
  if (!token || !secret() || !isAdminConfigured()) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expected = sign(payload);
  if (!safeEqualString(sig, expected)) return false;

  const [email, expRaw] = payload.split(":");
  const exp = Number(expRaw);
  if (!email || !Number.isFinite(exp) || Date.now() >= exp) return false;

  return safeEqualString(normalizeAdminEmail(email), getAdminEmail());
}

export async function isAdminLoggedIn() {
  if (!isAdminConfigured()) return false;
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(ADMIN_COOKIE)?.value);
}

export function adminCookieOptions(token: string) {
  return {
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}
