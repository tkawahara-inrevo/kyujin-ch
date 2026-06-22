/**
 * GET   /api/v1/me/resume - 履歴書データ取得（基本情報・学歴・職歴・資格・自己PR・希望条件）
 * PATCH /api/v1/me/resume - 履歴書データ更新（全置換）
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { unauthorized, notFound, badRequest } from "@/lib/api/errors";
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

type ResumePatchBody = {
  educations?: Array<{
    schoolType?: string;
    schoolName?: string;
    faculty?: string | null;
    status?: string;
    year?: number;
    month?: number;
  }>;
  workExperiences?: Array<{
    companyName?: string;
    department?: string | null;
    jobType?: string | null;
    startYear?: number;
    startMonth?: number;
    endYear?: number | null;
    endMonth?: number | null;
    isCurrent?: boolean;
    description?: string | null;
  }>;
  certifications?: Array<{
    name?: string;
    year?: number;
    month?: number;
  }>;
  prText?: string | null;
  jobPreference?: string | null;
};

export async function PATCH(req: NextRequest) {
  let ctx;
  try {
    ctx = await authenticate(req);
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }

  let body: ResumePatchBody;
  try {
    body = (await req.json()) as ResumePatchBody;
  } catch {
    return badRequest("不正なJSONです");
  }

  const userId = ctx.userId;

  await prisma.$transaction(async (tx) => {
    if (body.educations !== undefined) {
      await tx.education.deleteMany({ where: { userId } });
      for (let i = 0; i < body.educations.length; i++) {
        const e = body.educations[i];
        if (!e.schoolType || !e.schoolName || !e.status || e.year == null || e.month == null) continue;
        await tx.education.create({
          data: {
            userId,
            schoolType: e.schoolType,
            schoolName: e.schoolName,
            faculty: e.faculty || null,
            status: e.status,
            year: e.year,
            month: e.month,
            sortOrder: i,
          },
        });
      }
    }

    if (body.workExperiences !== undefined) {
      await tx.workExperience.deleteMany({ where: { userId } });
      for (let i = 0; i < body.workExperiences.length; i++) {
        const w = body.workExperiences[i];
        if (!w.companyName || w.startYear == null || w.startMonth == null) continue;
        await tx.workExperience.create({
          data: {
            userId,
            companyName: w.companyName,
            department: w.department || null,
            jobType: w.jobType || null,
            startYear: w.startYear,
            startMonth: w.startMonth,
            endYear: w.endYear ?? null,
            endMonth: w.endMonth ?? null,
            isCurrent: w.isCurrent ?? false,
            description: w.description || null,
            sortOrder: i,
          },
        });
      }
    }

    if (body.certifications !== undefined) {
      await tx.certification.deleteMany({ where: { userId } });
      for (let i = 0; i < body.certifications.length; i++) {
        const c = body.certifications[i];
        if (!c.name || c.year == null || c.month == null) continue;
        await tx.certification.create({
          data: { userId, name: c.name, year: c.year, month: c.month, sortOrder: i },
        });
      }
    }

    if (body.prText !== undefined || body.jobPreference !== undefined) {
      await tx.resumeProfile.upsert({
        where: { userId },
        update: {
          ...(body.prText !== undefined ? { prText: body.prText } : {}),
          ...(body.jobPreference !== undefined ? { jobPreference: body.jobPreference } : {}),
        },
        create: {
          userId,
          prText: body.prText ?? null,
          jobPreference: body.jobPreference ?? null,
        },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
