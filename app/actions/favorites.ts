"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function addFavorite(jobId: string) {
  const user = await getCurrentUser();

  await prisma.favorite.upsert({
    where: {
      userId_jobId: {
        userId: user.id,
        jobId,
      },
    },
    update: {},
    create: {
      userId: user.id,
      jobId,
    },
  });
}

export async function removeFavorite(jobId: string) {
  const user = await getCurrentUser();

  await prisma.favorite.deleteMany({
    where: {
      userId: user.id,
      jobId,
    },
  });
}