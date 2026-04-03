"use client";

import { useEffect, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectDownProps {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function SelectDown({
  name,
  value,
  onChange,
  options,
  placeholder = "選択してください",
  className = "",
  required,
}: SelectDownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  return (
    <div ref={ref} className="relative">
      {/* hidden input for form submission */}
      {name && <input type="hidden" name={name} value={value} required={required} />}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between text-left ${className}`}
      >
        <span className={value ? "text-[#333]" : "text-[#999]"}>
          {value ? selectedLabel : placeholder}
        </span>
        <span className="ml-2 shrink-0 text-[10px] text-[#999]">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <ul className="absolute left-0 top-[calc(100%+4px)] z-50 max-h-60 w-full overflow-y-auto rounded-md border border-[#d1d5db] bg-white shadow-lg">
          {placeholder && (
            <li
              onClick={() => { onChange(""); setOpen(false); }}
              className="cursor-pointer px-3 py-2 text-sm text-[#999] hover:bg-[#f5f7ff]"
            >
              {placeholder}
            </li>
          )}
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`cursor-pointer px-3 py-2 text-sm hover:bg-[#f5f7ff] ${
                opt.value === value ? "bg-[#eef2ff] font-semibold text-[#2f6cff]" : "text-[#333]"
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
