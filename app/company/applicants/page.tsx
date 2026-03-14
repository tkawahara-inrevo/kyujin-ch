import { prisma } from "@/lib/prisma";
import { requireCompany } from "@/lib/auth-helpers";
import { ApplicantsTable, type ApplicantRow } from "./applicants-table";

export default async function CompanyApplicantsPage() {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });

  if (!company) {
    return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;
  }

  const applications = await prisma.application.findMany({
    where: { job: { companyId: company.id, isDeleted: false } },
    include: { user: true, job: true },
    orderBy: { createdAt: "desc" },
  });

  const rows: ApplicantRow[] = applications.map((application) => ({
    id: application.id,
    userName: application.user.name ?? "Unknown",
    userEmail: application.user.email,
    jobId: application.job.id,
    jobTitle: application.job.title,
    status: application.status,
    createdAt: application.createdAt.toISOString(),
  }));

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">応募者管理</h1>
      <p className="mt-1 text-[14px] text-[#888]">{applications.length} 件</p>
      <ApplicantsTable applications={rows} />
    </div>
  );
}
