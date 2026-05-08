import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const DB = "postgresql://kyujin_admin:kyujin-admin@ls-c1d96afa9802a53566cd6b395adb6cab66969d9a.cfkao8yaa93e.ap-northeast-1.rds.amazonaws.com:5432/kyujin_ch";

const adapter = new PrismaPg({ connectionString: DB });
const prisma = new PrismaClient({ adapter });

const results = await prisma.job.groupBy({
  by: ['categoryTag'],
  where: { isPublished: true, reviewStatus: 'PUBLISHED', isDeleted: false },
  _count: { id: true },
  orderBy: { _count: { id: 'desc' } },
});

console.log('categoryTag別 掲載中求人件数');
console.log('='.repeat(38));
for (const r of results) {
  process.stdout.write((r.categoryTag ?? '(未設定)').padEnd(22) + r._count.id + '件\n');
}
const total = results.reduce((s, r) => s + r._count.id, 0);
console.log('='.repeat(38));
process.stdout.write('合計                  ' + total + '件\n');
await prisma.$disconnect();
