"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function changeCompanyEmail(currentPassword: string, newEmail: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const email = newEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("正しいメールアドレスを入力してください");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true, email: true },
  });
  if (!user || !user.password) throw new Error("ユーザーが見つかりません");

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) throw new Error("現在のパスワードが正しくありません");

  if (email === user.email) {
    throw new Error("現在のメールアドレスと同じです");
  }

  const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) throw new Error("このメールアドレスは既に使用されています");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { email },
  });

  revalidatePath("/company/settings");
}
