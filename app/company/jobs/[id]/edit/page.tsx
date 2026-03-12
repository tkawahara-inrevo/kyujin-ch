import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { JobEditForm } from "./job-edit-form";
import { requireCompany } from "@/lib/auth-helpers";

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

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">求人を編集する</h1>
      <JobEditForm job={job} />
    </div>
  );
}
