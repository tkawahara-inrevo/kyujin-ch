"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { signOut } from "@/auth";

export async function deleteCompanyAccount() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const company = await prisma.company.findFirst({
    where: { companyUserId: userId },
    select: { id: true },
  });

  if (!company) throw new Error("企業情報が見つかりません");

  // 全求人を非公開・削除済みにする
  await prisma.job.updateMany({
    where: { companyId: company.id },
    data: { isPublished: false, isDeleted: true },
  });

  // 企業を無効化
  await prisma.company.update({
    where: { id: company.id },
    data: { isActive: false },
  });

  // ユーザーアカウントを匿名化
  await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      name: "退会済み企業",
      email: `deleted_company_${userId}@deleted.invalid`,
      password: null,
      isActive: false,
    },
  });

  await signOut({ redirectTo: "/" });
}
