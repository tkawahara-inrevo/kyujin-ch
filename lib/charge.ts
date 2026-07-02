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

/**
 * 応募1件あたりの請求額を解決する。
 * - 無料期間内は 0 円
 * - targetType が PART_TIME_INTERN / TEMPORARY なら該当の固定料金
 * - それ以外はカテゴリ別単価 or 既定 11000 円
 */
export async function resolveChargeAmount(
  categoryTag: string | null,
  companyCreatedAt: Date,
  now: Date,
  targetType?: string | null,
): Promise<number> {
  if (isFreeCampaignPeriod(companyCreatedAt, now)) return 0;

  // アルバイト・インターン / 派遣 は固定料金 (categoryTag に関わらず一律)
  if (targetType === "PART_TIME_INTERN" || targetType === "TEMPORARY") {
    const fixed = await prisma.priceEntry.findFirst({
      where: { targetType, subcategory: "固定料金" },
    });
    if (fixed) return fixed.experiencedPrice;
    return 0; // 固定料金未設定なら 0 円で安全側 (無料と同等)
  }

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
