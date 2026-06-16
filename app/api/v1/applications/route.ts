/**
 * GET /api/v1/applications  - 自分の応募一覧（認証必須）
 * POST /api/v1/applications - 求人へ応募（認証必須）
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { badRequest, conflict, notFound, unauthorized } from "@/lib/api/errors";
import { toApplication } from "./_lib/format";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let ctx;
  try {
    ctx = await authenticate(req);
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }

  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const apps = await prisma.application.findMany({
    where: { userId: ctx.userId, ...(status ? { status: status as never } : {}) },
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        include: {
          company: { select: { id: true, name: true, description: true, websiteUrl: true } },
        },
      },
    },
  });

  return NextResponse.json(apps.map(toApplication));
}

export async function POST(req: NextRequest) {
  let ctx;
  try {
    ctx = await authenticate(req);
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }

  let body: { jobId?: string; motivation?: string };
  try {
    body = await req.json();
  } catch {
    return badRequest("不正なJSONです");
  }

  const jobId = body.jobId?.trim();
  if (!jobId) return badRequest("jobId は必須です");

  const job = await prisma.job.findFirst({
    where: { id: jobId, isPublished: true, reviewStatus: "PUBLISHED", isDeleted: false },
    select: { id: true },
  });
  if (!job) return notFound("求人が見つかりません");

  const existing = await prisma.application.findFirst({
    where: { userId: ctx.userId, jobId },
    select: { id: true },
  });
  if (existing) return conflict("既に応募済みです");

  const app = await prisma.application.create({
    data: {
      userId: ctx.userId,
      jobId,
      motivation: body.motivation?.trim() || null,
    },
    include: {
      job: {
        include: {
          company: { select: { id: true, name: true, description: true, websiteUrl: true } },
        },
      },
    },
  });

  return NextResponse.json(toApplication(app), { status: 201 });
}
