import { prisma } from "@/lib/prisma";
import { InvalidRequestActions } from "./invalid-request-actions";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminInvalidRequestsPage() {
  await requireAdmin();
  const requests = await prisma.invalidRequest.findMany({
    include: {
      application: { include: { user: true, job: { include: { company: true } } } },
      company: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">無効申請管理</h1>

      <div className="mt-6 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#f0f0f0] text-[#888]">
              <th className="px-5 py-3 font-semibold">申請日</th>
              <th className="px-5 py-3 font-semibold">企業名</th>
              <th className="px-5 py-3 font-semibold">求職者名</th>
              <th className="px-5 py-3 font-semibold">求人名</th>
              <th className="px-5 py-3 font-semibold">理由</th>
              <th className="px-5 py-3 font-semibold">ステータス</th>
              <th className="px-5 py-3 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-[#aaa]">無効申請はありません</td></tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                  <td className="px-5 py-3 text-[#888]">{req.createdAt.toLocaleDateString("ja-JP")}</td>
                  <td className="px-5 py-3 text-[#333]">{req.company.name}</td>
                  <td className="px-5 py-3 text-[#555]">{req.application.user.name}</td>
                  <td className="px-5 py-3 text-[#555]">{req.application.job.title}</td>
                  <td className="max-w-[200px] truncate px-5 py-3 text-[#555]">{req.reason}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      req.status === "PENDING" ? "bg-[#fef3c7] text-[#d97706]"
                        : req.status === "APPROVED" ? "bg-[#d1fae5] text-[#059669]"
                        : "bg-[#fee2e2] text-[#dc2626]"
                    }`}>
                      {req.status === "PENDING" ? "承認待ち" : req.status === "APPROVED" ? "承認" : "否認"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {req.status === "PENDING" && (
                      <InvalidRequestActions requestId={req.id} />
                    )}
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
