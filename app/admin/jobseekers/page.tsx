import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { JobseekersTable, type JobseekerRow } from "./jobseekers-table";

type SearchParams = Promise<{ q?: string }>;

export default async function AdminJobseekersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const { q } = await searchParams;

  const users = await prisma.user.findMany({
    where: {
      role: "USER",
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows: JobseekerRow[] = users.map((user) => ({
    id: user.id,
    name: user.name ?? "Unknown",
    email: user.email,
    applicationsCount: user._count.applications,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">求職者一覧</h1>

      <form className="mt-4 flex flex-wrap gap-2" action="/admin/jobseekers">
        <input
          name="q"
          defaultValue={q}
          placeholder="氏名やメールアドレスで検索..."
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
            href="/admin/jobseekers"
            className="rounded-lg border border-[#ddd] px-4 py-2 text-[13px] text-[#666] hover:bg-[#f5f5f5]"
          >
            クリア
          </Link>
        )}
      </form>

      <p className="mt-3 text-[13px] text-[#888]">
        {q && users.length === 0
          ? `「${q}」に一致する求職者が見つかりません`
          : `${users.length} 件`}
      </p>

      <JobseekersTable users={rows} />
    </div>
  );
}
