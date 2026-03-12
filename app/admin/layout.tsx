import { auth } from "@/auth";
import { AdminSidebar } from "./admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      {isAdmin && <AdminSidebar />}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
