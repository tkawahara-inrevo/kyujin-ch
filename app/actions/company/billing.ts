"use server";

import { prisma } from "@/lib/prisma";
import { requireCompany } from "@/lib/auth-helpers";

export type ChargeRow = {
  id: string;
  createdAt: string;
  jobTitle: string;
  userName: string;
  amount: number;
  isValid: boolean;
  applicationId: string;
  hasExistingRequest: boolean;
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

  // Validate billingMonth format
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

  const charges: ChargeRow[] = chargeRows.map((ch) => ({
    id: ch.id,
    createdAt: ch.createdAt.toISOString(),
    jobTitle: ch.application.job.title,
    userName: ch.application.user.name ?? "不明",
    amount: ch.amount,
    isValid: ch.isValid,
    applicationId: ch.application.id,
    hasExistingRequest: ch.application.invalidRequests.length > 0,
  }));

  return {
    charges,
    totalAmount: aggregate._sum.amount ?? 0,
    count: aggregate._count,
  };
}
