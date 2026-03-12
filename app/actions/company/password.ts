"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function changeCompanyPassword(
  currentPassword: string,
  newPassword: string
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) throw new Error("パスワードが設定されていません");

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new Error("現在のパスワードが正しくありません");

  if (newPassword.length < 6) throw new Error("新しいパスワードは6文字以上にしてください");

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  redirect("/company/settings");
}
