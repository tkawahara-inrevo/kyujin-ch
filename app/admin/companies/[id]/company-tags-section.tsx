"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCompanyTags } from "@/app/actions/admin/company-tags";

type Props = {
  companyId: string;
  initialTags: string[];
  suggestions: string[]; // 既存タグ一覧 (候補として表示)
};

export default function CompanyTagsSection({ companyId, initialTags, suggestions }: Props) {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function addTag(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (trimmed.length > 40) {
      setError("タグは40文字以内で入力してください");
      return;
    }
    if (tags.includes(trimmed)) {
      setInput("");
      return;
    }
    setTags([...tags, trimmed]);
    setInput("");
    setError("");
    setSuccess(false);
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
    setSuccess(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
  }

  function handleSave() {
    setError("");
    setSuccess(false);
    startTransition(async () => {
      try {
        const res = await updateCompanyTags(companyId, tags);
        setTags(res.tags);
        setSuccess(true);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "保存に失敗しました");
      }
    });
  }

  const availableSuggestions = suggestions.filter((s) => !tags.includes(s));

  return (
    <div className="mt-6 rounded-[12px] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-bold text-[#333]">クライアントタグ</h2>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-[8px] bg-[#2f6cff] px-4 py-2 text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "保存中..." : "タグを保存"}
        </button>
      </div>
      <p className="mb-3 text-[12px] text-[#888]">
        付与したタグは、この企業の求人一覧・企業一覧の絞り込みに使えます。求人詳細ページでは公開されません。
      </p>

      {error && <p className="mb-2 text-[12px] font-medium text-[#dc2626]">{error}</p>}
      {success && <p className="mb-2 text-[12px] font-medium text-[#047857]">タグを保存しました</p>}

      <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-[#e2e8f0] bg-[#fafbfd] p-3">
        {tags.length === 0 && !input && (
          <span className="text-[12px] text-[#aaa]">タグを入力して Enter または , で追加</span>
        )}
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-[#e0e7ff] px-3 py-1 text-[12px] font-bold text-[#1e3a8a]"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-[#1e3a8a] hover:text-[#dc2626]"
              aria-label={`${tag} を削除`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
          className="min-w-[120px] flex-1 border-none bg-transparent text-[13px] outline-none placeholder:text-[#bbb]"
          placeholder={tags.length > 0 ? "新しいタグ..." : "例: 重要, 大型案件"}
        />
      </div>

      {availableSuggestions.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-[11px] font-bold text-[#888]">既存タグから選択</p>
          <div className="flex flex-wrap gap-1.5">
            {availableSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className="rounded-full border border-[#d1d5db] px-2.5 py-0.5 text-[11px] font-medium text-[#555] hover:bg-[#f0f5ff] hover:border-[#2f6cff] hover:text-[#2f6cff]"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
