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
        Acesso exclusivo da dona da loja. Use o e-mail e a senha configurados na
        Vercel.
      </p>

      {!configured && (
        <p className="mt-6 border border-amber-700/30 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Configure <code>ADMIN_EMAIL</code> e <code>ADMIN_PASSWORD</code> nas
          variáveis da Vercel antes de usar o painel.
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
    </div>
  );
}
