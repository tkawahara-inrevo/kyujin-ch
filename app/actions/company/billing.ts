"use server";

import { requireCompany } from "@/lib/auth-helpers";
import { canSubmitInvalidRequest } from "@/lib/invalid-request-deadline";
import { prisma } from "@/lib/prisma";

export type ChargeRow = {
  id: string;
  createdAt: string;
  jobTitle: string;
  userName: string;
  amount: number;
  isValid: boolean;
  applicationId: string;
  hasExistingRequest: boolean;
  canRequestInvalidation: boolean;
};

export type MonthChargesResult = {
  charges: ChargeRow[];
  totalAmount: number;
  count: number;
};

export async function getChargesForMonth(billingMonth: string): Promise<MonthChargesResult> {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });

  if (!company) {
    return { charges: [], totalAmount: 0, count: 0 };
  }

  if (!/^\d{4}-\d{2}$/.test(billingMonth)) {
    return { charges: [], totalAmount: 0, count: 0 };
  }

  const [aggregate, chargeRows] = await Promise.all([
    prisma.charge.aggregate({
      where: {
        isValid: true,
        billingMonth,
        application: { job: { companyId: company.id } },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.charge.findMany({
      where: {
        billingMonth,
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
  ]);

  const charges: ChargeRow[] = chargeRows.map((charge) => ({
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

  return {
    charges,
    totalAmount: aggregate._sum.amount ?? 0,
    count: aggregate._count,
  };
}
