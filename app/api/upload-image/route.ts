import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadToS3 } from "@/lib/s3";
import { randomUUID } from "crypto";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "ファイルを指定してください" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "対応形式はJPEG/PNG/WebP/GIFのみです" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "ファイルサイズは5MB以下にしてください" },
      { status: 400 }
    );
  }

  const ext = path.extname(file.name) || ".jpg";
  const key = `images/${randomUUID()}${ext}`;
  const bytes = await file.arrayBuffer();

  try {
    const url = await uploadToS3(key, Buffer.from(bytes), file.type);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload-image] S3 upload error:", err);
    const message = err instanceof Error ? err.message : "S3アップロードに失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
