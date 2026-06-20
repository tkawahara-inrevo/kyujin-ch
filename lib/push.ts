/**
 * Firebase Cloud Messaging を使った Push 送信。
 * v1 HTTP API + service account JSON で署名。
 *
 * 必要な環境変数:
 *   FIREBASE_SERVICE_ACCOUNT_JSON  - service account JSON文字列 (改行含めて1行)
 *   または
 *   FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 *
 * 設定されていなければ no-op で警告だけ出す。
 */
import { prisma } from "@/lib/prisma";

type PushPayload = {
  title: string;
  body: string;
  /** "message" | "general" など、クライアント側で扱うタイプ */
  type?: string;
  /** 任意の追加データ (deep link 等) */
  data?: Record<string, string>;
};

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getServiceAccount(): Promise<{
  projectId: string;
  clientEmail: string;
  privateKey: string;
} | null> {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      const parsed = JSON.parse(json);
      return {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key,
      };
    } catch {
      console.warn("[push] FIREBASE_SERVICE_ACCOUNT_JSON が不正な JSON です");
      return null;
    }
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }
  return null;
}

async function getAccessToken(): Promise<{ token: string; projectId: string } | null> {
  const sa = await getServiceAccount();
  if (!sa) return null;
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 30_000) {
    return { token: cachedAccessToken.token, projectId: sa.projectId };
  }

  const { SignJWT, importPKCS8 } = await import("jose");
  const now = Math.floor(Date.now() / 1000);
  const key = await importPKCS8(sa.privateKey, "RS256");
  const jwt = await new SignJWT({
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(sa.clientEmail)
    .setSubject(sa.clientEmail)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    console.warn("[push] Google OAuth トークン取得失敗:", res.status);
    return null;
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedAccessToken = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return { token: json.access_token, projectId: sa.projectId };
}

/** 指定ユーザーの全 PushDevice に push を送信 (失敗しても例外を出さない) */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  try {
    const devices = await prisma.pushDevice.findMany({
      where: { userId },
      select: { token: true, platform: true },
    });
    if (devices.length === 0) return;

    const auth = await getAccessToken();
    if (!auth) {
      console.warn("[push] Firebase 認証情報がないため push 送信をスキップ");
      return;
    }

    const url = `https://fcm.googleapis.com/v1/projects/${auth.projectId}/messages:send`;
    await Promise.all(
      devices.map(async (device) => {
        const message = {
          message: {
            token: device.token,
            data: {
              title: payload.title,
              body: payload.body,
              type: payload.type ?? "general",
              ...(payload.data ?? {}),
            },
            // notification も付ければ、アプリが background のとき OS がデフォルトで表示してくれる
            notification: {
              title: payload.title,
              body: payload.body,
            },
            android: {
              priority: "HIGH" as const,
            },
          },
        };
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        });
        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          console.warn(`[push] 送信失敗 token=${device.token.slice(0, 8)}... status=${res.status}`, errText);
          // UNREGISTERED / INVALID_ARGUMENT の場合は不要なトークンなので削除
          if (res.status === 404 || res.status === 400) {
            await prisma.pushDevice.deleteMany({ where: { token: device.token } });
          }
        }
      }),
    );
  } catch (e) {
    console.error("[push] sendPushToUser エラー:", e);
  }
}
