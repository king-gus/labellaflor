import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | null = null;

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getSql() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL não configurada. Peça à cliente o connection string pooled do Neon.",
    );
  }
  if (!sql) sql = neon(url);
  return sql;
}
