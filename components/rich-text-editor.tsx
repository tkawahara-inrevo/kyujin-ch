"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import { useRef, useState } from "react";

type Props = {
  name: string;
  defaultValue?: string;
};

export function RichTextEditor({ name, defaultValue = "" }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [html, setHtml] = useState(defaultValue);
  // カーソル位置の変化でツールバーをリレンダさせるための tick
  const [, setSelectionTick] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({ openOnClick: false }),
      TiptapImage.configure({ inline: false }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: "rich-editor min-h-[320px] px-4 py-3 text-[14px] leading-[1.8] text-[#374151] outline-none",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    onSelectionUpdate: () => setSelectionTick((n) => n + 1),
    immediatelyRender: false,
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        alert(data.error ?? "アップロードに失敗しました");
      }
    } catch {
      alert("アップロードに失敗しました");
    }
    e.target.value = "";
  }

  return (
    <div className="rounded-lg border border-[#d7dee9] focus-within:border-[#2f6cff]">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleImageUpload}
      />

      <EditorContent editor={editor} />

      {/* ツールバー：エディタ下に固定、ビューポート下端にもsticky */}
      <div className="sticky bottom-0 z-10 flex flex-wrap gap-1 border-t border-[#d7dee9] bg-[#f8fafc] px-2 py-1.5 backdrop-blur">
        <ToolBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} title="太字">
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} title="斜体">
          <em>I</em>
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })} title="見出し2">
          H2
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive("heading", { level: 3 })} title="見出し3">
          H3
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} title="箇条書き">
          • リスト
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} title="番号リスト">
          1. リスト
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")} title="引用">
          引用
        </ToolBtn>
        <ToolBtn onClick={() => {
          const url = window.prompt("URL:");
          if (url) editor?.chain().focus().setLink({ href: url }).run();
        }} active={editor?.isActive("link")} title="リンク">
          🔗
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().unsetLink().run()} title="リンク解除">
          ✕リンク
        </ToolBtn>
        <ToolBtn onClick={() => fileInputRef.current?.click()} title="画像を挿入">
          🖼 画像
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().setHardBreak().run()} title="改行">
          ↵
        </ToolBtn>
      </div>

      <input type="hidden" name={name} value={html} />
    </div>
  );
}

function ToolBtn({ onClick, active, title, children }: {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded px-2 py-1 text-[12px] font-medium transition ${
        active ? "bg-[#2f6cff] text-white" : "text-[#555] hover:bg-[#e8edf5]"
      }`}
    >
      {children}
    </button>
  );
}
