import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const JOB_VIEW_SESSION_COOKIE = "jobview_session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let sessionId = request.cookies.get(JOB_VIEW_SESSION_COOKIE)?.value;
  let shouldSetCookie = false;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    shouldSetCookie = true;
  }

  // Check job exists
  const job = await prisma.job.findUnique({ where: { id }, select: { id: true } });
  if (!job) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const existingView = await prisma.jobView.findFirst({
    where: { jobId: id, sessionId },
    select: { id: true },
  });

  if (!existingView) {
    await Promise.all([
      prisma.job.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      }),
      prisma.jobView.create({
        data: { jobId: id, sessionId },
      }),
    ]);
  }

  const response = NextResponse.json({ ok: true, counted: !existingView });
  if (shouldSetCookie) {
    response.cookies.set(JOB_VIEW_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}
