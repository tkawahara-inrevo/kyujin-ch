"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveResumeProfile(data: {
  prText: string;
  jobPreference: string;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "USER") throw new Error("Unauthorized");
  const userId = session.user.id;

  await prisma.resumeProfile.upsert({
    where: { userId },
    update: { prText: data.prText, jobPreference: data.jobPreference },
    create: { userId, prText: data.prText, jobPreference: data.jobPreference },
  });

  revalidatePath("/mypage/resume-builder");
}

export async function getResumeProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.resumeProfile.findUnique({
    where: { userId: session.user.id },
  });
}
