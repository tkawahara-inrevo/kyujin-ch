import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { CompaniesTable, type CompanyRow } from "./companies-table";

type SearchParams = Promise<{ q?: string }>;

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const { q } = await searchParams;

  const companies = await prisma.company.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { companyUser: { email: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      _count: { select: { jobs: true } },
      companyUser: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const rows: CompanyRow[] = companies.map((company) => ({
    id: company.id,
    name: company.name,
    email: company.companyUser?.email ?? "-",
    jobsCount: company._count.jobs,
    isActive: company.isActive,
    createdAt: company.createdAt.toISOString(),
  }));

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[24px] font-bold text-[#1e293b]">企業一覧</h1>
        <Link
          href="/admin/companies/new"
          className="rounded-[10px] bg-[#2f6cff] px-5 py-2.5 text-[14px] font-bold text-white hover:opacity-90"
        >
          企業アカウント発行
        </Link>
      </div>

      <form className="mt-4 flex flex-wrap gap-2" action="/admin/companies">
        <input
          name="q"
          defaultValue={q}
          placeholder="企業名やメールアドレスで検索..."
          className="min-w-[220px] flex-1 rounded-lg border border-[#ddd] bg-white px-4 py-2 text-[13px] outline-none focus:border-[#2f6cff]"
        />
        <button
          type="submit"
          className="rounded-lg bg-[#2f6cff] px-4 py-2 text-[13px] font-bold text-white hover:opacity-90"
        >
          検索
        </button>
        {q && (
          <Link
            href="/admin/companies"
            className="rounded-lg border border-[#ddd] px-4 py-2 text-[13px] text-[#666] hover:bg-[#f5f5f5]"
          >
            クリア
          </Link>
        )}
      </form>

      <p className="mt-3 text-[13px] text-[#888]">
        {q && companies.length === 0
          ? `「${q}」に一致する企業が見つかりません`
          : `${companies.length} 件`}
      </p>

      <CompaniesTable companies={rows} />
    </div>
  );
}
