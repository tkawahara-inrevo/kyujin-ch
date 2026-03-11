"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function submitApplication(jobId: string, motivation: string) {
  const user = await getCurrentUser();

  const existing = await prisma.application.findUnique({
    where: { userId_jobId: { userId: user.id, jobId } },
  });

  if (existing) {
    redirect("/applications");
  }

  const application = await prisma.application.create({
    data: { userId: user.id, jobId, motivation },
  });

  await prisma.conversation.create({
    data: { applicationId: application.id },
  });

  redirect("/applications");
}
