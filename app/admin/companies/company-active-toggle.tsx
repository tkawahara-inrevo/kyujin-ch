"use client";

import { useTransition } from "react";
import { toggleCompanyActive } from "@/app/actions/admin/accounts";

export function CompanyActiveToggle({ companyId, isActive }: { companyId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => toggleCompanyActive(companyId, !isActive))}
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
        isActive ? "bg-[#d1fae5] text-[#059669]" : "bg-[#fee2e2] text-[#dc2626]"
      } ${isPending ? "opacity-50" : ""}`}
    >
      {isActive ? "有効" : "停止"}
    </button>
  );
}
