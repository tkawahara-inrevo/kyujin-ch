export function formatSalary(min?: number | null, max?: number | null): string {
  if (!min && !max) return "応相談";
  const toMan = (v: number) => Math.round(v / 10000);
  const minMan = min ? toMan(min) : null;
  const maxMan = max ? toMan(max) : null;
  if (minMan && maxMan && minMan === maxMan) return `${minMan}万円`;
  if (minMan && maxMan) return `${minMan}万円〜${maxMan}万円`;
  if (minMan) return `${minMan}万円〜`;
  return `〜${maxMan}万円`;
}
