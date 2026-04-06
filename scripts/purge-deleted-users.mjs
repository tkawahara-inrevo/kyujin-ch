/**
 * 退会から30日経過したユーザーを完全削除するスクリプト
 * cron: 毎日 2:00 AM JST に実行
 *
 * サーバーでの設定例:
 *   crontab -e
 *   0 17 * * * cd /home/ubuntu/kyujin-ch && set -a && source .env 2>/dev/null; set +a && node scripts/purge-deleted-users.mjs >> /var/log/purge-deleted-users.log 2>&1
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config({ path: ".env" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 削除対象ユーザーを取得
  const targets = await prisma.user.findMany({
    where: {
      deletedAt: { not: null, lte: thirtyDaysAgo },
    },
    select: { id: true, email: true, deletedAt: true },
  });

  if (targets.length === 0) {
    console.log(`[${new Date().toISOString()}] 削除対象ユーザーなし`);
    await prisma.$disconnect();
    return;
  }

  console.log(`[${new Date().toISOString()}] 削除対象: ${targets.length} 件`);

  for (const user of targets) {
    try {
      // 関連データを削除してからユーザーを削除
      await prisma.$transaction(async (tx) => {
        // セッション・アカウント削除
        await tx.session.deleteMany({ where: { userId: user.id } });
        await tx.account.deleteMany({ where: { userId: user.id } });
        // ブックマーク・お気に入り削除
        await tx.bookmark.deleteMany({ where: { userId: user.id } });
        await tx.favorite.deleteMany({ where: { userId: user.id } });
        // クチコミ削除
        await tx.review.deleteMany({ where: { userId: user.id } });
        // ユーザー本体削除（応募はcascade or 外部キー制約に従う）
        await tx.user.delete({ where: { id: user.id } });
      });

      console.log(`[${new Date().toISOString()}] 削除完了: ${user.id} (退会日: ${user.deletedAt?.toISOString()})`);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] 削除失敗: ${user.id}`, err.message);
    }
  }

  console.log(`[${new Date().toISOString()}] 完了`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
