"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateCompanySettings(data: {
  companyName: string;
  description: string;
  websiteUrl: string;
  location: string;
  contactName: string;
  phone: string;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") {
    throw new Error("Unauthorized");
  }

  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) throw new Error("企業情報が見つかりません");

  await prisma.$transaction([
    prisma.company.update({
      where: { id: company.id },
      data: {
        name: data.companyName,
        description: data.description || null,
        websiteUrl: data.websiteUrl || null,
        location: data.location || null,
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.contactName,
        phone: data.phone || null,
      },
    }),
  ]);

  revalidatePath("/company/settings");
}
