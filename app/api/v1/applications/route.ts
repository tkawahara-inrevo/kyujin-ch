/**
 * GET /api/v1/applications  - 自分の応募一覧（認証必須）
 * POST /api/v1/applications - 求人へ応募（認証必須）
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, ApiAuthError } from "@/lib/api/auth";
import { badRequest, conflict, notFound, unauthorized } from "@/lib/api/errors";
import { sendTransactionalEmail } from "@/lib/email";
import { resolveChargeAmount, currentBillingMonth } from "@/lib/charge";
import { toApplication } from "./_lib/format";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let ctx;
  try {
    ctx = await authenticate(req);
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }

  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const apps = await prisma.application.findMany({
    where: { userId: ctx.userId, ...(status ? { status: status as never } : {}) },
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        include: {
          company: { select: { id: true, name: true, description: true, websiteUrl: true } },
        },
      },
    },
  });

  return NextResponse.json(apps.map(toApplication));
}

export async function POST(req: NextRequest) {
  let ctx;
  try {
    ctx = await authenticate(req);
  } catch (e) {
    if (e instanceof ApiAuthError) return unauthorized(e.message);
    throw e;
  }

  let body: { jobId?: string; motivation?: string };
  try {
    body = await req.json();
  } catch {
    return badRequest("不正なJSONです");
  }

  const jobId = body.jobId?.trim();
  if (!jobId) return badRequest("jobId は必須です");

  const job = await prisma.job.findFirst({
    where: { id: jobId, isPublished: true, reviewStatus: "PUBLISHED", isDeleted: false },
    select: {
      id: true,
      title: true,
      categoryTag: true,
      targetType: true,
      company: {
        select: {
          createdAt: true,
          companyUser: { select: { email: true } },
        },
      },
    },
  });
  if (!job) return notFound("求人が見つかりません");

  const existing = await prisma.application.findFirst({
    where: { userId: ctx.userId, jobId },
    select: { id: true },
  });
  if (existing) return conflict("既に応募済みです");

  const now = new Date();
  const chargeAmount = await resolveChargeAmount(job.categoryTag, job.company.createdAt, now, job.targetType);

  const app = await prisma.$transaction(async (tx) => {
    const created = await tx.application.create({
      data: {
        userId: ctx.userId,
        jobId,
        motivation: body.motivation?.trim() || null,
      },
      include: {
        job: {
          include: {
            company: { select: { id: true, name: true, description: true, websiteUrl: true } },
          },
        },
      },
    });
    await tx.conversation.create({ data: { applicationId: created.id } });
    await tx.charge.create({
      data: {
        applicationId: created.id,
        amount: chargeAmount,
        billingMonth: currentBillingMonth(now),
      },
    });
    return created;
  });

  // 通知メール（失敗してもフローは止めない）
  try {
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { name: true, email: true, notificationsEnabled: true },
    });
    const siteUrl = process.env.NEXTAUTH_URL ?? "https://kyujin-ch.jp";
    if (user?.notificationsEnabled && user.email) {
      await sendTransactionalEmail({
        to: user.email,
        subject: `【求人ちゃんねる】「${job.title}」に応募しました`,
        html: `<p>${user.name} 様</p><p>「${job.title}」への応募が完了しました。<br>企業からの返信をお待ちください。</p><p><a href="${siteUrl}/applications">応募一覧を確認する</a></p><p>求人ちゃんねる</p>`,
        text: `${user.name} 様\n\n「${job.title}」への応募が完了しました。\n企業からの返信をお待ちください。\n\n応募一覧: ${siteUrl}/applications\n\n求人ちゃんねる`,
      });
    }
    const companyEmail = job.company.companyUser?.email;
    if (companyEmail) {
      await sendTransactionalEmail({
        to: companyEmail,
        subject: `【求人ちゃんねる】「${job.title}」に新しい応募がありました`,
        html: `<p>「${job.title}」に新しい応募がありました。<br>応募者の情報を確認してください。</p><p><a href="${siteUrl}/company/applicants">応募管理を確認する</a></p><p>求人ちゃんねる</p>`,
        text: `「${job.title}」に新しい応募がありました。\n応募者の情報を確認してください。\n\n応募管理: ${siteUrl}/company/applicants\n\n求人ちゃんねる`,
      });
    }
  } catch (e) {
    console.error("応募通知メール送信エラー:", e);
  }

  return NextResponse.json(toApplication(app), { status: 201 });
}
