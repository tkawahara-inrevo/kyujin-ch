/**
 * モバイルAPI用 認証ミドルウェアヘルパ。
 * Bearer トークンを検証して userId と role を返す。Web 側 (NextAuth) には影響なし。
 */
import type { NextRequest } from "next/server";
import { verifyAccessToken, type AccessTokenPayload } from "./jwt";

export type AuthContext = {
  userId: string;
  role: string;
};

export class ApiAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiAuthError";
  }
}

/** Authorization: Bearer xxx を取り出して検証 */
export async function authenticate(req: NextRequest): Promise<AuthContext> {
  const header = req.headers.get("authorization");
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    throw new ApiAuthError("Bearer トークンが必要です");
  }
  const token = header.slice(7).trim();
  if (!token) throw new ApiAuthError("Bearer トークンが空です");

  let payload: AccessTokenPayload;
  try {
    payload = await verifyAccessToken(token);
  } catch {
    throw new ApiAuthError("トークンが無効または期限切れです");
  }

  return { userId: payload.sub, role: payload.role };
}

/** ロール要求型 ヘルパ。USER しか入らない MVP では使わないが将来用 */
export function requireRole(ctx: AuthContext, ...allowedRoles: string[]): void {
  if (!allowedRoles.includes(ctx.role)) {
    throw new ApiAuthError(`このAPIは ${allowedRoles.join("/")} のみアクセス可能です`);
  }
}

/** 任意認証: トークンがあれば検証して返す、なければ null */
export async function authenticateOptional(req: NextRequest): Promise<AuthContext | null> {
  const header = req.headers.get("authorization");
  if (!header) return null;
  try {
    return await authenticate(req);
  } catch {
    return null;
  }
}
