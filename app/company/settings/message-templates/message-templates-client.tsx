"use client";

import { useState, useTransition } from "react";
import { createMessageTemplate, updateMessageTemplate, deleteMessageTemplate } from "@/app/actions/company/applicants";

type Template = {
  id: string;
  title: string;
  body: string;
};

export function MessageTemplatesClient({ templates: initialTemplates }: { templates: Template[] }) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleCreate() {
    if (!newTitle.trim() || !newBody.trim()) {
      setError("タイトルと本文を入力してください");
      return;
    }
    setError("");
    startTransition(async () => {
      await createMessageTemplate(newTitle.trim(), newBody.trim());
      setTemplates((prev) => [...prev, { id: Date.now().toString(), title: newTitle.trim(), body: newBody.trim() }]);
      setNewTitle("");
      setNewBody("");
      setShowNew(false);
    });
  }

  function handleStartEdit(tpl: Template) {
    setEditingId(tpl.id);
    setEditTitle(tpl.title);
    setEditBody(tpl.body);
    setError("");
  }

  function handleSaveEdit(id: string) {
    if (!editTitle.trim() || !editBody.trim()) {
      setError("タイトルと本文を入力してください");
      return;
    }
    setError("");
    startTransition(async () => {
      await updateMessageTemplate(id, editTitle.trim(), editBody.trim());
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title: editTitle.trim(), body: editBody.trim() } : t))
      );
      setEditingId(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("このテンプレートを削除しますか？")) return;
    startTransition(async () => {
      await deleteMessageTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    });
  }

  const textareaCls = "w-full rounded-[8px] border border-[#d3dae8] px-3 py-2 text-[14px] focus:border-[#2f6cff] focus:outline-none resize-none";
  const inputCls = "w-full rounded-[8px] border border-[#d3dae8] px-3 py-2 text-[14px] focus:border-[#2f6cff] focus:outline-none";

  return (
    <div className="mt-6">
      {error && (
        <div className="mb-4 rounded-[8px] border border-[#ff5e7d] bg-[#fff5f7] px-4 py-3 text-[13px] text-[#ff3158]">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {templates.length === 0 && !showNew && (
          <p className="text-[14px] text-[#aaa]">テンプレートがまだありません</p>
        )}

        {templates.map((tpl) => (
          <div key={tpl.id} className="rounded-[14px] bg-white p-5 shadow-[0_2px_8px_rgba(37,56,88,0.04)]">
            {editingId === tpl.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="テンプレート名"
                  className={inputCls}
                />
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={5}
                  placeholder="本文"
                  className={textareaCls}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(tpl.id)}
                    disabled={isPending}
                    className="rounded-[8px] bg-[#2f6cff] px-4 py-2 text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {isPending ? "保存中..." : "保存"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-[8px] border border-[#d7deeb] px-4 py-2 text-[13px] text-[#555] hover:bg-[#f8fbff]"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-[#333]">{tpl.title}</p>
                    <p className="mt-2 whitespace-pre-line text-[13px] leading-[1.8] text-[#555]">{tpl.body}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(tpl)}
                      className="rounded-[6px] border border-[#d6dce8] px-3 py-1.5 text-[12px] text-[#555] hover:bg-[#f8fbff] transition"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tpl.id)}
                      disabled={isPending}
                      className="rounded-[6px] border border-[#ff8aa0] px-3 py-1.5 text-[12px] text-[#ff3158] hover:bg-[#fff5f7] transition disabled:opacity-50"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {showNew && (
          <div className="rounded-[14px] border border-[#d3dae8] bg-white p-5">
            <p className="mb-3 text-[14px] font-bold text-[#333]">新しいテンプレート</p>
            <div className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="テンプレート名（例：面接日程のご案内）"
                className={inputCls}
                autoFocus
              />
              <textarea
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                rows={6}
                placeholder="本文"
                className={textareaCls}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isPending}
                  className="rounded-[8px] bg-[#2f6cff] px-4 py-2 text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? "作成中..." : "作成"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNew(false); setNewTitle(""); setNewBody(""); setError(""); }}
                  className="rounded-[8px] border border-[#d7deeb] px-4 py-2 text-[13px] text-[#555] hover:bg-[#f8fbff]"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {!showNew && (
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-[12px] border border-[#2f6cff] px-5 py-3 text-[14px] font-bold text-[#2f6cff] hover:bg-[#eef2ff] transition"
        >
          <span>+ テンプレートを追加</span>
        </button>
      )}
    </div>
  );
}
