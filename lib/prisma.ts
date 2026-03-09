import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: {
    rejectUnauthorized: false,
  },
});

const prismaClient = new PrismaClient({
  adapter,
});

export const prisma = global.prismaGlobal ?? prismaClient;

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}