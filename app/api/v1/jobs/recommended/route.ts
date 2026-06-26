/**
 * GET /api/v1/jobs/recommended
 * おすすめ求人（認証任意・MVP では PV 順 + 新着）
 * 認証ユーザがいる場合は将来 personalize できるよう拡張可能。
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateOptional } from "@/lib/api/auth";
import { toJobSummary } from "../_lib/format";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ctx = await authenticateOptional(req);

  const jobs = await prisma.job.findMany({
    where: {
      isPublished: true,
      reviewStatus: "PUBLISHED",
      isDeleted: false,
      company: { isTest: false },
    },
    orderBy: [
      { viewCount: "desc" },
      { reviewStatusChangedAt: "desc" },
    ],
    take: 10,
    include: {
      company: { select: { id: true, name: true, description: true, websiteUrl: true } },
    },
  });

  let favoriteJobIds = new Set<string>();
  if (ctx && jobs.length > 0) {
    const favs = await prisma.favorite.findMany({
      where: { userId: ctx.userId, jobId: { in: jobs.map((j) => j.id) } },
      select: { jobId: true },
    });
    favoriteJobIds = new Set(favs.map((f) => f.jobId));
  }

  return NextResponse.json(jobs.map((j) => toJobSummary(j, { favoriteJobIds })));
}
