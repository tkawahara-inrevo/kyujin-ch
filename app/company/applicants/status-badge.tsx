const colorMap: Record<string, string> = {
  APPLIED: "bg-[#e8f0fe] text-[#2f6cff]",
  REVIEWING: "bg-[#fef3c7] text-[#d97706]",
  INTERVIEW: "bg-[#ede9fe] text-[#7c3aed]",
  OFFER: "bg-[#d1fae5] text-[#059669]",
  HIRED: "bg-[#059669] text-white",
  REJECTED: "bg-[#fee2e2] text-[#dc2626]",
};

const labelMap: Record<string, string> = {
  APPLIED: "応募済",
  REVIEWING: "選考中",
  INTERVIEW: "面接",
  OFFER: "内定",
  HIRED: "採用",
  REJECTED: "不採用",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${colorMap[status] ?? "bg-[#f0f0f0] text-[#666]"}`}>
      {labelMap[status] ?? status}
    </span>
  );
}
