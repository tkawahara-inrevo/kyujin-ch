/**
 * POST /api/v1/me/avatar - アバター画像アップロード
 * Body: multipart/form-data { file }
 * Returns: { url }
 */
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { uploadToS3 } from "@/lib/s3";
import { badRequest, unauthorized } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  let ctx;
  try {
    ctx = await authenticate(req);
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }

  const fd = await req.formData();
  const file = fd.get("file") as File | null;
  if (!file) return badRequest("file は必須です");
  if (!ALLOWED.includes(file.type)) return badRequest("JPEG/PNG/WebP のみ対応");
  if (file.size > MAX_SIZE) return badRequest("5MB以下にしてください");

  const ext = path.extname(file.name) || ".jpg";
  const key = `images/avatars/${ctx.userId}/${randomUUID()}${ext}`;
  const bytes = await file.arrayBuffer();
  const url = await uploadToS3(key, Buffer.from(bytes), file.type);

  await prisma.user.update({ where: { id: ctx.userId }, data: { image: url } });

  return NextResponse.json({ url });
}
