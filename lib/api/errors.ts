/**
 * モバイルAPI用 標準エラーレスポンス。
 * Web 側の Server Actions の throw とは独立した、JSON Response 専用。
 */
import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL";

export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json({ message, code, details }, { status });
}

export const badRequest = (message: string, details?: Record<string, unknown>) =>
  apiError(400, "VALIDATION_ERROR", message, details);

export const unauthorized = (message = "認証が必要です") =>
  apiError(401, "UNAUTHORIZED", message);

export const forbidden = (message = "アクセス権がありません") =>
  apiError(403, "FORBIDDEN", message);

export const notFound = (message = "見つかりません") =>
  apiError(404, "NOT_FOUND", message);

export const conflict = (message: string) =>
  apiError(409, "CONFLICT", message);
