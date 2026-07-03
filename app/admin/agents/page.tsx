import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/auth-helpers";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export default async function AdminAgentsPage() {
  await requireAdminPermission("agents");

  const agents = await prisma.agent.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { companies: true } },
    },
  });

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[#1e293b]">代理店管理</h1>
          <p className="mt-2 text-[13px] text-[#888]">
            代理店 (協業先) の登録・編集・パスワード再発行ができます。
          </p>
        </div>
        <Link
          href="/admin/agents/new"
          className="rounded-[8px] bg-[#2f6cff] px-5 py-2 text-[13px] font-bold text-white hover:opacity-90"
        >
          代理店を追加
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-[14px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <table className="w-full text-[13px]">
          <thead className="bg-[#f8fafc]">
            <tr className="text-left">
              <th className="px-4 py-3 font-bold text-[#666]">代理店名</th>
              <th className="px-4 py-3 font-bold text-[#666]">メール</th>
              <th className="px-4 py-3 font-bold text-[#666]">担当者</th>
              <th className="px-4 py-3 font-bold text-[#666]">紐付企業数</th>
              <th className="px-4 py-3 font-bold text-[#666]">状態</th>
              <th className="px-4 py-3 font-bold text-[#666]">登録日</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {agents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#888]">
                  代理店の登録がありません。「代理店を追加」から作成してください。
                </td>
              </tr>
            ) : (
              agents.map((agent) => (
                <tr key={agent.id} className="border-t border-[#eef2f7]">
                  <td className="px-4 py-3 font-bold text-[#1e293b]">{agent.name}</td>
                  <td className="px-4 py-3 text-[#444]">{agent.email}</td>
                  <td className="px-4 py-3 text-[#444]">{agent.contactName ?? "-"}</td>
                  <td className="px-4 py-3 text-center font-bold text-[#2f6cff]">{agent._count.companies}</td>
                  <td className="px-4 py-3">
                    {agent.isActive ? (
                      <span className="rounded bg-[#16a34a] px-2 py-0.5 text-[11px] font-bold text-white">有効</span>
                    ) : (
                      <span className="rounded bg-[#9ca3af] px-2 py-0.5 text-[11px] font-bold text-white">無効</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#666]">{formatDate(agent.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/agents/${agent.id}`}
                      className="rounded border border-[#dadfe8] px-3 py-1 text-[12px] font-bold text-[#444] hover:bg-[#f4f7fb]"
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
