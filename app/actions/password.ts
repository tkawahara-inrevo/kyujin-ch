"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import bcrypt from "bcryptjs";

export async function changeUserPassword(
  currentPassword: string,
  newPassword: string
) {
  const currentUser = await getCurrentUser();

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { password: true },
  });

  if (!user?.password) throw new Error("パスワードが設定されていません");

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new Error("現在のパスワードが正しくありません");

  if (newPassword.length < 8) throw new Error("新しいパスワードは8文字以上にしてください");

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: currentUser.id },
    data: { password: hashed },
  });

  return { success: true };
}
