import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { uploadToS3 } from "@/lib/s3";
import { randomUUID } from "crypto";
import path from "path";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "ファイルを指定してください" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "JPEG/PNG/WebP/GIFのみ対応" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "10MB以下にしてください" }, { status: 400 });

  const ext = path.extname(file.name) || ".jpg";
  const key = `column-images/${randomUUID()}${ext}`;
  const bytes = await file.arrayBuffer();

  try {
    const url = await uploadToS3(key, Buffer.from(bytes), file.type);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "アップロードに失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
