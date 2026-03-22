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
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto pt-[64px] xl:pt-0">{children}</main>
    </div>
  );
}
