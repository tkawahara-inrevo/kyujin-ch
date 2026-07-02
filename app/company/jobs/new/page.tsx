import { redirect } from "next/navigation";
import { requireCompany } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { checkCompanyProfileComplete } from "@/lib/company-profile";
import { JobNewForm } from "./job-new-form";

export default async function CompanyJobNewPage() {
  const session = await requireCompany();

  const company = await prisma.company.findFirst({
    where: { users: { some: { id: session.user.id } } },
  });

  if (!company) {
    redirect("/company/settings");
  }

  const { isComplete } = checkCompanyProfileComplete({
    name: company.name,
    businessDescription: company.businessDescription,
    prefecture: company.prefecture,
    location: company.location,
  });

  if (!isComplete) {
    redirect("/company/settings?alert=profile_incomplete#company-settings-edit");
  }

  // アルバイト・インターン / 派遣 は固定料金なので、カテゴリ選択肢は中途/新卒と同じ通常のカテゴリを使う
  const priceEntries = await prisma.priceEntry.findMany({
    where: { targetType: { notIn: ["PART_TIME_INTERN", "TEMPORARY"] } },
    orderBy: [{ categorySortOrder: "asc" }, { sortOrder: "asc" }],
  });

  const subcategoryMap: Record<string, string[]> = {};
  for (const entry of priceEntries) {
    if (!subcategoryMap[entry.category]) subcategoryMap[entry.category] = [];
    subcategoryMap[entry.category].push(entry.subcategory);
  }

  return <JobNewForm subcategoryMap={subcategoryMap} companyName={company.name ?? ""} />;
}
