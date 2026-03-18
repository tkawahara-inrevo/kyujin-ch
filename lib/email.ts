import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

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

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}) {
  const client = getSesClient();
  if (!client) {
    throw new Error("SES credentials are not configured");
  }

  const toAddresses = Array.isArray(to) ? to : [to];

  await client.send(
    new SendEmailCommand({
      FromEmailAddress: defaultFromEmail,
      Destination: {
        ToAddresses: toAddresses,
      },
      Content: {
        Simple: {
          Subject: {
            Data: subject,
            Charset: "UTF-8",
          },
          Body: {
            Html: {
              Data: html,
              Charset: "UTF-8",
            },
            Text: {
              Data: text,
              Charset: "UTF-8",
            },
          },
        },
      },
    })
  );
}
