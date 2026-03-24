import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPresignedUrl, uploadToS3 } from "@/lib/s3";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

function isValidDocType(value: string | null): value is "resume" | "careerHistory" {
  return value === "resume" || value === "careerHistory";
}

function serverError(message = "アップロード処理に失敗しました") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const docType = req.nextUrl.searchParams.get("docType");
    if (!isValidDocType(docType)) {
      return NextResponse.json({ error: "docType is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { resumeUrl: true, careerHistoryUrl: true },
    });

    const fileUrl = docType === "resume" ? user?.resumeUrl : user?.careerHistoryUrl;

    if (!fileUrl) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const signedUrl = await getPresignedUrl(fileUrl);
    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Failed to fetch uploaded document", error);
    return serverError("ファイルを開けませんでした");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const docType = formData.get("docType");

    if (!(file instanceof File) || typeof docType !== "string" || !isValidDocType(docType)) {
      return NextResponse.json(
        { error: "ファイルと種類を指定してください" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "対応形式は PDF / DOCX / XLSX のみです" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "ファイルサイズは10MB以下にしてください" },
        { status: 400 },
      );
    }

    const ext = path.extname(file.name);
    const key = `documents/${session.user.id}/${docType}${ext}`;
    const bytes = await file.arrayBuffer();
    const fileUrl = await uploadToS3(key, Buffer.from(bytes), file.type);

    await prisma.user.update({
      where: { id: session.user.id },
      data: docType === "resume" ? { resumeUrl: fileUrl } : { careerHistoryUrl: fileUrl },
    });

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Failed to upload document", error);
    return serverError();
  }
}
