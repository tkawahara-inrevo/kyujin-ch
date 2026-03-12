"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") throw new Error("Unauthorized");
  return session.user.id;
}

export async function issueCompanyAccount(data: {
  companyName: string;
  email: string;
  password: string;
  contactName: string;
  location?: string;
  description?: string;
  websiteUrl?: string;
}) {
  await requireAdmin();

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.contactName,
      email: data.email,
      password: hashedPassword,
      role: "COMPANY",
    },
  });

  await prisma.company.create({
    data: {
      name: data.companyName,
      companyUserId: user.id,
      location: data.location || null,
      description: data.description || null,
      websiteUrl: data.websiteUrl || null,
    },
  });

  revalidatePath("/admin/companies");
}

export async function toggleCompanyActive(companyId: string, isActive: boolean) {
  await requireAdmin();
  await prisma.company.update({
    where: { id: companyId },
    data: { isActive },
  });
  revalidatePath("/admin/companies");
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });
  revalidatePath("/admin/jobseekers");
}
