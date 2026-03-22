"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type DocumentUploadCardProps = {
  title: string;
  docType: "resume" | "careerHistory";
  fileUrl?: string | null;
};

export function DocumentUploadCard({
  title,
  docType,
  fileUrl,
}: DocumentUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const uploaded = !!fileUrl;
  const fileName = fileUrl ? fileUrl.split("/").pop() : undefined;

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", docType);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "アップロードに失敗しました");
      } else {
        router.refresh();
      }
    });

    // reset input so same file can be re-selected
    e.target.value = "";
  }

  return (
    <div className="rounded-[18px] border border-[#d9d9d9] bg-white p-5">
      <p className="text-[16px] font-bold text-[#333]">{title}</p>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-[18px] font-bold text-[#555] md:text-[20px]">
          {isPending ? "アップロード中..." : uploaded ? "アップロード済" : "未アップロード"}
        </p>

        {uploaded && fileName && !isPending && (
          <button
            onClick={async () => {
              const res = await fetch(`/api/upload?docType=${docType}`);
              const json = await res.json();
              if (json.url) window.open(json.url, "_blank");
            }}
            className="rounded-[8px] bg-[#9a9a9a] px-3 py-2 text-[14px] font-bold text-white hover:opacity-80"
          >
            {fileName}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-[13px] text-[#ff3158]">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.xlsx"
        className="hidden"
        onChange={handleUpload}
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="mt-5 w-full rounded-[10px] bg-[#2f6cff] px-5 py-4 text-[15px] font-bold !text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {uploaded ? "ファイルを選択して差し替える" : "ファイルを選択してアップロードする"}
      </button>
    </div>
  );
}
