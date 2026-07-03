import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAgentSession } from "@/lib/agent-session";
import CsvImportForm from "@/app/company/jobs/import/csv-import-form";
import Link from "next/link";

export default async function AgentCompanyImportPage({ params }: { params: Promise<{ id: string }> }) {
  const agent = await requireAgentSession();
  const { id } = await params;

  const company = await prisma.company.findFirst({
    where: { id, agentId: agent.id },
    select: { id: true, name: true },
  });
  if (!company) return notFound();

  return (
    <div>
      <div className="text-[13px] text-[#666]">
        <Link href={`/agent/companies/${company.id}`} className="hover:text-[#2f6cff]">← {company.name} の詳細</Link>
      </div>
      <h1 className="mt-3 text-[22px] font-bold text-[#1e293b]">求人 CSV 一括アップロード</h1>
      <p className="mt-2 text-[13px] text-[#666]">
        {company.name} に代わって、複数の求人を CSV で一括登録できます。<br />
        登録された求人はすべて <strong>下書き</strong> 状態になり、企業側から審査依頼が必要です。
      </p>
      <CsvImportForm companyId={company.id} companyName={company.name} />
    </div>
  );
}
