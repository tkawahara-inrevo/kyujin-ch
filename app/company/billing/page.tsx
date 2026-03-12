import { prisma } from "@/lib/prisma";
import { requireCompany } from "@/lib/auth-helpers";
import { InvalidRequestButton } from "./invalid-request-button";

export default async function CompanyBillingPage() {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const [thisMonthCharges, lastMonthCharges, charges, priceEntries] = await Promise.all([
    prisma.charge.aggregate({
      where: { isValid: true, billingMonth: thisMonth, application: { job: { companyId: company.id } } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.charge.aggregate({
      where: { isValid: true, billingMonth: lastMonth, application: { job: { companyId: company.id } } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.charge.findMany({
      where: { billingMonth: thisMonth, application: { job: { companyId: company.id } } },
      include: { application: { include: { user: true, job: true, invalidRequests: { where: { status: "PENDING" } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.priceEntry.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    }),
  ]);

  // Group prices by category
  const grouped: Record<string, typeof priceEntries> = {};
  for (const entry of priceEntries) {
    if (!grouped[entry.category]) grouped[entry.category] = [];
    grouped[entry.category].push(entry);
  }

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">請求管理</h1>

      {/* KPI Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-[12px] font-semibold text-[#888]">先月 ({lastMonth})</p>
          <p className="mt-2 text-[28px] font-bold text-[#333]">
            ¥{(lastMonthCharges._sum.amount ?? 0).toLocaleString()}
          </p>
          <p className="mt-1 text-[12px] text-[#aaa]">{lastMonthCharges._count} 件</p>
        </div>
        <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-[12px] font-semibold text-[#888]">当月 ({thisMonth})</p>
          <p className="mt-2 text-[28px] font-bold text-[#2f6cff]">
            ¥{(thisMonthCharges._sum.amount ?? 0).toLocaleString()}
          </p>
          <p className="mt-1 text-[12px] text-[#aaa]">{thisMonthCharges._count} 件</p>
        </div>
      </div>

      {/* Charges Table */}
      <div className="mt-8">
        <h2 className="text-[16px] font-bold text-[#333]">当月の課金明細</h2>
        <div className="mt-3 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#f0f0f0] text-[#888]">
                <th className="px-5 py-3 font-semibold">日時</th>
                <th className="px-5 py-3 font-semibold">求人</th>
                <th className="px-5 py-3 font-semibold">求職者</th>
                <th className="px-5 py-3 font-semibold">金額</th>
                <th className="px-5 py-3 font-semibold">有効</th>
                <th className="px-5 py-3 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {charges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[#aaa]">
                    課金データはありません
                  </td>
                </tr>
              ) : (
                charges.map((ch) => (
                  <tr key={ch.id} className="border-b border-[#f8f8f8] hover:bg-[#fafafa]">
                    <td className="px-5 py-3 text-[#888]">{ch.createdAt.toLocaleDateString("ja-JP")}</td>
                    <td className="px-5 py-3 text-[#555]">{ch.application.job.title}</td>
                    <td className="px-5 py-3 text-[#555]">{ch.application.user.name}</td>
                    <td className="px-5 py-3 font-medium text-[#333]">¥{ch.amount.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        ch.isValid ? "bg-[#d1fae5] text-[#059669]" : "bg-[#fee2e2] text-[#dc2626]"
                      }`}>
                        {ch.isValid ? "有効" : "無効"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {ch.isValid && (
                        <InvalidRequestButton
                          applicationId={ch.application.id}
                          hasExistingRequest={ch.application.invalidRequests.length > 0}
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="mt-10">
        <h2 className="text-[16px] font-bold text-[#333]">料金表</h2>
        <p className="mt-1 text-[12px] text-[#888]">応募1件あたりの課金単価（税抜）</p>
        <div className="mt-3 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                <th className="px-5 py-3 font-semibold text-[#333]" />
                <th className="px-5 py-3 text-right font-semibold text-[#1e3a5f]">経験者</th>
                <th className="px-5 py-3 text-right font-semibold text-[#dc2626]">未経験者</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([category, entries]) => (
                <CategoryBlock key={category} category={category} entries={entries} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CategoryBlock({ category, entries }: { category: string; entries: { id: string; subcategory: string; experiencedPrice: number; inexperiencedPrice: number | null }[] }) {
  return (
    <>
      <tr className="bg-[#eef2ff]">
        <td colSpan={3} className="px-5 py-2.5 text-[13px] font-bold text-[#1e3a5f]">
          {category}
        </td>
      </tr>
      {entries.map((entry) => (
        <tr key={entry.id} className="border-b border-[#f0f0f0] hover:bg-[#fafbff]">
          <td className="py-2.5 pl-10 pr-5 text-[#555]">{entry.subcategory}</td>
          <td className="px-5 py-2.5 text-right font-medium text-[#333]">
            ¥{entry.experiencedPrice.toLocaleString()}
          </td>
          <td className="px-5 py-2.5 text-right font-medium text-[#333]">
            {entry.inexperiencedPrice ? `¥${entry.inexperiencedPrice.toLocaleString()}` : ""}
          </td>
        </tr>
      ))}
    </>
  );
}
