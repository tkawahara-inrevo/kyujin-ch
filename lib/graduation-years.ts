/**
 * 現在の日付から、表示対象の卒業年度を算出する。
 * - 4月〜翌3月を「採用サイクル」とする
 * - 例: 2026年4月〜2027年3月 → 27卒・28卒が対象
 *   (27卒 = 直近卒, 28卒 = 次年度卒)
 */
export function getActiveGraduationYears(): number[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12

  // 4月以降なら今年度＝year, 1〜3月ならまだ前年度
  const fiscalYear = month >= 4 ? year : year - 1;

  // 直近卒 = fiscalYear+1 (例: 2026年度 → 27卒)
  // 次年度卒 = fiscalYear+2 (例: 2026年度 → 28卒)
  return [fiscalYear + 1, fiscalYear + 2];
}

/** 卒業年度をラベルに変換 (例: 2027 → "27卒") */
export function graduationYearLabel(year: number): string {
  return `${String(year).slice(-2)}卒`;
}
