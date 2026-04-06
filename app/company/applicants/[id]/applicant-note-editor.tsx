"use client";

import { useState, useTransition } from "react";
import { updateApplicationNote } from "@/app/actions/company/applicants";

export function ApplicantNoteEditor({
  applicationId,
  initialNote,
}: {
  applicationId: string;
  initialNote: string;
}) {
  const [note, setNote] = useState(initialNote);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(initialNote);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateApplicationNote(applicationId, editText);
      setNote(editText.trim());
      setEditing(false);
    });
  }

  function handleCancel() {
    setEditText(note);
    setEditing(false);
  }

  if (editing) {
    return (
      <div>
        <p className="text-[12px] font-semibold text-[#888]">社内メモ</p>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          rows={3}
          maxLength={500}
          autoFocus
          className="mt-1 w-full rounded-[8px] border border-[#d3dae8] px-3 py-2 text-[13px] focus:border-[#2f6cff] focus:outline-none resize-none"
          placeholder="社内メモを入力..."
        />
        <p className="mt-0.5 text-right text-[11px] text-[#aaa]">{editText.length} / 500</p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-[6px] bg-[#2f6cff] px-3 py-1.5 text-[12px] font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "保存中..." : "保存"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-[6px] border border-[#d7deeb] px-3 py-1.5 text-[12px] text-[#555] hover:bg-[#f8fbff]"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-[#888]">社内メモ</p>
        <button
          type="button"
          onClick={() => { setEditText(note); setEditing(true); }}
          className="rounded-[6px] border border-[#d6dce8] px-2 py-1 text-[11px] text-[#666] hover:bg-[#f8fbff] transition"
        >
          編集
        </button>
      </div>
      {note ? (
        <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-[#444]">{note}</p>
      ) : (
        <p className="mt-1 text-[13px] text-[#bbb]">メモなし</p>
      )}
    </div>
  );
}
