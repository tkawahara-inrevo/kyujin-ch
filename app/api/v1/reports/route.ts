/**
 * POST /api/v1/reports - 通報送信（認証必須）
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { badRequest, unauthorized } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set(["job", "company", "user", "message"]);

export async function POST(req: NextRequest) {
  let ctx;
  try {
    ctx = await authenticate(req);
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }
  let body: { targetType?: string; targetId?: string; reason?: string; detail?: string };
  try {
    body = await req.json();
  } catch {
    return badRequest("不正なJSONです");
  }
  const targetType = body.targetType?.trim();
  const targetId = body.targetId?.trim();
  const reason = body.reason?.trim();

  if (!targetType || !ALLOWED_TYPES.has(targetType)) {
    return badRequest("targetType は job/company/user/message のいずれか");
  }
  if (!targetId) return badRequest("targetId は必須です");
  if (!reason) return badRequest("reason は必須です");

  const report = await prisma.report.create({
    data: {
      reporterId: ctx.userId,
      targetType,
      targetId,
      reason,
      detail: body.detail?.trim() || null,
    },
    select: { id: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, id: report.id, createdAt: report.createdAt.toISOString() }, { status: 201 });
}
