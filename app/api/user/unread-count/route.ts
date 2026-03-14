import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "USER") {
    return NextResponse.json({ count: 0 });
  }

  const count = await prisma.message.count({
    where: {
      isRead: false,
      senderType: { in: ["COMPANY", "ADMIN"] },
      conversation: {
        application: { userId: session.user.id },
      },
    },
  });

  return NextResponse.json({ count });
}
