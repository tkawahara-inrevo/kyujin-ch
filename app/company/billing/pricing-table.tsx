"use client";

import { useState } from "react";

type PriceEntry = {
  id: string;
  category: string;
  subcategory: string;
  experiencedPrice: number;
  inexperiencedPrice: number | null;
  sortOrder: number;
};

type Props = {
  priceEntries: PriceEntry[];
};

export function PricingTable({ priceEntries }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Group by category
  const grouped: Record<string, PriceEntry[]> = {};
  for (const entry of priceEntries) {
    if (!grouped[entry.category]) grouped[entry.category] = [];
    grouped[entry.category].push(entry);
  }

  const handlePdfDownload = () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

    // Build table HTML for PDF
    let tableRows = "";
    for (const [category, entries] of Object.entries(grouped)) {
      tableRows += `<tr style="background:#eef2ff"><td colspan="3" style="padding:8px 16px;font-weight:bold;color:#1e3a5f;font-size:13px">${category}</td></tr>`;
      for (const entry of entries) {
        const inexpPrice = entry.inexperiencedPrice
          ? `&yen;${entry.inexperiencedPrice.toLocaleString()}`
          : "";
        tableRows += `<tr style="border-bottom:1px solid #f0f0f0">
          <td style="padding:6px 16px 6px 40px;color:#555;font-size:13px">${entry.subcategory}</td>
          <td style="padding:6px 16px;text-align:right;font-size:13px">&yen;${entry.experiencedPrice.toLocaleString()}</td>
          <td style="padding:6px 16px;text-align:right;font-size:13px">${inexpPrice}</td>
        </tr>`;
      }
    }

    const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>料金表</title>
<style>
  body { font-family: "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif; padding: 40px; color: #333; }
  h1 { font-size: 20px; color: #1e3a5f; margin-bottom: 4px; }
  .date { font-size: 12px; color: #888; margin-bottom: 24px; }
  .note { font-size: 12px; color: #888; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { padding: 8px 16px; font-size: 13px; border-bottom: 2px solid #e5e7eb; background: #f8fafc; }
  @media print { body { padding: 20px; } }
</style>
</head><body>
<h1>料金表</h1>
<p class="date">出力日: ${dateStr}</p>
<p class="note">応募1件あたりの課金単価（税抜）</p>
<table>
<thead><tr>
  <th style="text-align:left"></th>
  <th style="text-align:right;color:#1e3a5f">経験者</th>
  <th style="text-align:right;color:#dc2626">未経験者</th>
</tr></thead>
<tbody>${tableRows}</tbody>
</table>
</body></html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      // Wait for content to render, then trigger print (Save as PDF)
      printWindow.onload = () => {
        printWindow.print();
      };
      // Fallback for browsers that don't fire onload for document.write
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-[16px] font-bold text-[#333] hover:text-[#1e3a5f]"
        >
          <span
            className="inline-block text-[12px] transition-transform"
            style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
          >
            ▶
          </span>
          料金表
        </button>
        {isOpen && (
          <button
            onClick={handlePdfDownload}
            className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-[13px] font-bold text-[#1e3a5f] hover:bg-[#f0f4ff]"
          >
            PDF出力
          </button>
        )}
      </div>

      {isOpen && (
        <>
          <p className="mt-1 text-[12px] text-[#888]">
            応募1件あたりの課金単価（税抜）
          </p>
          <div className="mt-3 overflow-x-auto rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f8fafc]">
                  <th className="px-5 py-3 font-semibold text-[#333]" />
                  <th className="px-5 py-3 text-right font-semibold text-[#1e3a5f]">
                    経験者
                  </th>
                  <th className="px-5 py-3 text-right font-semibold text-[#dc2626]">
                    未経験者
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([category, entries]) => (
                  <CategoryBlock key={category} category={category} entries={entries} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function CategoryBlock({
  category,
  entries,
}: {
  category: string;
  entries: PriceEntry[];
}) {
  return (
    <>
      <tr className="bg-[#eef2ff]">
        <td colSpan={3} className="px-5 py-2.5 text-[13px] font-bold text-[#1e3a5f]">
          {category}
        </td>
      </tr>
      {entries.map((entry) => (
        <tr key={entry.id} className="border-b border-[#f0f0f0] hover:bg-[#fafbff]">
          <td className="py-2.5 pl-10 pr-5 text-[#555]">{entry.subcategory}</td>
          <td className="px-5 py-2.5 text-right font-medium text-[#333]">
            ¥{entry.experiencedPrice.toLocaleString()}
          </td>
          <td className="px-5 py-2.5 text-right font-medium text-[#333]">
            {entry.inexperiencedPrice
              ? `¥${entry.inexperiencedPrice.toLocaleString()}`
              : ""}
          </td>
        </tr>
      ))}
    </>
  );
}
