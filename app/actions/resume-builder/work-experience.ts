"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveWorkExperiences(
  entries: {
    id?: string;
    companyName: string;
    department: string;
    jobType: string;
    startYear: number;
    startMonth: number;
    endYear: number | null;
    endMonth: number | null;
    isCurrent: boolean;
    description: string;
    sortOrder: number;
  }[]
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "USER") throw new Error("Unauthorized");
  const userId = session.user.id;

  await prisma.$transaction([
    prisma.workExperience.deleteMany({ where: { userId } }),
    ...entries.map((e) =>
      prisma.workExperience.create({
        data: {
          userId,
          companyName: e.companyName,
          department: e.department || null,
          jobType: e.jobType || null,
          startYear: e.startYear,
          startMonth: e.startMonth,
          endYear: e.isCurrent ? null : e.endYear,
          endMonth: e.isCurrent ? null : e.endMonth,
          isCurrent: e.isCurrent,
          description: e.description || null,
          sortOrder: e.sortOrder,
        },
      })
    ),
  ]);

  revalidatePath("/mypage/resume-builder");
}

export async function getWorkExperiences() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.workExperience.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "asc" },
  });
}
