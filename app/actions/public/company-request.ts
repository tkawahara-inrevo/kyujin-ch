"use server";

import { prisma } from "@/lib/prisma";
import { buildContactFullName } from "@/lib/company-account";
import { sendTransactionalEmail } from "@/lib/email";
import { postToSlack } from "@/lib/slack";
import {
  validateCorporateNumberCheckDigit,
  lookupCorporateNumber,
  companyNamesMatch,
} from "@/lib/corporate-number";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Prisma } from "@prisma/client";

function generateTemporaryPassword() {
  return crypto.randomBytes(6).toString("base64url");
}

function generateUsername(companyName: string, corporateNumber: string): string {
  // 法人番号下6桁をベースにしたユーザー名
  const suffix = corporateNumber.slice(-6);
  const base = companyName
    .normalize("NFKC")
    .replace(/[^\w]/g, "")
    .toLowerCase()
    .slice(0, 10);
  return `${base || "company"}${suffix}`;
}

export type CompanyRequestResult =
  | { status: "issued"; companyId: string; temporaryPassword: string }
  | { status: "contact_later" }
  | { status: "error"; message: string };

export async function submitCompanyRequest(formData: {
  corporateNumber: string;
  companyName: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  address?: string;
}): Promise<CompanyRequestResult> {
  const corporateNumber = formData.corporateNumber.replace(/[^\d]/g, "");
  const companyName = formData.companyName.trim();
  const lastName = formData.lastName.trim();
  const firstName = formData.firstName.trim();
  const email = formData.email.trim().toLowerCase();
  const phone = formData.phone.trim();
  const address = formData.address?.trim() || "";

  // --- バリデーション ---
  if (!/^\d{13}$/.test(corporateNumber)) {
    return { status: "error", message: "法人番号は13桁の数字で入力してください" };
  }
  if (!validateCorporateNumberCheckDigit(corporateNumber)) {
    return { status: "error", message: "法人番号のチェックデジットが正しくありません" };
  }
  if (!companyName) return { status: "error", message: "会社名を入力してください" };
  if (!lastName) return { status: "error", message: "姓を入力してください" };
  if (!firstName) return { status: "error", message: "名を入力してください" };
  if (!email) return { status: "error", message: "メールアドレスを入力してください" };
  if (!phone) return { status: "error", message: "電話番号を入力してください" };

  // --- 既存チェック ---
  const [existingByEmail, existingByCorporateNumber] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.company.findUnique({ where: { corporateNumber }, select: { id: true } }),
  ]);

  if (existingByEmail) {
    return { status: "error", message: "そのメールアドレスは既に登録されています" };
  }
  if (existingByCorporateNumber) {
    return { status: "error", message: "その法人番号の企業は既に登録されています" };
  }

  // --- gBizINFO API照会 ---
  let gbizName: string | null = null;
  let nameMatched = false;
  try {
    const gbizInfo = await lookupCorporateNumber(corporateNumber);
    if (gbizInfo) {
      gbizName = gbizInfo.name;
      nameMatched = companyNamesMatch(gbizInfo.name, companyName);
    }
  } catch (err) {
    console.error("gBizINFO lookup error:", err);
  }

  const companyInfo =
    `会社名: ${companyName}\n` +
    `法人番号: ${corporateNumber}\n` +
    `本社所在地: ${address}\n` +
    `担当者: ${lastName} ${firstName}\n` +
    `メールアドレス: ${email}\n` +
    `電話番号: ${phone}`;

  if (!gbizName || !nameMatched) {
    // 会社名が確認できなかった or 不一致 → NCメール送付 → Slack通知
    await sendTransactionalEmail({
      to: email,
      subject: "【求人ちゃんねる】掲載依頼を受け付けました",
      html: `
<p>${lastName} ${firstName} 様</p>
<p>この度は求人ちゃんねるへの掲載依頼をいただきありがとうございます。</p>
<p>お申し込みいただいた内容を確認しております。<br>
内容確認後、担当者より改めてご連絡いたします。</p>
<br>
<p>【ご申請内容】</p>
<p>会社名: ${companyName}<br>
法人番号: ${corporateNumber}<br>
担当者: ${lastName} ${firstName}<br>
電話番号: ${phone}</p>
<br>
<p>今しばらくお待ちください。</p>
<br>
<p>求人ちゃんねる 運営事務局</p>
      `.trim(),
      text: `${lastName} ${firstName} 様\n\nこの度は求人ちゃんねるへの掲載依頼をいただきありがとうございます。\n\nお申し込みいただいた内容を確認しております。内容確認後、担当者より改めてご連絡いたします。\n\n【ご申請内容】\n${companyInfo}\n\n今しばらくお待ちください。\n\n求人ちゃんねる 運営事務局`,
    });

    await postToSlack(
      `以下の企業から掲載依頼がありましたが、法人番号から企業名を確認できなかったのでNGで返しました。\n` +
      `---\n${companyInfo}\n---`
    );

    return { status: "contact_later" };
  }

  // --- 自動アカウント発行 ---
  const temporaryPassword = generateTemporaryPassword();
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
  const fullName = buildContactFullName(lastName, firstName);
  const baseUsername = generateUsername(companyName, corporateNumber);

  // ユーザー名の重複回避
  let username = baseUsername;
  let suffix = 0;
  while (await prisma.user.findUnique({ where: { username }, select: { id: true } })) {
    suffix++;
    username = `${baseUsername}${suffix}`;
  }

  let companyId: string;
  try {
    const company = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          name: fullName,
          email,
          username,
          password: hashedPassword,
          role: "COMPANY",
          firstName,
          lastName,
          phone,
        },
      });
      return tx.company.create({
        data: {
          name: companyName,
          corporateNumber,
          companyUserId: user.id,
        },
      });
    });
    companyId = company.id;
  } catch (err) {
    console.error("Account creation failed:", err);
    return { status: "error", message: "アカウント作成に失敗しました。しばらく後でお試しください。" };
  }

  const loginUrl = `${process.env.NEXTAUTH_URL ?? "https://kyujin-ch.jp"}/company/login`;

  // メール送付 → Slack通知
  let emailError: string | null = null;
  try {
    await sendTransactionalEmail({
      to: email,
      subject: "【求人ちゃんねる】アカウントが発行されました",
      html: `
<p>${lastName} ${firstName} 様</p>
<p>この度は求人ちゃんねるへの掲載依頼をいただきありがとうございます。</p>
<p>法人情報が確認できましたので、企業アカウントを発行いたしました。<br>
以下の情報でログインしてください。</p>
<br>
<p>【ログイン情報】</p>
<p>ログインURL: <a href="${loginUrl}">${loginUrl}</a><br>
仮パスワード: ${temporaryPassword}</p>
<br>
<p>初回ログイン後、パスワードを変更してください。</p>
<br>
<p>求人ちゃんねる 運営事務局</p>
      `.trim(),
      text: `${lastName} ${firstName} 様\n\nこの度は求人ちゃんねるへの掲載依頼をいただきありがとうございます。\n\n法人情報が確認できましたので、企業アカウントを発行いたしました。以下の情報でログインしてください。\n\n【ログイン情報】\nログインURL: ${loginUrl}\n仮パスワード: ${temporaryPassword}\n\n初回ログイン後、パスワードを変更してください。\n\n求人ちゃんねる 運営事務局`,
    });
  } catch (err) {
    emailError = err instanceof Error ? err.message : String(err);
    console.error("[company-request] メール送信失敗:", emailError, "宛先:", email);
  }

  await postToSlack(
    `以下の企業のアカウントを自動発行しました\n` +
    `---\n${companyInfo}\n---` +
    (emailError ? `\n⚠️ メール送信失敗: ${emailError}` : "")
  );

  return { status: "issued", companyId, temporaryPassword };
}
