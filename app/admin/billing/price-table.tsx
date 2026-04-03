"use client";

import { useState, useTransition } from "react";
import { updatePrice, createPriceEntry, deletePriceEntry, deleteCategory, renameCategory, reorderEntry, reorderCategories } from "@/app/actions/admin/prices";

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
  const [showSortModal, setShowSortModal] = useState(false);

  return (
    <div className="mt-6 space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowSortModal(true)}
          className="rounded-[10px] border border-[#d0d7e6] bg-white px-4 py-2 text-[13px] font-bold text-[#1e3a5f] shadow-sm hover:bg-[#f4f7fb] transition"
        >
          カテゴリを並べ替え
        </button>
      </div>

      {categories.map((category) => (
        <CategorySection
          key={category}
          category={category}
          entries={grouped[category]}
        />
      ))}

      <AddCategoryForm />

      {showSortModal && (
        <CategorySortModal
          categories={categories}
          onClose={() => setShowSortModal(false)}
        />
      )}
    </div>
  );
}

function CategorySortModal({
  categories,
  onClose,
}: {
  categories: string[];
  onClose: () => void;
}) {
  const [order, setOrder] = useState<string[]>([...categories]);
  const [isPending, startTransition] = useTransition();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function move(index: number, direction: "up" | "down") {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= order.length) return;
    const next = [...order];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    setOrder(next);
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setDragOverIndex(index);
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const next = [...order];
    const [removed] = next.splice(dragIndex, 1);
    next.splice(index, 0, removed);
    setOrder(next);
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleSave() {
    startTransition(async () => {
      await reorderCategories(order);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex w-full max-w-[480px] flex-col rounded-[16px] bg-white shadow-2xl" style={{ maxHeight: "90vh" }}>
        <div className="shrink-0 px-6 pt-6 pb-4">
          <h2 className="text-[18px] font-bold text-[#1e3a5f]">カテゴリの並べ替え</h2>
          <p className="mt-1 text-[12px] text-[#888]">ドラッグまたは ▲▼ で順序を変更し、保存してください</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          <div className="space-y-1 pb-2">
            {order.map((cat, index) => (
              <div
                key={cat}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={`flex cursor-grab items-center gap-2 rounded-[8px] border px-3 py-1.5 transition-colors active:cursor-grabbing select-none ${
                  dragIndex === index
                    ? "opacity-40 border-[#d0d7e6] bg-[#f8fafc]"
                    : dragOverIndex === index
                      ? "border-[#2f6cff] bg-[#eef4ff]"
                      : "border-[#e5e7eb] bg-[#f8fafc] hover:border-[#d0d7e6]"
                }`}
              >
                <span className="shrink-0 text-[13px] text-[#ccc]">⠿</span>
                <span className="shrink-0 w-5 text-center text-[11px] text-[#bbb]">{index + 1}</span>
                <span className="flex-1 text-[13px] font-medium text-[#2b2f38] truncate">{cat}</span>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    onClick={() => move(index, "up")}
                    disabled={index === 0}
                    className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-[#999] hover:bg-[#e5e7eb] disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => move(index, "down")}
                    disabled={index === order.length - 1}
                    className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-[#999] hover:bg-[#e5e7eb] disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-[#f0f0f0] px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-[10px] border border-[#d0d7e6] px-5 py-2.5 text-[13px] font-bold text-[#667085] hover:bg-[#f4f7fb] disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-[10px] bg-[#1e3a5f] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#16304f] disabled:opacity-60"
          >
            {isPending ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
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
  const [editingName, setEditingName] = useState(false);
  const [categoryName, setCategoryName] = useState(category);
  const [isPending, startTransition] = useTransition();

  const handleDeleteCategory = () => {
    if (!confirm(`カテゴリ「${category}」とその全職種を削除しますか？`)) return;
    startTransition(async () => {
      await deleteCategory(category);
    });
  };

  const handleRename = () => {
    if (!categoryName.trim() || categoryName.trim() === category) {
      setEditingName(false);
      setCategoryName(category);
      return;
    }
    startTransition(async () => {
      await renameCategory(category, categoryName.trim());
      setEditingName(false);
    });
  };

  return (
    <div className="overflow-hidden rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between bg-[#1e3a5f] px-5 py-3">
        {editingName ? (
          <div className="flex flex-1 items-center gap-2 mr-3">
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") { setEditingName(false); setCategoryName(category); }
              }}
              className="flex-1 rounded border border-white/40 bg-white/10 px-2 py-0.5 text-[14px] font-bold text-white outline-none focus:bg-white/20"
              autoFocus
            />
            <button
              onClick={handleRename}
              disabled={isPending}
              className="rounded bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/30 disabled:opacity-50"
            >
              {isPending ? "..." : "保存"}
            </button>
            <button
              onClick={() => { setEditingName(false); setCategoryName(category); }}
              className="rounded bg-white/10 px-2.5 py-1 text-[11px] text-white hover:bg-white/20"
            >
              戻す
            </button>
          </div>
        ) : (
          <button onClick={() => setEditingName(true)} className="group flex flex-1 items-center gap-2 mr-3">
            <h2 className="text-[14px] font-bold text-white group-hover:underline">{category}</h2>
            <span className="text-[10px] text-white/50 group-hover:text-white/80">✎</span>
          </button>
        )}
        {!editingName && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="rounded-md bg-white/20 px-3 py-1 text-[12px] font-medium text-white hover:bg-white/30"
            >
              {showAdd ? "キャンセル" : "+ 追加"}
            </button>
            <button
              onClick={handleDeleteCategory}
              disabled={isPending}
              className="rounded-md bg-red-500/70 px-3 py-1 text-[12px] font-medium text-white hover:bg-red-500/90 disabled:opacity-50"
            >
              カテゴリ削除
            </button>
          </div>
        )}
      </div>

      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-[#e5e7eb] bg-[#f8fafc] text-[#888]">
            <th className="w-[40px] px-2 py-2.5 text-center font-semibold">順</th>
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
          {entries.map((entry, index) => (
            <PriceRow
              key={entry.id}
              entry={entry}
              canMoveUp={index > 0}
              canMoveDown={index < entries.length - 1}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PriceRow({ entry, canMoveUp, canMoveDown }: { entry: Entry; canMoveUp: boolean; canMoveDown: boolean }) {
  const [editing, setEditing] = useState(false);
  const [subcategory, setSubcategory] = useState(entry.subcategory);
  const [experienced, setExperienced] = useState(String(entry.experiencedPrice));
  const [inexperienced, setInexperienced] = useState(
    entry.inexperiencedPrice ? String(entry.inexperiencedPrice) : ""
  );
  const [isPending, startTransition] = useTransition();

  const handleReorder = (direction: "up" | "down") => {
    startTransition(async () => {
      await reorderEntry(entry.id, direction);
    });
  };

  const handleSave = () => {
    if (!subcategory.trim()) return;
    const exp = parseInt(experienced);
    const inexp = inexperienced ? parseInt(inexperienced) : null;
    if (isNaN(exp)) return;
    if (inexperienced && isNaN(inexp!)) return;
    startTransition(async () => {
      await updatePrice(entry.id, exp, inexp, subcategory.trim());
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
        <td className="px-2 py-2 text-center">
          <div className="flex flex-col gap-0.5 items-center">
            <button onClick={() => handleReorder("up")} disabled={!canMoveUp || isPending} className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-[#aaa] hover:bg-[#e5e7eb] hover:text-[#555] disabled:opacity-20 disabled:cursor-not-allowed">▲</button>
            <button onClick={() => handleReorder("down")} disabled={!canMoveDown || isPending} className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-[#aaa] hover:bg-[#e5e7eb] hover:text-[#555] disabled:opacity-20 disabled:cursor-not-allowed">▼</button>
          </div>
        </td>
        <td className="px-5 py-2">
          <input
            type="text"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="w-full rounded border border-[#d1d5db] px-2 py-1 text-[13px]"
          />
        </td>
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
                setSubcategory(entry.subcategory);
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
      <td className="px-2 py-2.5 text-center">
        <div className="flex flex-col gap-0.5 items-center">
          <button onClick={() => handleReorder("up")} disabled={!canMoveUp || isPending} className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-[#aaa] hover:bg-[#e5e7eb] hover:text-[#555] disabled:opacity-20 disabled:cursor-not-allowed">▲</button>
          <button onClick={() => handleReorder("down")} disabled={!canMoveDown || isPending} className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-[#aaa] hover:bg-[#e5e7eb] hover:text-[#555] disabled:opacity-20 disabled:cursor-not-allowed">▼</button>
        </div>
      </td>
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
      <td className="px-2 py-2" />
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
        className="w-full rounded-[12px] border-2 border-dashed border-[#d1d5db] px-5 py-4 text-[13px] font-medium text-[#888] hover:border-[#2f6cff] hover:text-[#2f6cff]"
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
