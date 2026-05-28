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
    where: { users: { some: { id: userId } } },
    select: { id: true, _count: { select: { users: true } } },
  });

  if (!company) throw new Error("企業情報が見つかりません");

  const isLastMember = company._count.users <= 1;

  if (isLastMember) {
    // 最後の1人 → 企業ごと退会
    await prisma.job.updateMany({
      where: { companyId: company.id },
      data: { isPublished: false, isDeleted: true },
    });

    await prisma.company.update({
      where: { id: company.id },
      data: { isActive: false },
    });
  }

  // ユーザーアカウントを匿名化（サブアカウントの場合も自分のみ退会）
  await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      name: "退会済み企業",
      email: `deleted_company_${userId}@deleted.invalid`,
      password: null,
      isActive: false,
      companyId: null,
    },
  });

  await signOut({ redirectTo: "/" });
}
