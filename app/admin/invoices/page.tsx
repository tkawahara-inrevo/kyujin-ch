import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { InvoiceMonthSwitcher } from "./invoice-month-switcher";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  await requireAdmin();

  const now = new Date();

  // 過去3ヶ月～当月の月リストを生成
  const months: string[] = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }

  // 各月の請求データを取得
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

      // 企業別に集計
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

      const breakdown = Object.values(byCompany).sort(
        (a, b) => b.total - a.total
      );
      const grandTotal = breakdown.reduce((s, c) => s + c.total, 0);
      const totalCount = charges.length;

      return { month, grandTotal, totalCount, breakdown };
    })
  );

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e293b]">請求管理</h1>
      <p className="mt-1 text-[13px] text-[#888]">
        過去3ヶ月～当月の請求額と企業別内訳
      </p>

      <InvoiceMonthSwitcher months={months} monthlyData={monthlyData} />
    </div>
  );
}
