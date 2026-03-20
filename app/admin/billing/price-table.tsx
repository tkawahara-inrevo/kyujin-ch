"use client";

import { useState, useTransition } from "react";
import { updatePrice, createPriceEntry, deletePriceEntry } from "@/app/actions/admin/prices";

type Entry = {
  id: string;
  category: string;
  subcategory: string;
  experiencedPrice: number;
  inexperiencedPrice: number | null;
  sortOrder: number;
};

export default function PriceTable({
  grouped,
  categories,
}: {
  grouped: Record<string, Entry[]>;
  categories: string[];
}) {
  return (
    <div className="mt-6 space-y-6">
      {categories.map((category) => (
        <CategorySection key={category} category={category} entries={grouped[category]} />
      ))}
      <AddCategoryForm />
    </div>
  );
}

function CategorySection({
  category,
  entries,
}: {
  category: string;
  entries: Entry[];
}) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between bg-[#1e3a5f] px-5 py-3">
        <h2 className="text-[14px] font-bold text-white">{category}</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-md bg-white/20 px-3 py-1 text-[12px] font-medium text-white hover:bg-white/30"
        >
          {showAdd ? "キャンセル" : "+ 追加"}
        </button>
      </div>

      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-[#e5e7eb] bg-[#f8fafc] text-[#888]">
            <th className="px-5 py-2.5 text-left font-semibold">職種</th>
            <th className="w-[140px] px-5 py-2.5 text-right font-semibold">経験者</th>
            <th className="w-[140px] px-5 py-2.5 text-right font-semibold">未経験者</th>
            <th className="w-[100px] px-5 py-2.5 text-center font-semibold">操作</th>
          </tr>
        </thead>
        <tbody>
          {showAdd && (
            <AddEntryRow category={category} onDone={() => setShowAdd(false)} />
          )}
          {entries.map((entry) => (
            <PriceRow key={entry.id} entry={entry} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PriceRow({ entry }: { entry: Entry }) {
  const [editing, setEditing] = useState(false);
  const [experienced, setExperienced] = useState(String(entry.experiencedPrice));
  const [inexperienced, setInexperienced] = useState(
    entry.inexperiencedPrice ? String(entry.inexperiencedPrice) : ""
  );
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    const exp = parseInt(experienced);
    const inexp = inexperienced ? parseInt(inexperienced) : null;
    if (isNaN(exp)) return;
    if (inexperienced && isNaN(inexp!)) return;
    startTransition(async () => {
      await updatePrice(entry.id, exp, inexp);
      setEditing(false);
    });
  };

  const handleDelete = () => {
    if (!confirm(`「${entry.subcategory}」を削除しますか？`)) return;
    startTransition(async () => {
      await deletePriceEntry(entry.id);
    });
  };

  if (editing) {
    return (
      <tr className="border-b border-[#f0f0f0] bg-[#fffbeb]">
        <td className="px-5 py-2 text-[#555]">{entry.subcategory}</td>
        <td className="px-5 py-2">
          <input
            type="number"
            value={experienced}
            onChange={(e) => setExperienced(e.target.value)}
            className="w-full rounded border border-[#d1d5db] px-2 py-1 text-right text-[13px]"
          />
        </td>
        <td className="px-5 py-2">
          <input
            type="number"
            value={inexperienced}
            onChange={(e) => setInexperienced(e.target.value)}
            placeholder="—"
            className="w-full rounded border border-[#d1d5db] px-2 py-1 text-right text-[13px]"
          />
        </td>
        <td className="px-5 py-2 text-center">
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="rounded bg-[#2f6cff] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#1d5ae0] disabled:opacity-50"
            >
              {isPending ? "..." : "保存"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setExperienced(String(entry.experiencedPrice));
                setInexperienced(entry.inexperiencedPrice ? String(entry.inexperiencedPrice) : "");
              }}
              className="rounded bg-[#e5e7eb] px-2.5 py-1 text-[11px] font-bold text-[#555] hover:bg-[#d1d5db]"
            >
              戻す
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-[#f0f0f0] hover:bg-[#fafbff]">
      <td className="px-5 py-2.5 text-[#555]">{entry.subcategory}</td>
      <td className="px-5 py-2.5 text-right font-medium text-[#333]">
        ¥{entry.experiencedPrice.toLocaleString()}
      </td>
      <td className="px-5 py-2.5 text-right font-medium text-[#333]">
        {entry.inexperiencedPrice ? `¥${entry.inexperiencedPrice.toLocaleString()}` : "—"}
      </td>
      <td className="px-5 py-2.5 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => setEditing(true)}
            className="rounded bg-[#eef2ff] px-2.5 py-1 text-[11px] font-bold text-[#2f6cff] hover:bg-[#dde5ff]"
          >
            編集
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="rounded bg-[#fee2e2] px-2.5 py-1 text-[11px] font-bold text-[#dc2626] hover:bg-[#fecaca] disabled:opacity-50"
          >
            削除
          </button>
        </div>
      </td>
    </tr>
  );
}

function AddEntryRow({ category, onDone }: { category: string; onDone: () => void }) {
  const [subcategory, setSubcategory] = useState("");
  const [experienced, setExperienced] = useState("");
  const [inexperienced, setInexperienced] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!subcategory.trim()) return;
    const exp = parseInt(experienced);
    if (isNaN(exp)) return;
    const inexp = inexperienced ? parseInt(inexperienced) : null;
    startTransition(async () => {
      await createPriceEntry(category, subcategory.trim(), exp, inexp);
      onDone();
    });
  };

  return (
    <tr className="border-b border-[#f0f0f0] bg-[#f0fdf4]">
      <td className="px-5 py-2">
        <input
          type="text"
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          placeholder="職種名"
          className="w-full rounded border border-[#d1d5db] px-2 py-1 text-[13px]"
          autoFocus
        />
      </td>
      <td className="px-5 py-2">
        <input
          type="number"
          value={experienced}
          onChange={(e) => setExperienced(e.target.value)}
          placeholder="経験者料金"
          className="w-full rounded border border-[#d1d5db] px-2 py-1 text-right text-[13px]"
        />
      </td>
      <td className="px-5 py-2">
        <input
          type="number"
          value={inexperienced}
          onChange={(e) => setInexperienced(e.target.value)}
          placeholder="未経験者（任意）"
          className="w-full rounded border border-[#d1d5db] px-2 py-1 text-right text-[13px]"
        />
      </td>
      <td className="px-5 py-2 text-center">
        <button
          onClick={handleAdd}
          disabled={isPending}
          className="rounded bg-[#059669] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#047857] disabled:opacity-50"
        >
          {isPending ? "..." : "追加"}
        </button>
      </td>
    </tr>
  );
}

function AddCategoryForm() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [experienced, setExperienced] = useState("");
  const [inexperienced, setInexperienced] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-[12px] border-2 border-dashed border-[#d1d5db] px-5 py-4 text-[13px] font-medium text-[#888] hover:border-[#2f6cff] hover:text-[#2f6cff]"
      >
        + 新しいカテゴリを追加
      </button>
    );
  }

  const handleAdd = () => {
    if (!category.trim() || !subcategory.trim()) return;
    const exp = parseInt(experienced);
    if (isNaN(exp)) return;
    const inexp = inexperienced ? parseInt(inexperienced) : null;
    startTransition(async () => {
      await createPriceEntry(category.trim(), subcategory.trim(), exp, inexp);
      setOpen(false);
      setCategory("");
      setSubcategory("");
      setExperienced("");
      setInexperienced("");
    });
  };

  return (
    <div className="rounded-[12px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h3 className="text-[14px] font-bold text-[#333]">新しいカテゴリを追加</h3>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="カテゴリ名"
          className="rounded border border-[#d1d5db] px-3 py-2 text-[13px]"
        />
        <input
          type="text"
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          placeholder="職種名"
          className="rounded border border-[#d1d5db] px-3 py-2 text-[13px]"
        />
        <input
          type="number"
          value={experienced}
          onChange={(e) => setExperienced(e.target.value)}
          placeholder="経験者料金"
          className="rounded border border-[#d1d5db] px-3 py-2 text-[13px]"
        />
        <input
          type="number"
          value={inexperienced}
          onChange={(e) => setInexperienced(e.target.value)}
          placeholder="未経験者（任意）"
          className="rounded border border-[#d1d5db] px-3 py-2 text-[13px]"
        />
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleAdd}
          disabled={isPending}
          className="rounded bg-[#2f6cff] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#1d5ae0] disabled:opacity-50"
        >
          {isPending ? "追加中..." : "追加"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded bg-[#e5e7eb] px-4 py-2 text-[13px] font-bold text-[#555] hover:bg-[#d1d5db]"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
