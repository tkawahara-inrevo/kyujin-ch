import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
  if (!company) return NextResponse.json({ count: 0 });

  const count = await prisma.message.count({
    where: {
      isRead: false,
      senderType: "USER",
      conversation: {
        application: { job: { companyId: company.id } },
      },
    },
  });

  return NextResponse.json({ count });
}
