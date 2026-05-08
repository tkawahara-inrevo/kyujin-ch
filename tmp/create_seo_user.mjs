import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const hashedPassword = await bcrypt.hash("Seo1234!", 10);

const user = await prisma.user.create({
  data: {
    email: "seo@kyujin-ch.jp",
    password: hashedPassword,
    role: "SEO_EDITOR",
    name: "SEOエディター",
  },
});

console.log("作成完了:", user.id, user.email, user.role);
await prisma.$disconnect();
