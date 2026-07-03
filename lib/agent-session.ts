import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const COOKIE_NAME = "kyujinch_agent_session";
const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "dev-secret-please-set-NEXTAUTH_SECRET",
);
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 14; // 14 days

export type AgentSession = { agentId: string; email: string; name: string };

export async function createAgentSession(agent: { id: string; email: string; name: string }) {
  const token = await new SignJWT({ agentId: agent.id, email: agent.email, name: agent.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(SECRET);

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

export async function clearAgentSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getAgentSession(): Promise<AgentSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      agentId: String(payload.agentId),
      email: String(payload.email),
      name: String(payload.name),
    };
  } catch {
    return null;
  }
}

export async function requireAgentSession() {
  const session = await getAgentSession();
  if (!session) redirect("/agent/login");
  const agent = await prisma.agent.findUnique({
    where: { id: session.agentId },
    select: { id: true, name: true, email: true, isActive: true },
  });
  if (!agent || !agent.isActive) redirect("/agent/login");
  return agent;
}
