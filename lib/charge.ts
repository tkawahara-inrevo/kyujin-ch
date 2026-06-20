import { prisma } from "@/lib/prisma";

/** 企業アカウント発行から3ヶ月以内は無料キャンペーン期間 */
export function isFreeCampaignPeriod(companyCreatedAt: Date, now: Date) {
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
