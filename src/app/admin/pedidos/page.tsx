import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { OrdersAdmin } from "@/components/admin/OrdersAdmin";

export default async function AdminPedidosPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin");
  return <OrdersAdmin />;
}
