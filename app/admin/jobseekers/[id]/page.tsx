import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { UserActiveToggle } from "../user-active-toggle";

const statusLabels: Record<string, string> = {
  APPLIED: "応募済",
  REVIEWING: "選考中",
  INTERVIEW: "面接",
  OFFER: "内定",
  REJECTED: "不採用",
  HIRED: "採用",
};

export default async function AdminJobseekerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id, role: "USER" },
    include: {
      applications: {
        include: {
          job: { include: { company: true } },
          charge: true,
        },
        orderBy: { createdAt: "desc" },
      },
      favorites: {
        include: { job: { select: { title: true, company: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="p-6 lg:p-10">
      <Link href="/admin/jobseekers" className="text-[13px] text-[#888] hover:text-[#2f6cff]">
        ← 求職者一覧
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-[#1e293b]">{user.name}</h1>
        <UserActiveToggle userId={user.id} isActive={user.isActive} />
      </div>

      {/* User Info */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[12px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h2 className="mb-4 text-[16px] font-bold text-[#333]">基本情報</h2>
          <dl className="space-y-3 text-[14px]">
            <InfoRow label="氏名" value={user.name} />
            <InfoRow label="メール" value={user.email} />
            <InfoRow label="電話番号" value={user.phone || "未設定"} />
            <InfoRow label="登録日" value={user.createdAt.toLocaleDateString("ja-JP")} />
            <InfoRow label="履歴書" value={user.resumeUrl ? "あり" : "なし"} />
            <InfoRow label="職務経歴書" value={user.careerHistoryUrl ? "あり" : "なし"} />
          </dl>
        </div>

        <div className="space-y-4">
          <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-[12px] font-semibold text-[#888]">応募数</p>
            <p className="mt-2 text-[28px] font-bold text-[#2f6cff]">{user.applications.length}</p>
          </div>
          <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <p className="text-[12px] font-semibold text-[#888]">お気に入り数</p>
            <p className="mt-2 text-[28px] font-bold text-[#f59e0b]">{user.favorites.length}</p>
          </div>
        </div>
      </div>

      {/* Applications */}
      <div className="mt-8">
        <h2 className="text-[16px] font-bold text-[#333]">応募履歴</h2>
        <div className="mt-3 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[#888]">
                <th className="px-5 py-3 font-semibold">求人</th>
                <th className="px-5 py-3 font-semibold">企業</th>
                <th className="px-5 py-3 font-semibold">ステータス</th>
                <th className="px-5 py-3 font-semibold">課金額</th>
                <th className="px-5 py-3 font-semibold">応募日</th>
              </tr>
            </thead>
            <tbody>
              {user.applications.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-[#aaa]">応募がありません</td></tr>
              ) : (
                user.applications.map((app) => (
                  <tr key={app.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                    <td className="px-5 py-3 font-medium text-[#333]">
                      <Link href={`/admin/jobs/${app.jobId}`} className="hover:text-[#2f6cff] hover:underline">
                        {app.job.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[#555]">{app.job.company.name}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-bold text-[#2f6cff]">
                        {statusLabels[app.status] || app.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#555]">
                      {app.charge ? `¥${app.charge.amount.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-[#888]">{app.createdAt.toLocaleDateString("ja-JP")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <dt className="w-[100px] shrink-0 font-semibold text-[#888]">{label}</dt>
      <dd className="text-[#333]">{value}</dd>
    </div>
  );
}
