import { prisma } from "@/lib/prisma";

/**
 * グローバル無料キャンペーン終了: 2026/07/31 23:59:59 JST = 2026/07/31 14:59:59.999 UTC
 * この日時までに発生した応募は全社、請求 0 円。
 */
const GLOBAL_FREE_UNTIL_UTC = Date.UTC(2026, 6, 31, 14, 59, 59, 999);

/**
 * 無料期間判定。次のいずれかを満たせば無料:
 * 1. グローバル無料期間内 (〜 2026/07/31 JST)
 * 2. 企業アカウント発行から 3 ヶ月以内
 */
export function isFreeCampaignPeriod(companyCreatedAt: Date, now: Date) {
  if (now.getTime() <= GLOBAL_FREE_UNTIL_UTC) return true;
  const threeMonthsLater = new Date(companyCreatedAt);
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  return now < threeMonthsLater;
}

/** 応募1件あたりの請求額を解決する。3ヶ月以内は0円、それ以外はカテゴリ別単価 or 既定11000円 */
export async function resolveChargeAmount(
  categoryTag: string | null,
  companyCreatedAt: Date,
  now: Date,
): Promise<number> {
  if (isFreeCampaignPeriod(companyCreatedAt, now)) return 0;

  let chargeAmount = 11000;
  if (categoryTag) {
    const priceEntry = await prisma.priceEntry.findFirst({
      where: { subcategory: categoryTag },
    });
    if (priceEntry) chargeAmount = priceEntry.experiencedPrice;
  }
  return chargeAmount;
}

export function currentBillingMonth(now: Date): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
