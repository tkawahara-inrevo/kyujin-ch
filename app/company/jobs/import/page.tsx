import { requireCompany } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CsvImportForm from "./csv-import-form";

export default async function CompanyJobImportPage() {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { users: { some: { id: session.user.id } } },
    select: { id: true, name: true },
  });
  if (!company) redirect("/company/settings");

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-[900px] p-6 lg:p-10">
        <h1 className="text-[24px] font-bold text-[#1e293b]">求人 CSV 一括アップロード</h1>
        <p className="mt-2 text-[13px] text-[#666]">
          複数の求人を CSV で一括登録できます。登録された求人はすべて <strong>下書き</strong> 状態になるので、
          個別に内容確認 → 審査依頼してください。
        </p>
        <CsvImportForm companyId={company.id} companyName={company.name} />
      </div>
    </div>
  );
}
