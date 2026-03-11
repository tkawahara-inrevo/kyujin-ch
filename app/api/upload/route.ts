import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { uploadToS3, getPresignedUrl } from "@/lib/s3";
import path from "path";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const docType = req.nextUrl.searchParams.get("docType");
  if (!docType) {
    return NextResponse.json({ error: "docType is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const fileUrl = docType === "resume" ? user?.resumeUrl : user?.careerHistoryUrl;

  if (!fileUrl) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const signedUrl = await getPresignedUrl(fileUrl);
  return NextResponse.json({ url: signedUrl });
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const docType = formData.get("docType") as string | null;

  if (!file || !docType) {
    return NextResponse.json({ error: "ファイルとタイプを指定してください" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "対応形式はPDF/DOCX/XLSXのみです" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "ファイルサイズは10MB以下にしてください" }, { status: 400 });
  }

  const ext = path.extname(file.name);
  const key = `documents/${session.user.id}/${docType}${ext}`;

  const bytes = await file.arrayBuffer();
  const fileUrl = await uploadToS3(key, Buffer.from(bytes), file.type);

  if (docType === "resume") {
    await prisma.user.update({ where: { id: session.user.id }, data: { resumeUrl: fileUrl } });
  } else if (docType === "careerHistory") {
    await prisma.user.update({ where: { id: session.user.id }, data: { careerHistoryUrl: fileUrl } });
  }

  return NextResponse.json({ url: fileUrl });
}
