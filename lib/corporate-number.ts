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

// NTA API はShift-JIS CSVで返す（type=01でもCSV）
function parseNtaCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      fields.push(current); current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

/**
 * 国税庁 法人番号公表サイト Web-API から法人情報を取得
 * https://www.houjin-bangou.nta.go.jp/webapi/
 * レスポンスはShift-JIS CSV（type=01でもCSV形式）
 * CSV列: [0]=連番, [1]=法人番号, ..., [6]=法人名称
 */
export async function lookupCorporateNumber(
  corporateNumber: string
): Promise<GBizCompanyInfo | null> {
  const appId = process.env.NTA_CORPORATE_NUMBER_API_APP_ID;
  if (!appId) throw new Error("NTA_CORPORATE_NUMBER_API_APP_ID is not configured");

  const digits = corporateNumber.replace(/[^\d]/g, "");
  if (!/^\d{13}$/.test(digits)) return null;

  const apiUrl = new URL("https://api.houjin-bangou.nta.go.jp/4/num");
  apiUrl.searchParams.set("id", appId);
  apiUrl.searchParams.set("number", digits);
  apiUrl.searchParams.set("type", "01");
  apiUrl.searchParams.set("history", "0");

  let res: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    res = await fetch(apiUrl.toString(), {
      next: { revalidate: 0 },
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch {
    return null;
  }

  if (!res.ok) return null;

  const buf = await res.arrayBuffer();
  const text = new TextDecoder("shift-jis").decode(buf);
  const lines = text.trim().split("\n");
  if (lines.length < 2) return null;

  const fields = parseNtaCsvLine(lines[1]);
  const foundNumber = fields[1]?.trim();
  const name = fields[6]?.trim();

  if (!foundNumber || !name) return null;

  return { corporateNumber: foundNumber, name };
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
