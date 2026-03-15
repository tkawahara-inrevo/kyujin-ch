import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") {
    return NextResponse.json({ count: 0 });
  }

  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.json({ count: 0 });
  }

  const count = await prisma.application.count({
    where: {
      status: "APPLIED",
      job: { companyId: company.id },
    },
  });

  return NextResponse.json({ count });
}
