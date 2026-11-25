import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/** Cria o client por chamada — evita reutilizar I/O entre requests no Workers. */
export function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL não configurada. Peça à cliente o connection string pooled do Neon.",
    );
  }
  return neon(url);
}
