import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/auth-helpers";
import AgentEditForm from "./agent-edit-form";
import AgentPasswordResetButton from "./agent-password-reset-button";

export default async function AdminAgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPermission("agents");
  const { id } = await params;

  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      companies: {
        select: {
          id: true,
          name: true,
          corporateNumber: true,
          _count: { select: { jobs: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!agent) return notFound();

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center gap-2 text-[13px] text-[#666]">
        <Link href="/admin/agents" className="hover:text-[#2f6cff]">← 代理店一覧</Link>
      </div>

      <h1 className="mt-3 text-[24px] font-bold text-[#1e293b]">{agent.name}</h1>

      <section className="mt-6 rounded-[14px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="text-[16px] font-bold text-[#1e293b]">代理店情報</h2>
        <AgentEditForm
          agentId={agent.id}
          initialName={agent.name}
          initialEmail={agent.email}
          initialContactName={agent.contactName ?? ""}
          initialPhone={agent.phone ?? ""}
          initialIsActive={agent.isActive}
        />
      </section>

      <section className="mt-6 rounded-[14px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="text-[16px] font-bold text-[#1e293b]">パスワード再発行</h2>
        <p className="mt-1 text-[12px] text-[#666]">仮パスワードを再発行し、代理店のメールアドレス宛に送信します。</p>
        <div className="mt-3">
          <AgentPasswordResetButton agentId={agent.id} />
        </div>
      </section>

      <section className="mt-6 rounded-[14px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h2 className="text-[16px] font-bold text-[#1e293b]">紐付け企業</h2>
        <p className="mt-1 text-[12px] text-[#666]">
          この代理店が紹介・担当している企業一覧です。企業への紐付けは各企業の詳細画面で編集できます。
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#f8fafc]">
              <tr className="text-left">
                <th className="px-3 py-2 font-bold text-[#666]">会社名</th>
                <th className="px-3 py-2 font-bold text-[#666]">法人番号</th>
                <th className="px-3 py-2 font-bold text-[#666]">求人数</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {agent.companies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-[#888]">紐付けられている企業がありません。</td>
                </tr>
              ) : (
                agent.companies.map((c) => (
                  <tr key={c.id} className="border-t border-[#eef2f7]">
                    <td className="px-3 py-2 font-bold text-[#1e293b]">{c.name}</td>
                    <td className="px-3 py-2 text-[#444]">{c.corporateNumber ?? "-"}</td>
                    <td className="px-3 py-2 text-center">{c._count.jobs}</td>
                    <td className="px-3 py-2">
                      <Link href={`/admin/companies/${c.id}`} className="text-[#2f6cff] hover:underline">詳細</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
