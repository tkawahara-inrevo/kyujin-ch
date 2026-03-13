import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 一時的なデバッグ用エンドポイント - 確認後削除すること
export async function GET() {
  // 管理者アカウント確認
  const admin = await prisma.user.findUnique({
    where: { email: "admin@kyujin-ch.com" },
  });

  // 企業アカウント確認
  const company01 = await prisma.user.findUnique({
    where: { email: "company01@test.com" },
  });

  const results: Record<string, unknown> = {};

  if (admin) {
    results.admin = {
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      hasPassword: !!admin.password,
      matchAdmin1234: admin.password
        ? await bcrypt.compare("admin1234", admin.password)
        : false,
      matchAdmin123: admin.password
        ? await bcrypt.compare("admin123", admin.password)
        : false,
    };
  } else {
    results.admin = "NOT FOUND";
  }

  if (company01) {
    results.company01 = {
      email: company01.email,
      role: company01.role,
      isActive: company01.isActive,
      hasPassword: !!company01.password,
      matchTest1234: company01.password
        ? await bcrypt.compare("test1234", company01.password)
        : false,
      matchPassword123: company01.password
        ? await bcrypt.compare("password123", company01.password)
        : false,
    };
  } else {
    results.company01 = "NOT FOUND";
  }

  // 全COMPANY/ADMINユーザー数
  const counts = await prisma.user.groupBy({
    by: ["role"],
    _count: true,
  });
  results.roleCounts = counts;

  return NextResponse.json(results);
}
