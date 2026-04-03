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

  // カテゴリ内の最大sortOrderを取得して末尾に追加
  const siblings = await prisma.priceEntry.findMany({
    where: { category },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  // 既存エントリのsortOrderを正規化してから新エントリを末尾に追加
  const nextSortOrder = siblings.length;

  await prisma.$transaction([
    ...siblings.map((e, i) =>
      prisma.priceEntry.update({ where: { id: e.id }, data: { sortOrder: i } })
    ),
    prisma.priceEntry.create({
      data: {
        category,
        subcategory,
        experiencedPrice,
        inexperiencedPrice,
        sortOrder: nextSortOrder,
        categorySortOrder: siblings[0]?.categorySortOrder ?? 0,
      },
    }),
  ]);

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

// 職種の並べ替え（カテゴリ内の順序を配列の順番で一括保存）
export async function reorderEntry(id: string, direction: "up" | "down") {
  await requireAdminAction();

  const entry = await prisma.priceEntry.findUnique({ where: { id } });
  if (!entry) return;

  // 安定したソート順で取得（sortOrder が同値でも id で一意に決まる）
  const siblings = await prisma.priceEntry.findMany({
    where: { category: entry.category },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });

  const index = siblings.findIndex((e) => e.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapIndex < 0 || swapIndex >= siblings.length) return;

  // 配列の順序を入れ替えてから全エントリのsortOrderを連番で保存
  const newOrder = [...siblings];
  [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];

  await prisma.$transaction(
    newOrder.map((e, i) =>
      prisma.priceEntry.update({ where: { id: e.id }, data: { sortOrder: i } })
    )
  );

  revalidatePath("/admin/billing");
  revalidatePath("/company/billing");
}

// カテゴリの並べ替え（カテゴリ名の配列順で一括保存）
export async function reorderCategories(orderedCategories: string[]) {
  await requireAdminAction();

  await prisma.$transaction(
    orderedCategories.map((category, index) =>
      prisma.priceEntry.updateMany({
        where: { category },
        data: { categorySortOrder: index },
      })
    )
  );

  revalidatePath("/admin/billing");
  revalidatePath("/company/billing");
}
