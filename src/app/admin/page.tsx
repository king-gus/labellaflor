import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminLoggedIn, isAdminConfigured } from "@/lib/admin-auth";
import { hasDatabase } from "@/lib/db";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default async function AdminHomePage() {
  const configured = isAdminConfigured();
  const loggedIn = await isAdminLoggedIn();

  if (loggedIn) {
    redirect("/admin/produtos");
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl">Entrar</h1>
      <p className="mt-2 text-sm text-muted">
        Painel para cadastrar produtos, estoque por tamanho e acompanhar envios.
      </p>

      {!configured && (
        <p className="mt-6 border border-amber-700/30 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Configure <code>ADMIN_PASSWORD</code> (e depois o Neon) nas variáveis
          da Vercel antes de usar o painel.
        </p>
      )}

      <div className="mt-4 space-y-2 text-sm text-muted">
        <p>
          Banco:{" "}
          {hasDatabase() ? (
            <span className="text-accent">DATABASE_URL ok</span>
          ) : (
            <span>ainda sem Neon (DATABASE_URL)</span>
          )}
        </p>
      </div>

      {configured && <AdminLoginForm />}

      <p className="mt-8 text-sm text-muted">
        Depois do login:{" "}
        <Link href="/admin/produtos" className="text-accent underline">
          produtos
        </Link>{" "}
        ·{" "}
        <Link href="/admin/pedidos" className="text-accent underline">
          pedidos
        </Link>
      </p>
    </div>
  );
}
