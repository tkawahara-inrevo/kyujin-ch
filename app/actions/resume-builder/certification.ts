"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveCertifications(
  entries: {
    id?: string;
    name: string;
    year: number;
    month: number;
    sortOrder: number;
  }[]
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "USER") throw new Error("Unauthorized");
  const userId = session.user.id;

  await prisma.$transaction([
    prisma.certification.deleteMany({ where: { userId } }),
    ...entries.map((e) =>
      prisma.certification.create({
        data: {
          userId,
          name: e.name,
          year: e.year,
          month: e.month,
          sortOrder: e.sortOrder,
        },
      })
    ),
  ]);

  revalidatePath("/mypage/resume-builder");
}

export async function getCertifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.certification.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "asc" },
  });
}
