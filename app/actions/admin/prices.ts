"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function requireAdminAction() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function updatePrice(
  id: string,
  experiencedPrice: number,
  inexperiencedPrice: number | null,
  subcategory?: string,
  category?: string
) {
  await requireAdminAction();
  await prisma.priceEntry.update({
    where: { id },
    data: {
      experiencedPrice,
      inexperiencedPrice,
      ...(subcategory !== undefined && { subcategory }),
      ...(category !== undefined && { category }),
    },
  });
  revalidatePath("/admin/billing");
  revalidatePath("/company/billing");
}

export async function createPriceEntry(
  category: string,
  subcategory: string,
  experiencedPrice: number,
  inexperiencedPrice: number | null
) {
  await requireAdminAction();
  const maxSort = await prisma.priceEntry.aggregate({
    where: { category },
    _max: { sortOrder: true },
  });
  await prisma.priceEntry.create({
    data: {
      category,
      subcategory,
      experiencedPrice,
      inexperiencedPrice,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
    },
  });
  revalidatePath("/admin/billing");
  revalidatePath("/company/billing");
}

export async function renameCategory(oldCategory: string, newCategory: string) {
  await requireAdminAction();
  await prisma.priceEntry.updateMany({
    where: { category: oldCategory },
    data: { category: newCategory },
  });
  revalidatePath("/admin/billing");
  revalidatePath("/company/billing");
}

export async function deletePriceEntry(id: string) {
  await requireAdminAction();
  await prisma.priceEntry.delete({ where: { id } });
  revalidatePath("/admin/billing");
  revalidatePath("/company/billing");
}
