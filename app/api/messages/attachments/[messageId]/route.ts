import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/s3";

type RouteProps = {
  params: Promise<{ messageId: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messageId } = await params;
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      conversation: {
        include: {
          application: {
            include: {
              job: {
                include: {
                  company: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!message?.attachmentUrl) {
    return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
  }

  const application = message.conversation.application;
  const canAccess =
    session.user.role === "ADMIN" ||
    (session.user.role === "USER" && application.userId === session.user.id) ||
    (session.user.role === "COMPANY" && application.job.company.companyUserId === session.user.id);

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const signedUrl = await getPresignedUrl(message.attachmentUrl);
  return NextResponse.redirect(signedUrl);
}
