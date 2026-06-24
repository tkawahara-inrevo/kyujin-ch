/**
 * POST /api/v1/auth/forgot-password
 * Body: { email }
 * メアドが登録されていればリセットメールを送信。
 * セキュリティ上、メアドの存在に関係なく 200 を返す (アカウント列挙対策)。
 */
import { NextRequest, NextResponse } from "next/server";
import { badRequest } from "@/lib/api/errors";
import { issuePasswordResetToken, buildResetUrl } from "@/lib/password-reset";
import { sendTransactionalEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return badRequest("不正なJSONです");
  }
  const email = body.email?.trim()?.toLowerCase();
  if (!email) return badRequest("email は必須です");

  const token = await issuePasswordResetToken(email);
  if (token) {
    const url = buildResetUrl(token);
    try {
      await sendTransactionalEmail({
        to: email,
        subject: "【求人ちゃんねる】パスワード再設定のご案内",
        html: `<p>パスワード再設定のリクエストを受け付けました。</p>
<p>下記のリンクから1時間以内に新しいパスワードを設定してください。</p>
<p><a href="${url}">${url}</a></p>
<p>このメールに心当たりがない場合は無視してください。</p>
<p>求人ちゃんねる</p>`,
        text: `パスワード再設定のリクエストを受け付けました。

下記のリンクから1時間以内に新しいパスワードを設定してください。
${url}

このメールに心当たりがない場合は無視してください。

求人ちゃんねる`,
      });
    } catch (e) {
      console.error("パスワードリセットメール送信失敗:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
