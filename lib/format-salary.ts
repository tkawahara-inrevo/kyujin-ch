/**
 * 給与表示の整形。
 * 給与種別 (salaryType) によって単位を切り替える:
 *  - annual / monthly: 万円表記 (1500000 → 150万円)
 *  - daily / hourly:   円表記 (1500 → 1,500円)
 *  - 未指定: 万円表記 (旧挙動・後方互換)
 */
export function formatSalary(
  min?: number | null,
  max?: number | null,
  salaryType?: string | null,
): string {
  if (!min && !max) return "応相談";

  const isYenUnit = salaryType === "hourly" || salaryType === "daily";

  if (isYenUnit) {
    const fmt = (v: number) => `${v.toLocaleString()}円`;
    if (min && max && min === max) return fmt(min);
    if (min && max) return `${fmt(min)}〜${fmt(max)}`;
    if (min) return `${fmt(min)}〜`;
    return `〜${fmt(max!)}`;
  }

  // 年俸・月給・未指定は万円表記
  const toMan = (v: number) => Math.round(v / 10000);
  const minMan = min ? toMan(min) : null;
  const maxMan = max ? toMan(max) : null;
  if (minMan && maxMan && minMan === maxMan) return `${minMan}万円`;
  if (minMan && maxMan) return `${minMan}万円〜${maxMan}万円`;
  if (minMan) return `${minMan}万円〜`;
  return `〜${maxMan}万円`;
}
