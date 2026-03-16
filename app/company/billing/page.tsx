import { prisma } from "@/lib/prisma";
import { requireCompany } from "@/lib/auth-helpers";
import { MonthSwitcher } from "./month-switcher";
import { PricingTable } from "./pricing-table";
import type { ChargeRow } from "@/app/actions/company/billing";

export default async function CompanyBillingPage() {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthRows = await prisma.charge.findMany({
    where: {
      application: { job: { companyId: company.id } },
    },
    select: {
      billingMonth: true,
    },
    distinct: ["billingMonth"],
    orderBy: {
      billingMonth: "asc",
    },
  });

  const availableMonths = Array.from(
    new Set([
      ...monthRows.map((row) => row.billingMonth),
      thisMonth,
    ]),
  ).sort((a, b) => a.localeCompare(b));

  const initialMonth = availableMonths.includes(thisMonth)
    ? thisMonth
    : availableMonths[availableMonths.length - 1] ?? thisMonth;

  // Fetch selected month charges for initial render
  const [aggregate, chargeRows, priceEntries] = await Promise.all([
    prisma.charge.aggregate({
      where: {
        isValid: true,
        billingMonth: initialMonth,
        application: { job: { companyId: company.id } },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.charge.findMany({
      where: {
        billingMonth: initialMonth,
        application: { job: { companyId: company.id } },
      },
      include: {
        application: {
          include: {
            user: true,
            job: true,
            invalidRequests: { where: { status: "PENDING" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.priceEntry.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    }),
  ]);

  const initialCharges: ChargeRow[] = chargeRows.map((ch) => ({
    id: ch.id,
    createdAt: ch.createdAt.toISOString(),
    jobTitle: ch.application.job.title,
    userName: ch.application.user.name ?? "不明",
    amount: ch.amount,
    isValid: ch.isValid,
    applicationId: ch.application.id,
    hasExistingRequest: ch.application.invalidRequests.length > 0,
  }));

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">請求管理</h1>

      {/* Month Switcher + Charges Table */}
      <MonthSwitcher
        initialMonth={initialMonth}
        initialCharges={initialCharges}
        initialTotal={aggregate._sum.amount ?? 0}
        initialCount={aggregate._count}
        availableMonths={availableMonths}
      />

      {/* Collapsible Pricing Table with PDF Download */}
      <PricingTable priceEntries={priceEntries} />
    </div>
  );
}
