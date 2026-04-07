import { SignJWT, jwtVerify } from "jose";

const secret = process.env.MOBILE_JWT_SECRET;
if (!secret && process.env.NODE_ENV === "production") {
  throw new Error("MOBILE_JWT_SECRET is not set");
}

const ACCESS_SECRET = new TextEncoder().encode(
  secret ?? "mobile-jwt-dev-secret"
);
const REFRESH_SECRET = new TextEncoder().encode(
  (secret ?? "mobile-jwt-dev-secret") + "-refresh"
);

export interface MobileJwtPayload {
  sub: string;
  email: string;
  role: string;
}

export async function signAccessToken(payload: MobileJwtPayload): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: MobileJwtPayload): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<MobileJwtPayload> {
  const { payload } = await jwtVerify(token, ACCESS_SECRET);
  return {
    sub: payload.sub as string,
    email: payload.email as string,
    role: payload.role as string,
  };
}

export async function verifyRefreshToken(token: string): Promise<MobileJwtPayload> {
  const { payload } = await jwtVerify(token, REFRESH_SECRET);
  return {
    sub: payload.sub as string,
    email: payload.email as string,
    role: payload.role as string,
  };
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
