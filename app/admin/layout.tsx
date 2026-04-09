import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "./admin-sidebar";
import { SeoEditorSidebar } from "./seo-editor-sidebar";
import { parsePermissions, ALL_PERMISSIONS } from "@/lib/admin-permissions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isAdmin = role === "ADMIN";
  const isSeoEditor = role === "SEO_EDITOR";

  let permissions = ALL_PERMISSIONS;
  if (isAdmin && session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { adminPermissions: true },
    });
    permissions = parsePermissions(user?.adminPermissions);
  }

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      {(isSuperAdmin || isAdmin) && (
        <AdminSidebar isSuperAdmin={isSuperAdmin} permissions={permissions} />
      )}
      {isSeoEditor && <SeoEditorSidebar />}
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto pt-[64px] xl:pt-0">{children}</main>
    </div>
  );
}
