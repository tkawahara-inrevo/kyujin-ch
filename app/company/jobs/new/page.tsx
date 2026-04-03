import { prisma } from "@/lib/prisma";
import { JobNewForm } from "./job-new-form";

export default async function CompanyJobNewPage() {
  const priceEntries = await prisma.priceEntry.findMany({
    orderBy: [{ categorySortOrder: "asc" }, { sortOrder: "asc" }],
  });

  const subcategoryMap: Record<string, string[]> = {};
  for (const entry of priceEntries) {
    if (!subcategoryMap[entry.category]) subcategoryMap[entry.category] = [];
    subcategoryMap[entry.category].push(entry.subcategory);
  }

  return <JobNewForm subcategoryMap={subcategoryMap} />;
}
