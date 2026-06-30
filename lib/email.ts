import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { prisma } from "@/lib/prisma";

const defaultRegion = process.env.AWS_REGION || "ap-northeast-1";
const defaultFromEmail = process.env.SES_FROM_EMAIL || "kyujin-ch@inrevo.jp";
const defaultAdminInquiryEmail =
  process.env.CONTACT_NOTIFICATION_EMAIL || "kyujin-ch@inrevo.jp";

function getSesClient() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return null;
  }

  return new SESv2Client({
    region: defaultRegion,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

export function getAdminInquiryEmail() {
  return defaultAdminInquiryEmail;
}

/**
 * トランザクションメール送信。
 * - 常に From 自身 (kyujin-ch@inrevo.jp) に BCC を送り、送信箱代わりにする
 * - 成功/失敗にかかわらず EmailLog テーブルに記録する
 *
 * senderTag に "company-request" 等を渡しておくと、管理画面でフィルタしやすい
 */
export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  senderTag,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  senderTag?: string;
}) {
  const client = getSesClient();
  if (!client) {
    throw new Error("SES credentials are not configured");
  }

  const toAddresses = Array.isArray(to) ? to : [to];
  const bccAddresses = [defaultFromEmail];
  const bodyPreview = text.slice(0, 500);

  try {
    const result = await client.send(
      new SendEmailCommand({
        FromEmailAddress: defaultFromEmail,
        Destination: {
          ToAddresses: toAddresses,
          BccAddresses: bccAddresses,
        },
        Content: {
          Simple: {
            Subject: { Data: subject, Charset: "UTF-8" },
            Body: {
              Html: { Data: html, Charset: "UTF-8" },
              Text: { Data: text, Charset: "UTF-8" },
            },
          },
        },
      })
    );

    await prisma.emailLog
      .create({
        data: {
          toAddresses: toAddresses.join(","),
          subject,
          bodyPreview,
          senderTag: senderTag ?? null,
          messageId: result.MessageId ?? null,
          status: "SENT",
        },
      })
      .catch((e) => {
        console.error("[email] EmailLog 書き込み失敗 (送信は成功):", e);
      });
  } catch (err) {
    const errorText = err instanceof Error ? err.message : String(err);
    await prisma.emailLog
      .create({
        data: {
          toAddresses: toAddresses.join(","),
          subject,
          bodyPreview,
          senderTag: senderTag ?? null,
          status: "FAILED",
          errorText,
        },
      })
      .catch((e) => {
        console.error("[email] EmailLog 書き込み失敗 (送信も失敗):", e);
      });
    throw err;
  }
}
