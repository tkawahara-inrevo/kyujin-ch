import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/s3";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applicationId = req.nextUrl.searchParams.get("applicationId");
  const docType = req.nextUrl.searchParams.get("docType");

  if (!applicationId || !docType) {
    return NextResponse.json(
      { error: "applicationId and docType are required" },
      { status: 400 },
    );
  }

  const company = await prisma.company.findFirst({
    where: { companyUserId: session.user.id },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      job: { companyId: company.id },
    },
    include: {
      user: {
        select: {
          resumeUrl: true,
          careerHistoryUrl: true,
        },
      },
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const fileUrl =
    docType === "resume"
      ? application.user.resumeUrl
      : docType === "careerHistory"
        ? application.user.careerHistoryUrl
        : null;

  if (!fileUrl) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const signedUrl = await getPresignedUrl(fileUrl);
  return NextResponse.redirect(signedUrl);
}
