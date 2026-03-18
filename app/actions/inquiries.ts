"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getAdminInquiryEmail, sendTransactionalEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

const CATEGORY_LABELS = {
  QUESTION: "質問",
  BUG_REPORT: "不具合報告",
} as const;

export async function submitInquiry(data: {
  category: "QUESTION" | "BUG_REPORT";
  name: string;
  phone?: string;
  email: string;
  body: string;
}) {
  const session = await auth();

  const name = data.name.trim();
  const phone = data.phone?.trim() || null;
  const email = data.email.trim().toLowerCase();
  const body = data.body.trim();
  const category = data.category;

  if (!name) throw new Error("お名前を入力してください");
  if (!email) throw new Error("メールアドレスを入力してください");
  if (!body) throw new Error("お問い合わせ内容を入力してください");
  if (!["QUESTION", "BUG_REPORT"].includes(category)) throw new Error("カテゴリが不正です");

  const inquiry = await prisma.inquiry.create({
    data: {
      userId: session?.user?.role === "USER" ? session.user.id : null,
      category,
      name,
      phone,
      email,
      body,
    },
  });

  let mailWarning = "";
  try {
    const categoryLabel = CATEGORY_LABELS[category];
    const adminSubject = `【求人ちゃんねる】お問い合わせを受信しました（${categoryLabel}）`;
    const userSubject = "【求人ちゃんねる】お問い合わせを受け付けました";

    await Promise.all([
      sendTransactionalEmail({
        to: getAdminInquiryEmail(),
        subject: adminSubject,
        text: [
          "求人ちゃんねるで新しいお問い合わせを受信しました。",
          `カテゴリ: ${categoryLabel}`,
          `お名前: ${name}`,
          `電話番号: ${phone || "未入力"}`,
          `メールアドレス: ${email}`,
          "",
          "お問い合わせ内容:",
          body,
          "",
          `管理画面: ${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://kyujin-ch.com"}/admin/inquiries`,
        ].join("\n"),
        html: `
          <p>求人ちゃんねるで新しいお問い合わせを受信しました。</p>
          <ul>
            <li>カテゴリ: ${categoryLabel}</li>
            <li>お名前: ${escapeHtml(name)}</li>
            <li>電話番号: ${escapeHtml(phone || "未入力")}</li>
            <li>メールアドレス: ${escapeHtml(email)}</li>
          </ul>
          <p>お問い合わせ内容:</p>
          <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(body)}</pre>
          <p><a href="${escapeHtml(
            `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://kyujin-ch.com"}/admin/inquiries`
          )}">管理画面で確認する</a></p>
        `,
      }),
      sendTransactionalEmail({
        to: email,
        subject: userSubject,
        text: [
          `${name} 様`,
          "",
          "お問い合わせありがとうございます。",
          "以下の内容で受け付けました。内容を確認のうえ、必要に応じてご連絡いたします。",
          "",
          `カテゴリ: ${categoryLabel}`,
          `電話番号: ${phone || "未入力"}`,
          `メールアドレス: ${email}`,
          "",
          "お問い合わせ内容:",
          body,
        ].join("\n"),
        html: `
          <p>${escapeHtml(name)} 様</p>
          <p>お問い合わせありがとうございます。以下の内容で受け付けました。内容を確認のうえ、必要に応じてご連絡いたします。</p>
          <ul>
            <li>カテゴリ: ${categoryLabel}</li>
            <li>電話番号: ${escapeHtml(phone || "未入力")}</li>
            <li>メールアドレス: ${escapeHtml(email)}</li>
          </ul>
          <p>お問い合わせ内容:</p>
          <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(body)}</pre>
        `,
      }),
    ]);
  } catch (error) {
    console.error("Failed to send inquiry emails", error);
    mailWarning = "お問い合わせは保存したけど、メール送信はまだ設定不足かも!";
  }

  revalidatePath("/admin/inquiries");

  return {
    inquiryId: inquiry.id,
    mailWarning,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
