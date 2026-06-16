/**
 * DELETE /api/v1/blocks/{userId} - ブロック解除
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { unauthorized } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  let ctx;
  try {
    ctx = await authenticate(req);
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }
  const { userId: blockedId } = await params;
  await prisma.block.deleteMany({ where: { blockerId: ctx.userId, blockedId } });
  return new NextResponse(null, { status: 204 });
}
