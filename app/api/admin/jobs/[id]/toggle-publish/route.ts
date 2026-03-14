import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id }, select: { isPublished: true } });
  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.job.update({
    where: { id },
    data: { isPublished: !job.isPublished },
  });

  return NextResponse.json({ ok: true });
}
