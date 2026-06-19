import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/auth-helpers";
import PriceTable from "./price-table";
import PartTimePriceSection from "./part-time-price-section";

export default async function AdminBillingPage() {
  await requireAdminPermission("billing");

  // 通常の料金表（MID_CAREER / NEW_GRAD）
  const priceEntries = await prisma.priceEntry.findMany({
    where: { targetType: { not: "PART_TIME_INTERN" } },
    orderBy: [{ categorySortOrder: "asc" }, { sortOrder: "asc" }],
  });

  // アルバイト・インターン固定料金
  const partTimeFixed = await prisma.priceEntry.findFirst({
    where: { targetType: "PART_TIME_INTERN", category: "アルバイト・インターン", subcategory: "固定料金" },
    select: { experiencedPrice: true, inexperiencedPrice: true },
  });

  // Group by category
  const grouped: Record<string, typeof priceEntries> = {};
  const categories: string[] = [];
  for (const entry of priceEntries) {
    if (!grouped[entry.category]) {
      grouped[entry.category] = [];
      categories.push(entry.category);
    }
    grouped[entry.category].push(entry);
  }

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">料金表管理</h1>
      <p className="mt-1 text-[13px] text-[#888]">
        料金を編集すると、企業側の請求管理ページにも反映されます
      </p>
      <PriceTable grouped={grouped} categories={categories} />
      <PartTimePriceSection
        initialPrice={partTimeFixed?.experiencedPrice ?? 0}
        initialPriceInexp={partTimeFixed?.inexperiencedPrice ?? null}
      />
    </div>
  );
}
