import { auth } from "@/auth";
import { redirect } from "next/navigation";

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
