"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCompanySettings(data: {
  companyName: string;
  description: string;
  websiteUrl: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine: string;
  contactName: string;
  phone: string;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") {
    throw new Error("Unauthorized");
  }

  const companyName = data.companyName.trim();
  if (!companyName) {
    throw new Error("会社名を入力してください");
  }

  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });

  if (!company) {
    throw new Error("企業情報が見つかりません");
  }

  await prisma.$transaction([
    prisma.company.update({
      where: { id: company.id },
      data: {
        name: companyName,
        description: data.description.trim() || null,
        websiteUrl: data.websiteUrl.trim() || null,
        postalCode: data.postalCode.trim() || null,
        prefecture: data.prefecture.trim() || null,
        city: data.city.trim() || null,
        addressLine: data.addressLine.trim() || null,
        location: [data.prefecture, data.city, data.addressLine].map((s) => s.trim()).filter(Boolean).join("") || null,
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.contactName.trim(),
        phone: data.phone.trim() || null,
      },
    }),
  ]);

  revalidatePath("/company/settings");
}
