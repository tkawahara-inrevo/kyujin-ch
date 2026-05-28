"use server";

import { prisma } from "@/lib/prisma";
import { getAdminInquiryEmail, sendTransactionalEmail } from "@/lib/email";
import { postToSlack } from "@/lib/slack";
import { revalidatePath } from "next/cache";

const REASON_LABELS = {
  posting: "掲載希望",
  talk: "話を聞きたい",
  other: "そのほか",
} as const;

type ReasonKey = keyof typeof REASON_LABELS;

export async function submitFocusInquiry(data: {
  companyName: string;
  name: string;
  phone: string;
  reason: ReasonKey;
  other: string;
}) {
  const companyName = data.companyName.trim();
  const name = data.name.trim();
  const phone = data.phone.trim();
  const reason = data.reason;
  const other = data.other.trim();

  if (!companyName) throw new Error("会社名を入力してください");
  if (!name) throw new Error("お名前を入力してください");
  if (!phone) throw new Error("電話番号を入力してください");
  if (!REASON_LABELS[reason]) throw new Error("お問い合わせ理由を選択してください");

  const reasonLabel = REASON_LABELS[reason];

  // 9ch問い合わせ（Inquiry）として保存。本文に詳細をまとめる
  const body = [
    "【Focus 掲載に関するお問い合わせ】",
    `会社名: ${companyName}`,
    `お名前: ${name}`,
    `電話番号: ${phone}`,
    `お問い合わせ理由: ${reasonLabel}`,
    other ? `\nその他:\n${other}` : "",
  ].filter(Boolean).join("\n");

  const inquiry = await prisma.inquiry.create({
    data: {
      category: "QUESTION",
      name,
      companyName,
      phone,
      email: null,
      body,
      source: "focus",
    },
  });

  let mailWarning = "";
  try {
    await sendTransactionalEmail({
      to: getAdminInquiryEmail(),
      subject: `【Focus】掲載に関するお問い合わせ（${reasonLabel}）`,
      text: [
        "Focusで新しいお問い合わせを受信しました。",
        `会社名: ${companyName}`,
        `お名前: ${name}`,
        `電話番号: ${phone}`,
        `お問い合わせ理由: ${reasonLabel}`,
        other ? `\nその他:\n${other}` : "",
        "",
        `管理画面: ${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://kyujin-ch.jp"}/admin/inquiries`,
      ].filter(Boolean).join("\n"),
      html: `
        <p>Focusで新しいお問い合わせを受信しました。</p>
        <ul>
          <li>会社名: ${escapeHtml(companyName)}</li>
          <li>お名前: ${escapeHtml(name)}</li>
          <li>電話番号: ${escapeHtml(phone)}</li>
          <li>お問い合わせ理由: ${escapeHtml(reasonLabel)}</li>
        </ul>
        ${other ? `<p>その他:</p><pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(other)}</pre>` : ""}
        <p><a href="${escapeHtml(`${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://kyujin-ch.jp"}/admin/inquiries`)}">管理画面で確認する</a></p>
      `,
    });
  } catch (error) {
    console.error("Failed to send Focus inquiry email", error);
    mailWarning = "お問い合わせは保存しましたが、通知メールの送信に失敗しました。";
  }

  // Slack通知 (C0AQ4S7KLNA)
  const adminUrl = `${process.env.AUTH_URL || process.env.NEXTAUTH_URL || "https://kyujin-ch.jp"}/admin/inquiries`;
  await postToSlack(
    [
      "📩 *Focus 掲載に関するお問い合わせ*",
      `• 会社名: ${companyName}`,
      `• お名前: ${name}`,
      `• 電話番号: ${phone}`,
      `• 理由: ${reasonLabel}`,
      other ? `• その他: ${other}` : "",
      `<${adminUrl}|管理画面で確認>`,
    ].filter(Boolean).join("\n"),
  );

  revalidatePath("/admin/inquiries");
  return { inquiryId: inquiry.id, mailWarning };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
