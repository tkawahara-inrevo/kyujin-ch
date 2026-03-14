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
  if (!session?.user?.id || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const applicationId = formData.get("applicationId") as string | null;

  if (!file || !applicationId) {
    return NextResponse.json({ error: "file and applicationId are required" }, { status: 400 });
  }

  const application = await prisma.application.findFirst({
    where: { id: applicationId, job: { companyId: company.id } },
    select: { id: true },
  });
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
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
  const key = `message-attachments/${company.id}/${applicationId}/${Date.now()}-${safeBaseName}${ext}`;

  const bytes = await file.arrayBuffer();
  const attachmentUrl = await uploadToS3(key, Buffer.from(bytes), file.type);

  return NextResponse.json({
    attachmentUrl,
    attachmentName: file.name,
    attachmentType: file.type,
  });
}
