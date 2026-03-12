"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function requireAdminAction() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function updateCompanyByAdmin(
  companyId: string,
  data: {
    name: string;
    description: string;
    websiteUrl: string;
    location: string;
    contactName: string;
    phone: string;
  }
) {
  await requireAdminAction();

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { companyUserId: true },
  });
  if (!company) throw new Error("企業が見つかりません");

  await prisma.$transaction([
    prisma.company.update({
      where: { id: companyId },
      data: {
        name: data.name,
        description: data.description || null,
        websiteUrl: data.websiteUrl || null,
        location: data.location || null,
      },
    }),
    ...(company.companyUserId
      ? [
          prisma.user.update({
            where: { id: company.companyUserId },
            data: {
              name: data.contactName,
              phone: data.phone || null,
            },
          }),
        ]
      : []),
  ]);

  revalidatePath(`/admin/companies/${companyId}`);
  revalidatePath("/admin/companies");
}
