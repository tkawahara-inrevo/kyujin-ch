import type { ChargeRow } from "@/app/actions/company/billing";
import { requireCompany } from "@/lib/auth-helpers";
import { canSubmitInvalidRequest } from "@/lib/invalid-request-deadline";
import { prisma } from "@/lib/prisma";
import { MonthSwitcher } from "./month-switcher";
import { PricingTable } from "./pricing-table";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CompanyBillingPage() {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });

  if (!company) {
    return <div className="p-10 text-[#888]">企業情報が見つかりません</div>;
  }

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
    new Set([...monthRows.map((row) => row.billingMonth), thisMonth]),
  ).sort((a, b) => a.localeCompare(b));

  const billedMonths = monthRows.map((row) => row.billingMonth);
  const initialMonth = billedMonths.includes(thisMonth)
    ? thisMonth
    : billedMonths[billedMonths.length - 1] ?? thisMonth;

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
      orderBy: [{ categorySortOrder: "asc" }, { sortOrder: "asc" }],
    }),
  ]);

  const initialCharges: ChargeRow[] = chargeRows.map((charge) => ({
    id: charge.id,
    createdAt: charge.createdAt.toISOString(),
    jobTitle: charge.application.job.title,
    userName: charge.application.user.name ?? "応募者",
    amount: charge.amount,
    isValid: charge.isValid,
    applicationId: charge.application.id,
    hasExistingRequest: charge.application.invalidRequests.length > 0,
    canRequestInvalidation: canSubmitInvalidRequest(charge.application.createdAt),
  }));

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-[24px] font-bold text-[#1e3a5f]">請求管理</h1>
      <p className="mt-3 rounded-[10px] border border-[#dbe7ff] bg-[#f3f7ff] px-4 py-3 text-[13px] font-medium text-[#2b4ea2]">
        2026年4月6日〜2026年7月6日は無料期間のため、応募が発生しても請求は発生しません。
      </p>

      <MonthSwitcher
        initialMonth={initialMonth}
        initialCharges={initialCharges}
        initialTotal={aggregate._sum.amount ?? 0}
        initialCount={aggregate._count}
        availableMonths={availableMonths}
      />

      <PricingTable priceEntries={priceEntries} />
    </div>
  );
}
