import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { InvoiceMonthSwitcher } from "./invoice-month-switcher";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  await requireAdmin();

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthRows = await prisma.charge.findMany({
    where: { isValid: true },
    select: { billingMonth: true },
    distinct: ["billingMonth"],
    orderBy: { billingMonth: "asc" },
  });

  const months = Array.from(
    new Set([
      ...monthRows.map((row) => row.billingMonth),
      thisMonth,
    ]),
  ).sort((a, b) => a.localeCompare(b));

  const monthlyData = await Promise.all(
    months.map(async (month) => {
      const charges = await prisma.charge.findMany({
        where: { isValid: true, billingMonth: month },
        include: {
          application: {
            include: {
              job: { include: { company: true } },
            },
          },
        },
      });

      const byCompany: Record<
        string,
        { companyId: string; companyName: string; total: number; count: number }
      > = {};

      for (const charge of charges) {
        const company = charge.application.job.company;
        if (!byCompany[company.id]) {
          byCompany[company.id] = {
            companyId: company.id,
            companyName: company.name,
            total: 0,
            count: 0,
          };
        }
        byCompany[company.id].total += charge.amount;
        byCompany[company.id].count += 1;
      }

      const breakdown = Object.values(byCompany).sort((a, b) => b.total - a.total);
      const grandTotal = breakdown.reduce((sum, company) => sum + company.total, 0);
      const totalCount = charges.length;

      return { month, grandTotal, totalCount, breakdown };
    }),
  );

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">請求管理</h1>
      <p className="mt-1 text-[13px] text-[#888]">
        実データの請求月ごとに、企業別の請求合計を確認できます。
      </p>
      <p className="mt-3 rounded-[10px] border border-[#dbe7ff] bg-[#f3f7ff] px-4 py-3 text-[13px] font-medium text-[#2b4ea2]">
        企業アカウント発行日から3ヶ月間は無料キャンペーン期間のため、この期間の応募は請求額0円で記録されます。
      </p>

      <InvoiceMonthSwitcher months={months} monthlyData={monthlyData} />
    </div>
  );
}
