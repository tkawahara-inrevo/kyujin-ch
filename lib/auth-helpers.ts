import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parsePermissions, type AdminPermissions } from "@/lib/admin-permissions";

export async function requireCompany() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") {
    redirect("/company/login");
  }
  return session;
}

export function isAdminRole(role?: string | null) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    redirect("/admin/login");
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    redirect("/admin/login");
  }
  return session;
}

export async function requireColumnEditor() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || (!isAdminRole(role) && role !== "SEO_EDITOR")) {
    redirect("/admin/login");
  }
  return session;
}

/**
 * 指定された adminPermissions のキーが許可されている管理者のみ通す。
 * SUPER_ADMIN は常に通る。ADMIN は user.adminPermissions JSON を見て判定。
 * 権限がない場合は /admin にリダイレクト。
 */
export async function requireAdminPermission(key: keyof AdminPermissions) {
  const session = await auth();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    redirect("/admin/login");
  }
  if (session.user.role === "SUPER_ADMIN") return session;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { adminPermissions: true },
  });
  const permissions = parsePermissions(user?.adminPermissions);
  if (!permissions[key]) {
    redirect("/admin");
  }
  return session;
}
