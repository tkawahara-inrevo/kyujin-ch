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

export async function reorderEntry(id: string, direction: "up" | "down") {
  await requireAdminAction();

  const entry = await prisma.priceEntry.findUnique({ where: { id } });
  if (!entry) return;

  const siblings = await prisma.priceEntry.findMany({
    where: { category: entry.category },
    orderBy: { sortOrder: "asc" },
  });

  const index = siblings.findIndex((e) => e.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) return;

  const sibling = siblings[swapIndex];
  await prisma.$transaction([
    prisma.priceEntry.update({ where: { id: entry.id }, data: { sortOrder: sibling.sortOrder } }),
    prisma.priceEntry.update({ where: { id: sibling.id }, data: { sortOrder: entry.sortOrder } }),
  ]);

  revalidatePath("/admin/billing");
  revalidatePath("/company/billing");
}

export async function reorderCategory(category: string, direction: "up" | "down") {
  await requireAdminAction();

  // Get all distinct categories with their categorySortOrder (use first entry's value)
  const allEntries = await prisma.priceEntry.findMany({
    orderBy: [{ categorySortOrder: "asc" }, { category: "asc" }],
  });

  // Build ordered category list (deduplicated)
  const seen = new Set<string>();
  const categoryOrder: Array<{ name: string; sortOrder: number }> = [];
  for (const e of allEntries) {
    if (!seen.has(e.category)) {
      seen.add(e.category);
      categoryOrder.push({ name: e.category, sortOrder: e.categorySortOrder });
    }
  }

  const index = categoryOrder.findIndex((c) => c.name === category);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapIndex < 0 || swapIndex >= categoryOrder.length) return;

  const swapCategory = categoryOrder[swapIndex];
  // Swap categorySortOrder values between the two categories
  await prisma.$transaction([
    prisma.priceEntry.updateMany({
      where: { category },
      data: { categorySortOrder: swapCategory.sortOrder },
    }),
    prisma.priceEntry.updateMany({
      where: { category: swapCategory.name },
      data: { categorySortOrder: categoryOrder[index].sortOrder },
    }),
  ]);

  revalidatePath("/admin/billing");
  revalidatePath("/company/billing");
}
