/**
 * GET /api/v1/applications/{id} - 応募詳細（本人のみ）
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { notFound, unauthorized } from "@/lib/api/errors";
import { toApplication } from "../_lib/format";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let ctx;
  try {
    ctx = await authenticate(req);
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }
  const { id } = await params;

  const app = await prisma.application.findFirst({
    where: { id, userId: ctx.userId },
    include: {
      job: {
        include: {
          company: { select: { id: true, name: true, description: true, websiteUrl: true } },
        },
      },
    },
  });

  if (!app) return notFound("応募が見つかりません");

  return NextResponse.json(toApplication(app));
}
