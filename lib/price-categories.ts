import { prisma } from "@/lib/prisma";

export type CategoryGroup = {
  category: string;
  subcategories: string[];
};

export async function getPriceCategories(): Promise<CategoryGroup[]> {
  const entries = await prisma.priceEntry.findMany({
    select: { category: true, subcategory: true },
    orderBy: [{ categorySortOrder: "asc" }, { sortOrder: "asc" }],
  });

  const map = new Map<string, string[]>();
  for (const entry of entries) {
    if (!map.has(entry.category)) map.set(entry.category, []);
    map.get(entry.category)!.push(entry.subcategory);
  }

  return Array.from(map.entries()).map(([category, subcategories]) => ({
    category,
    subcategories,
  }));
}
