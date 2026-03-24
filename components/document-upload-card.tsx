"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type DocumentUploadCardProps = {
  title: string;
  docType: "resume" | "careerHistory";
  fileUrl?: string | null;
};

type UploadResponse = {
  error?: string;
  url?: string;
};

async function readJsonSafely(res: Response): Promise<UploadResponse | null> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return (await res.json()) as UploadResponse;
  } catch {
    return null;
  }
}

export function DocumentUploadCard({
  title,
  docType,
  fileUrl,
}: DocumentUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const uploaded = Boolean(fileUrl);
  const fileName = fileUrl ? fileUrl.split("/").pop() : undefined;

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("docType", docType);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const json = await readJsonSafely(res);

        if (!res.ok) {
          setError(json?.error ?? "アップロードに失敗しました");
          return;
        }

        router.refresh();
      } catch {
        setError("アップロードに失敗しました");
      }
    });

    // reset input so the same file can be selected again
    e.target.value = "";
  }

  async function handleOpenFile() {
    setError("");

    try {
      const res = await fetch(`/api/upload?docType=${docType}`, {
        cache: "no-store",
      });
      const json = await readJsonSafely(res);

      if (!res.ok || !json?.url) {
        setError(json?.error ?? "ファイルを開けませんでした");
        return;
      }

      window.open(json.url, "_blank", "noopener,noreferrer");
    } catch {
      setError("ファイルを開けませんでした");
    }
  }

  return (
    <div className="rounded-[18px] border border-[#d9d9d9] bg-white p-5">
      <p className="text-[16px] font-bold text-[#333]">{title}</p>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-[18px] font-bold text-[#555] md:text-[20px]">
          {isPending ? "アップロード中..." : uploaded ? "アップロード済み" : "未アップロード"}
        </p>

        {uploaded && fileName && !isPending && (
          <button
            type="button"
            onClick={handleOpenFile}
            className="rounded-[8px] bg-[#9a9a9a] px-3 py-2 text-[14px] font-bold text-white hover:opacity-80"
          >
            {fileName}
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-[13px] text-[#ff3158]">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.xlsx"
        className="hidden"
        onChange={handleUpload}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="mt-5 w-full rounded-[10px] bg-[#2f6cff] px-5 py-4 text-[15px] font-bold !text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {uploaded ? "ファイルを選択して差し替える" : "ファイルを選択してアップロードする"}
      </button>
    </div>
  );
}
