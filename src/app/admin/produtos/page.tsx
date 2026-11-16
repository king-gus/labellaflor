import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { ProductsAdmin } from "@/components/admin/ProductsAdmin";

export default async function AdminProdutosPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin");
  return <ProductsAdmin />;
}
