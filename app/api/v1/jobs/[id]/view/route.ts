/**
 * POST /api/v1/jobs/{id}/view
 * 求人閲覧記録（PVカウント）。認証不要。
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.job.updateMany({
    where: { id, isPublished: true, isDeleted: false },
    data: { viewCount: { increment: 1 } },
  });
  return new NextResponse(null, { status: 204 });
}
