/**
 * GET /api/v1/jobs/{id}
 * 求人詳細（認証任意・お気に入り/応募済み判定は認証時のみ）
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateOptional } from "@/lib/api/auth";
import { notFound } from "@/lib/api/errors";
import { toJobDetail } from "../_lib/format";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await authenticateOptional(req);
  const { id } = await params;

  const job = await prisma.job.findFirst({
    where: {
      id,
      isPublished: true,
      reviewStatus: "PUBLISHED",
      isDeleted: false,
    },
    include: {
      company: { select: { id: true, name: true, description: true, websiteUrl: true } },
    },
  });

  if (!job) return notFound("求人が見つかりません");

  let favoriteJobIds = new Set<string>();
  let hasApplied = false;

  if (ctx) {
    const [fav, app] = await Promise.all([
      prisma.favorite.findFirst({
        where: { userId: ctx.userId, jobId: id },
        select: { id: true },
      }),
      prisma.application.findFirst({
        where: { userId: ctx.userId, jobId: id },
        select: { id: true },
      }),
    ]);
    if (fav) favoriteJobIds.add(id);
    hasApplied = !!app;
  }

  return NextResponse.json(toJobDetail(job, { favoriteJobIds, hasApplied }));
}
