"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { AdminPermissions } from "@/lib/admin-permissions";

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function getAdminAccounts() {
  await requireSuperAdmin();
  return prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      adminPermissions: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAdminAccount(data: {
  username: string;
  password: string;
  email: string;
  permissions: AdminPermissions;
}) {
  await requireSuperAdmin();

  const username = data.username.trim().toLowerCase();
  const email = data.email.trim().toLowerCase();

  if (!username) throw new Error("IDを入力してください");
  if (!email) throw new Error("メールアドレスを入力してください");
  if (data.password.length < 8) throw new Error("パスワードは8文字以上で入力してください");

  const [existingUsername, existingEmail] = await Promise.all([
    prisma.user.findFirst({ where: { username }, select: { id: true } }),
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
  ]);
  if (existingUsername) throw new Error("そのIDは既に使われています");
  if (existingEmail) throw new Error("そのメールアドレスは既に使われています");

  const hashed = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      name: username,
      username,
      email,
      password: hashed,
      role: "ADMIN",
      isActive: true,
      notificationsEnabled: false,
      adminPermissions: data.permissions,
    },
  });

  revalidatePath("/admin/accounts");
}

export async function updateAdminPermissions(userId: string, permissions: AdminPermissions) {
  await requireSuperAdmin();
  await prisma.user.update({
    where: { id: userId, role: "ADMIN" },
    data: { adminPermissions: permissions },
  });
  revalidatePath("/admin/accounts");
}

export async function toggleAdminActive(userId: string, isActive: boolean) {
  await requireSuperAdmin();
  await prisma.user.update({
    where: { id: userId, role: "ADMIN" },
    data: { isActive },
  });
  revalidatePath("/admin/accounts");
}

export async function deleteAdminAccount(userId: string) {
  await requireSuperAdmin();
  await prisma.user.delete({ where: { id: userId, role: "ADMIN" } });
  revalidatePath("/admin/accounts");
}
