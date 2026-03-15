import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { s3, S3_BUCKET } from "@/lib/s3";

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

  const key = new URL(message.attachmentUrl).pathname.slice(1);
  const object = await s3.send(
    new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }),
  );

  if (!object.Body) {
    return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
  }

  const fileName = message.attachmentName ?? "attachment";
  const encodedFileName = encodeURIComponent(fileName);
  const bytes = Buffer.from(await object.Body.transformToByteArray());

  return new Response(bytes, {
    headers: {
      "Content-Type":
        message.attachmentType ||
        object.ContentType ||
        "application/octet-stream",
      "Content-Length": object.ContentLength?.toString() ?? "",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodedFileName}`,
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
