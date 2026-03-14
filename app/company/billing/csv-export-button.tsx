"use client";

import type { ChargeRow } from "@/app/actions/company/billing";

type Props = {
  charges: ChargeRow[];
  month: string;
};

export function CsvExportButton({ charges, month }: Props) {
  const handleExport = () => {
    const header = "日時,求人,求職者,金額,有効";
    const rows = charges.map((ch) => {
      const date = new Date(ch.createdAt).toLocaleDateString("ja-JP");
      // Escape fields that may contain commas
      const jobTitle = `"${ch.jobTitle.replace(/"/g, '""')}"`;
      const userName = `"${ch.userName.replace(/"/g, '""')}"`;
      return `${date},${jobTitle},${userName},${ch.amount},${ch.isValid ? "有効" : "無効"}`;
    });

    const csvContent = "\uFEFF" + [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `課金明細_${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-[13px] font-bold text-[#059669] hover:bg-[#ecfdf5] disabled:opacity-50"
    >
      CSV出力
    </button>
  );
}
