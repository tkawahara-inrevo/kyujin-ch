"use client";

import { useState, useRef, useCallback } from "react";

type ThumbnailUploadProps = {
  name: string;
  defaultValue?: string;
  onUploaded?: (url: string) => void;
};

export function ThumbnailUpload({ name, defaultValue, onUploaded }: ThumbnailUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const resizeImage = useCallback(
    (file: File): Promise<Blob> =>
      new Promise((resolve, reject) => {
        const img = new window.Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          let { width, height } = img;
          const MAX_W = 800;
          const MAX_H = 600;
          if (width > MAX_W || height > MAX_H) {
            const ratio = Math.min(MAX_W / width, MAX_H / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
            file.type === "image/png" ? "image/png" : "image/jpeg",
            0.85
          );
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("画像の読み込みに失敗しました"));
        };
        img.src = url;
      }),
    []
  );

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!ALLOWED.includes(file.type)) {
        setError("対応形式はJPEG/PNG/WebP/GIFのみです");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("ファイルサイズは5MB以下にしてください");
        return;
      }

      setUploading(true);
      try {
        const resized = await resizeImage(file);
        const formData = new FormData();
        formData.append("file", resized, file.name);

        const res = await fetch("/api/upload-image", { method: "POST", body: formData });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "アップロードに失敗しました");
          return;
        }

        setPreview(json.url);
        if (hiddenInputRef.current) hiddenInputRef.current.value = json.url;
        onUploaded?.(json.url);
      } catch {
        setError("アップロードに失敗しました");
      } finally {
        setUploading(false);
      }
    },
    [resizeImage, onUploaded]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (hiddenInputRef.current) hiddenInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <input type="hidden" name={name} ref={hiddenInputRef} defaultValue={defaultValue || ""} />

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="サムネイル"
            className="h-[180px] w-auto max-w-full rounded-[8px] border border-[#ddd] object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#ff3158] text-[12px] text-white shadow hover:bg-[#e0284d]"
          >
            x
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-[8px] border-2 border-dashed px-6 py-10 text-center transition ${
            dragOver
              ? "border-[#2f6cff] bg-[#2f6cff]/5"
              : "border-[#ddd] bg-[#fafafa] hover:border-[#aaa]"
          }`}
        >
          {uploading ? (
            <p className="text-[14px] text-[#888]">アップロード中...</p>
          ) : (
            <>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-[14px] font-medium text-[#666]">
                クリックまたはドラッグ&ドロップで画像をアップロード
              </p>
              <p className="mt-1 text-[12px] text-[#999]">
                JPEG / PNG / WebP / GIF (最大5MB、800x600pxにリサイズ)
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="mt-2 text-[13px] text-[#ff3158]">{error}</p>}
    </div>
  );
}
