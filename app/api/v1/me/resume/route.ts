/**
 * GET /api/v1/me/resume - 履歴書データ取得（基本情報・学歴・職歴・資格・自己PR・希望条件）
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { unauthorized, notFound } from "@/lib/api/errors";
import { toUserProfile } from "../../auth/_lib/profile";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let ctx;
  try {
    ctx = await authenticate(req);
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }

  const [user, educations, workExperiences, certifications, resumeProfile] = await Promise.all([
    prisma.user.findUnique({ where: { id: ctx.userId } }),
    prisma.education.findMany({ where: { userId: ctx.userId }, orderBy: { sortOrder: "asc" } }),
    prisma.workExperience.findMany({ where: { userId: ctx.userId }, orderBy: { sortOrder: "asc" } }),
    prisma.certification.findMany({ where: { userId: ctx.userId }, orderBy: { sortOrder: "asc" } }),
    prisma.resumeProfile.findUnique({ where: { userId: ctx.userId } }),
  ]);
  if (!user) return notFound("ユーザーが見つかりません");

  return NextResponse.json({
    basic: toUserProfile(user),
    educations: educations.map((e) => ({
      id: e.id,
      schoolType: e.schoolType,
      schoolName: e.schoolName,
      faculty: e.faculty,
      status: e.status,
      year: e.year,
      month: e.month,
    })),
    workExperiences: workExperiences.map((w) => ({
      id: w.id,
      companyName: w.companyName,
      department: w.department,
      jobType: w.jobType,
      startYear: w.startYear,
      startMonth: w.startMonth,
      endYear: w.endYear,
      endMonth: w.endMonth,
      isCurrent: w.isCurrent,
      description: w.description,
    })),
    certifications: certifications.map((c) => ({
      id: c.id,
      name: c.name,
      year: c.year,
      month: c.month,
    })),
    prText: resumeProfile?.prText ?? null,
    jobPreference: resumeProfile?.jobPreference ?? null,
  });
}
