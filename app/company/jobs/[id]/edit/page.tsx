import { notFound } from "next/navigation";
import { requireCompany } from "@/lib/auth-helpers";
import { parsePendingContent } from "@/lib/job-pending";
import { prisma } from "@/lib/prisma";
import { JobEditForm } from "./job-edit-form";
import type { YouthYearStats } from "@/app/actions/company/jobs";
import type { WorkingHoursDetail } from "@/lib/job-pending";

export default async function CompanyJobEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });

  if (!company) return notFound();

  const job = await prisma.job.findFirst({
    where: { id, companyId: company.id, isDeleted: false },
  });

  if (!job) return notFound();

  const [pendingContent, priceEntries] = await Promise.all([
    Promise.resolve(parsePendingContent(job.pendingContent)),
    prisma.priceEntry.findMany({
      orderBy: [{ categorySortOrder: "asc" }, { sortOrder: "asc" }],
    }),
  ]);

  const subcategoryMap: Record<string, string[]> = {};
  for (const entry of priceEntries) {
    if (!subcategoryMap[entry.category]) subcategoryMap[entry.category] = [];
    subcategoryMap[entry.category].push(entry.subcategory);
  }

  const rawJob = {
    ...job,
    youthEmploymentStats: Array.isArray(job.youthEmploymentStats) ? job.youthEmploymentStats as YouthYearStats[] : null,
    workingHoursDetail: (job.workingHoursDetail && typeof job.workingHoursDetail === "object" && !Array.isArray(job.workingHoursDetail))
      ? job.workingHoursDetail as unknown as WorkingHoursDetail
      : null,
  };
  const formJob = pendingContent
    ? {
        ...rawJob,
        ...pendingContent,
        closingDate: pendingContent.closingDate ? new Date(pendingContent.closingDate) : null,
      }
    : rawJob;

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">求人を編集する</h1>
      <JobEditForm job={formJob} hasPublishedVersion={job.isPublished} hasPendingVersion={!!pendingContent} subcategoryMap={subcategoryMap} companyName={company.name ?? ""} />
    </div>
  );
}
