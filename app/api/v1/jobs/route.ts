/**
 * GET /api/v1/jobs
 * 求人一覧・検索（認証任意）
 *
 * クエリ:
 *   q, prefectures (カンマ区切り), category, subcategory,
 *   employmentType, experience, salary, target,
 *   sort (new|popular), page, pageSize
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateOptional } from "@/lib/api/auth";
import { buildPublishedJobSearchWhere } from "@/lib/job-search";
import { toJobSummary } from "./_lib/format";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ctx = await authenticateOptional(req);
  const sp = req.nextUrl.searchParams;

  const page = Math.max(1, Number(sp.get("page") || "1"));
  const pageSize = Math.min(50, Math.max(1, Number(sp.get("pageSize") || "20")));
  const sort = sp.get("sort") || "new";

  const where = buildPublishedJobSearchWhere({
    q: sp.get("q") ?? undefined,
    prefectures: sp.get("prefectures")?.split(",").filter(Boolean) ?? [],
    category: sp.get("category") ?? undefined,
    subcategory: sp.get("subcategory") ?? undefined,
    employmentType: sp.get("employmentType") ?? undefined,
    experience: sp.get("experience") ?? undefined,
    salary: sp.get("salary") ?? undefined,
    target: sp.get("target") ?? undefined,
  });

  const orderBy = sort === "popular"
    ? [{ viewCount: "desc" as const }, { createdAt: "desc" as const }]
    : [{ reviewStatusChangedAt: "desc" as const }, { createdAt: "desc" as const }];

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        company: { select: { id: true, name: true, description: true, websiteUrl: true } },
      },
    }),
  ]);

  // お気に入り判定（認証済みのみ）
  let favoriteJobIds = new Set<string>();
  if (ctx && jobs.length > 0) {
    const favs = await prisma.favorite.findMany({
      where: { userId: ctx.userId, jobId: { in: jobs.map((j) => j.id) } },
      select: { jobId: true },
    });
    favoriteJobIds = new Set(favs.map((f) => f.jobId));
  }

  return NextResponse.json({
    items: jobs.map((j) => toJobSummary(j, { favoriteJobIds })),
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}
