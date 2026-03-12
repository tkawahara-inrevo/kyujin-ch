import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Check job exists
  const job = await prisma.job.findUnique({ where: { id }, select: { id: true } });
  if (!job) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // Increment viewCount and create JobView record
  await Promise.all([
    prisma.job.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }),
    prisma.jobView.create({
      data: { jobId: id },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
