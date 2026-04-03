/**
 * 法人番号チェックデジット検証
 * 総務省アルゴリズム: 各桁をP[i]として
 * Q = Σ P[n] × 2^((n-1) mod 2 + 1)   ※国税庁の実際の計算方式
 * https://www.nta.go.jp/taxes/tetsuzuki/mynumber/houjin/01.htm
 */
export function validateCorporateNumberCheckDigit(num: string): boolean {
  const digits = num.replace(/[^\d]/g, "");
  if (!/^\d{13}$/.test(digits)) return false;

  const checkDigit = parseInt(digits[0], 10);
  let sum = 0;
  for (let i = 1; i <= 12; i++) {
    const p = parseInt(digits[i], 10);
    // 右から偶数位置は×2、奇数位置は×1
    // 右から: position = 13-i (1-indexed)
    const position = 13 - i;
    sum += p * (position % 2 === 0 ? 2 : 1);
  }
  const expected = 9 - (sum % 9);
  return checkDigit === expected;
}

export interface GBizCompanyInfo {
  corporateNumber: string;
  name: string;
}

/**
 * gBizINFO APIから法人情報を取得
 * https://info.gbiz.go.jp/hojin/v1/hojin/{法人番号}
 */
export async function lookupCorporateNumber(
  corporateNumber: string
): Promise<GBizCompanyInfo | null> {
  const token = process.env.GBIZ_API_TOKEN;
  if (!token) throw new Error("GBIZ_API_TOKEN is not configured");

  const digits = corporateNumber.replace(/[^\d]/g, "");
  if (!/^\d{13}$/.test(digits)) return null;

  const url = `https://info.gbiz.go.jp/hojin/v1/hojin/${digits}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "X-hojinInfo-api-token": token },
      next: { revalidate: 0 },
    });
  } catch {
    return null;
  }

  if (res.status === 404) return null;
  if (!res.ok) return null;

  const json = await res.json();
  // レスポンス: { hojin-infos: [ { corporate_number, name, ... } ] }
  const info = json?.["hojin-infos"]?.[0];
  if (!info) return null;

  return {
    corporateNumber: String(info.corporate_number ?? digits),
    name: String(info.name ?? ""),
  };
}

/**
 * 会社名の正規化（ファジーマッチング用）
 */
export function normalizeCompanyName(name: string): string {
  return name
    .replace(/[　 ]/g, "") // 全角・半角スペース除去
    .replace(
      /株式会社|有限会社|合同会社|一般社団法人|一般財団法人|公益社団法人|公益財団法人|（株）|（有）|\(株\)|\(有\)/g,
      ""
    )
    .normalize("NFKC")
    .toLowerCase();
}

export function companyNamesMatch(a: string, b: string): boolean {
  return normalizeCompanyName(a) === normalizeCompanyName(b);
}
