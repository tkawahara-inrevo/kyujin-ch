import { auth } from "@/auth";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      {session?.user?.role === "ADMIN" && <AdminSidebar />}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
