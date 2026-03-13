"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Tab = { value: string; label: string };

export function TargetTabs({ tabs, active }: { tabs: Tab[]; active: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("target");
    } else {
      params.set("target", value);
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => handleClick(tab.value)}
          className={`shrink-0 rounded-full px-5 py-2 text-[14px] font-bold transition ${
            active === tab.value
              ? "bg-[#1e3a5f] text-white"
              : "bg-white text-[#666] hover:bg-[#eee]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
