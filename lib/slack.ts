async function post(webhookUrl: string, text: string): Promise<void> {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {
    // 通知失敗はサイレントに無視
  }
}

/** 掲載依頼通知 (C0AQ4S7KLNA) */
export async function postToSlack(text: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;
  await post(webhookUrl, text);
}

/** 審査申請通知 (C0AQ6TYJYFL) */
export async function postJobReviewSlack(text: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL_JOB_REVIEW;
  if (!webhookUrl) return;
  await post(webhookUrl, text);
}
