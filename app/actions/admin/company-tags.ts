"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }
}

function normalizeTags(input: string[]): string[] {
  const cleaned = input
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && t.length <= 40);
  return Array.from(new Set(cleaned));
}

/** 特定企業のタグを更新 */
export async function updateCompanyTags(companyId: string, tags: string[]) {
  await requireAdmin();
  const normalized = normalizeTags(tags);
  await prisma.company.update({
    where: { id: companyId },
    data: { tags: normalized },
  });
  revalidatePath(`/admin/companies/${companyId}`);
  revalidatePath("/admin/companies");
  revalidatePath("/admin/jobs");
  return { tags: normalized };
}

/** 既存企業タグ一覧（フィルタUI用の候補） */
export async function listAllCompanyTags(): Promise<string[]> {
  await requireAdmin();
  const rows = await prisma.company.findMany({
    where: { tags: { isEmpty: false } },
    select: { tags: true },
  });
  const set = new Set<string>();
  for (const r of rows) for (const t of r.tags) set.add(t);
  return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
}
