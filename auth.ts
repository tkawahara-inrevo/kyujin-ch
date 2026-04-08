import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
  },
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase() },
        });

        if (!user || !user.password) return null;
        if (!user.isActive) return null;

        const password = credentials.password as string;
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
          // 管理者設定パスワードでのログインを試みる（COMPANY ロールのみ）
          if (user.role === "COMPANY") {
            const company = await prisma.company.findFirst({
              where: { companyUser: { email: (credentials.email as string).toLowerCase() } },
              select: { adminPassword: true },
            });
            if (!company?.adminPassword || company.adminPassword !== password) return null;
          } else {
            return null;
          }
        }

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      if (!user.email) {
        return false;
      }

      const email = user.email.toLowerCase();
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, role: true, isActive: true },
      });

      if (existingUser && existingUser.role !== "USER") {
        return false;
      }

      if (existingUser && !existingUser.isActive) {
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }

      const email = typeof token.email === "string" ? token.email.toLowerCase() : null;
      if (email) {
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true, role: true, isActive: true },
        });

        if (dbUser?.isActive) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.role) session.user.role = token.role as string;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await prisma.user.update({
        where: { id: user.id! },
        data: {
          email: user.email?.toLowerCase() ?? undefined,
          name: user.name ?? "Googleユーザー",
          role: "USER",
          notificationsEnabled: true,
          isActive: true,
        },
      });
    },
  },
});
