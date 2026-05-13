"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveEducations(
  entries: {
    id?: string;
    schoolType: string;
    schoolName: string;
    faculty: string;
    status: string;
    year: number;
    month: number;
    sortOrder: number;
  }[]
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  await prisma.$transaction([
    prisma.education.deleteMany({ where: { userId } }),
    ...entries.map((e) =>
      prisma.education.create({
        data: {
          userId,
          schoolType: e.schoolType,
          schoolName: e.schoolName,
          faculty: e.faculty || null,
          status: e.status,
          year: e.year,
          month: e.month,
          sortOrder: e.sortOrder,
        },
      })
    ),
  ]);

  revalidatePath("/mypage/resume-builder");
}

export async function getEducations() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.education.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "asc" },
  });
}
