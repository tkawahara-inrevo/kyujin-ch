import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 一時的: パスワードリセット＆アカウント作成
export async function POST() {
  const adminPw = await bcrypt.hash("admin1234", 10);
  const companyPw = await bcrypt.hash("test1234", 10);

  // 管理者アカウント - なければ作成、あればパスワードリセット
  const admin = await prisma.user.upsert({
    where: { email: "admin@kyujin-ch.com" },
    update: { password: adminPw, isActive: true },
    create: {
      name: "管理者",
      email: "admin@kyujin-ch.com",
      password: adminPw,
      role: "ADMIN",
    },
  });

  // 企業アカウント company01 のパスワードリセット
  const company01 = await prisma.user.findUnique({
    where: { email: "company01@test.com" },
  });

  let companyResult;
  if (company01) {
    await prisma.user.update({
      where: { email: "company01@test.com" },
      data: { password: companyPw, isActive: true },
    });
    companyResult = "password reset done";
  } else {
    companyResult = "NOT FOUND - need to run seed";
  }

  return NextResponse.json({
    admin: { email: admin.email, role: admin.role, status: "password reset to admin1234" },
    company01: companyResult,
  });
}
