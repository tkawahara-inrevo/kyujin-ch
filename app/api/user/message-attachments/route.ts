import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadToS3 } from "@/lib/s3";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const conversationId = formData.get("conversationId") as string | null;

  if (!file || !conversationId) {
    return NextResponse.json({ error: "file and conversationId are required" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      application: { userId: session.user.id },
    },
    select: { id: true },
  });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "PDF, DOCX, XLSX only" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File size must be 10MB or less" }, { status: 400 });
  }

  const ext = path.extname(file.name);
  const safeBaseName = path
    .basename(file.name, ext)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 50) || "attachment";
  const key = `message-attachments/users/${session.user.id}/${conversationId}/${Date.now()}-${safeBaseName}${ext}`;

  const bytes = await file.arrayBuffer();
  const attachmentUrl = await uploadToS3(key, Buffer.from(bytes), file.type);

  return NextResponse.json({
    attachmentUrl,
    attachmentName: file.name,
    attachmentType: file.type,
  });
}
