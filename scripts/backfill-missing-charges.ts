import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { InvalidRequestStatus, PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter });

function billingMonthFromDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

async function main() {
  const applications = await prisma.application.findMany({
    where: {
      charge: null,
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          categoryTag: true,
          companyId: true,
          company: {
            select: {
              name: true,
            },
          },
        },
      },
      invalidRequests: {
        select: {
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (applications.length === 0) {
    console.log("No missing charges found.");
    return;
  }

  const priceEntries = await prisma.priceEntry.findMany({
    select: {
      subcategory: true,
      experiencedPrice: true,
    },
  });

  const priceMap = new Map(
    priceEntries.map((entry) => [entry.subcategory.trim(), entry.experiencedPrice]),
  );

  let createdCount = 0;
  let invalidCount = 0;

  await prisma.$transaction(async (tx) => {
    for (const application of applications) {
      const category = application.job.categoryTag?.trim() ?? "";
      const amount = priceMap.get(category) ?? 11000;
      const hasApprovedInvalidRequest = application.invalidRequests.some(
        (request) => request.status === InvalidRequestStatus.APPROVED,
      );

      await tx.charge.create({
        data: {
          applicationId: application.id,
          amount,
          isValid: !hasApprovedInvalidRequest,
          billingMonth: billingMonthFromDate(application.createdAt),
          createdAt: application.createdAt,
        },
      });

      createdCount += 1;
      if (hasApprovedInvalidRequest) invalidCount += 1;
    }

    const monthlyChargeRows = await tx.charge.findMany({
      where: { isValid: true },
      include: {
        application: {
          include: {
            job: {
              select: {
                companyId: true,
              },
            },
          },
        },
      },
    });

    const monthlyTotals = new Map<string, { companyId: string; billingMonth: string; totalAmount: number }>();

    for (const charge of monthlyChargeRows) {
      const companyId = charge.application.job.companyId;
      const key = `${companyId}:${charge.billingMonth}`;
      const current = monthlyTotals.get(key);

      if (current) {
        current.totalAmount += charge.amount;
      } else {
        monthlyTotals.set(key, {
          companyId,
          billingMonth: charge.billingMonth,
          totalAmount: charge.amount,
        });
      }
    }

    await tx.monthlyBilling.deleteMany();
    if (monthlyTotals.size > 0) {
      await tx.monthlyBilling.createMany({
        data: Array.from(monthlyTotals.values()),
      });
    }
  });

  const preview = applications.slice(0, 10).map((application) => ({
    applicationId: application.id,
    companyName: application.job.company.name,
    jobTitle: application.job.title,
    billingMonth: billingMonthFromDate(application.createdAt),
  }));

  console.log(
    JSON.stringify(
      {
        createdCount,
        invalidCount,
        preview,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
