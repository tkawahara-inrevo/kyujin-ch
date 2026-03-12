import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import PriceTable from "./price-table";

export default async function AdminBillingPage() {
  await requireAdmin();

  const priceEntries = await prisma.priceEntry.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
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
    </div>
  );
}
