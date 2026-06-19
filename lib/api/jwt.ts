/**
 * モバイルアプリ用 JWT 発行・検証ユーティリティ。
 * Web 側の NextAuth とは独立した別仕組みです。
 */
import crypto from "crypto";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const ACCESS_TTL = process.env.JWT_ACCESS_TTL || "15m"; // 15分
const REFRESH_TTL_DAYS = Number(process.env.JWT_REFRESH_TTL_DAYS || "30"); // 30日

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("JWT_SECRET, AUTH_SECRET, or NEXTAUTH_SECRET must be set");
  return new TextEncoder().encode(secret);
}

export type AccessTokenPayload = JWTPayload & {
  sub: string;
  role: string;
};

/** アクセストークン (短命) を発行 */
export async function signAccessToken(userId: string, role: string): Promise<string> {
  return new SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("kyujin-ch")
    .setAudience("mobile")
    .setExpirationTime(ACCESS_TTL)
    .sign(getSecret());
}

/** アクセストークン検証 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret(), {
    issuer: "kyujin-ch",
    audience: "mobile",
  });
  return payload as AccessTokenPayload;
}

/** リフレッシュトークン: ランダムbase64url。DBにはhash保存 */
export function generateRefreshToken(): { token: string; hash: string; expiresAt: Date } {
  const token = crypto.randomBytes(48).toString("base64url");
  const hash = hashRefreshToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
  return { token, hash, expiresAt };
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
