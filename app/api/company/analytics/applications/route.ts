import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompany } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  const session = await requireCompany();
  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) {
    return NextResponse.json([], { status: 403 });
  }

  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json([], { status: 400 });
  }

  // Verify the job belongs to this company
  const job = await prisma.job.findFirst({
    where: { id: jobId, companyId: company.id, isDeleted: false },
  });
  if (!job) {
    return NextResponse.json([], { status: 404 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const applications = await prisma.application.findMany({
    where: {
      jobId,
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { createdAt: true },
  });

  // Build day-by-day counts for last 30 days
  const dayCounts: { date: string; count: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    dayCounts.push({ date: dateStr, count: 0 });
  }

  for (const app of applications) {
    const dateStr = app.createdAt.toISOString().slice(0, 10);
    const entry = dayCounts.find((dc) => dc.date === dateStr);
    if (entry) entry.count++;
  }

  return NextResponse.json(dayCounts);
}
