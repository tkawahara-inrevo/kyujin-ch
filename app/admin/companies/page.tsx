import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { requireAdminPermission } from "@/lib/auth-helpers";
import { CompaniesTable, type CompanyRow } from "./companies-table";

type SearchParams = Promise<{ q?: string; tag?: string }>;

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminPermission("companies");
  const { q, tag } = await searchParams;

  const [companies, tagRows] = await Promise.all([
    prisma.company.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { corporateNumber: { contains: q, mode: "insensitive" } },
                { companyUser: { email: { contains: q, mode: "insensitive" } } },
                { companyUser: { username: { contains: q, mode: "insensitive" } } },
                { companyUser: { lastName: { contains: q, mode: "insensitive" } } },
                { companyUser: { firstName: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
        ...(tag ? { tags: { has: tag } } : {}),
      },
      include: {
        _count: { select: { jobs: true } },
        companyUser: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.company.findMany({
      where: { tags: { isEmpty: false } },
      select: { tags: true },
    }),
  ]);

  const allTags = Array.from(new Set(tagRows.flatMap((c) => c.tags))).sort((a, b) => a.localeCompare(b, "ja"));
  const rows: CompanyRow[] = companies.map((company) => ({
    id: company.id,
    name: company.name,
    corporateNumber: company.corporateNumber ?? "-",
    email: company.companyUser?.email ?? "-",
    username: company.companyUser?.username ?? "-",
    jobsCount: company._count.jobs,
    isActive: company.isActive,
    createdAt: company.createdAt.toISOString(),
    tags: company.tags,
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
          placeholder="会社名・法人番号・ユーザー名・メールで検索..."
          className="min-w-[220px] flex-1 rounded-lg border border-[#ddd] bg-white px-4 py-2 text-[13px] outline-none focus:border-[#2f6cff]"
        />
        <select
          name="tag"
          defaultValue={tag ?? ""}
          className="rounded-lg border border-[#ddd] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#2f6cff]"
        >
          <option value="">全タグ</option>
          {allTags.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-[#2f6cff] px-4 py-2 text-[13px] font-bold text-white hover:opacity-90"
        >
          検索
        </button>
        {(q || tag) && (
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
