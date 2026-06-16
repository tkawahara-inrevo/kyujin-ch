/**
 * GET  /api/v1/favorites - お気に入り一覧（求人サマリ配列）
 * POST /api/v1/favorites - お気に入り追加 (body: { jobId })
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { badRequest, conflict, notFound, unauthorized } from "@/lib/api/errors";
import { toJobSummary } from "../jobs/_lib/format";

export const dynamic = "force-dynamic";

async function withAuth(
  req: NextRequest,
  fn: (userId: string) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    const ctx = await authenticate(req);
    return await fn(ctx.userId);
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }
}

export async function GET(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const favs = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          include: {
            company: { select: { id: true, name: true, description: true, websiteUrl: true } },
          },
        },
      },
    });
    const all = new Set(favs.map((f) => f.jobId));
    const items = favs
      .filter((f) => f.job && !f.job.isDeleted)
      .map((f) => toJobSummary(f.job, { favoriteJobIds: all }));
    return NextResponse.json(items);
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (userId) => {
    let body: { jobId?: string };
    try {
      body = await req.json();
    } catch {
      return badRequest("不正なJSONです");
    }
    const jobId = body.jobId?.trim();
    if (!jobId) return badRequest("jobId は必須です");

    const job = await prisma.job.findFirst({
      where: { id: jobId, isPublished: true, isDeleted: false },
      select: { id: true },
    });
    if (!job) return notFound("求人が見つかりません");

    try {
      await prisma.favorite.create({ data: { userId, jobId } });
    } catch (e: unknown) {
      // unique 違反 = 既に追加済み
      if ((e as { code?: string })?.code === "P2002") {
        return conflict("既に追加済みです");
      }
      throw e;
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  });
}
