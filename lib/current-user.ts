import { prisma } from "@/lib/prisma";

export const CURRENT_USER_EMAIL = "applicant@test.com";

export async function getCurrentUser() {
  const user = await prisma.user.findUnique({
    where: {
      email: CURRENT_USER_EMAIL,
    },
  });

  if (!user) {
    throw new Error("仮ユーザーが見つかりません。seed を実行してください。");
  }

  return user;
}