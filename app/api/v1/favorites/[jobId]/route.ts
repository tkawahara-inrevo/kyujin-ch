/**
 * DELETE /api/v1/favorites/{jobId} - お気に入り削除
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { unauthorized } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  let ctx;
  try {
    ctx = await authenticate(req);
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }
  const { jobId } = await params;
  await prisma.favorite.deleteMany({ where: { userId: ctx.userId, jobId } });
  return new NextResponse(null, { status: 204 });
}
