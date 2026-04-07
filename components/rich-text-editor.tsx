"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";

type Props = {
  name: string;
  defaultValue?: string;
};

export function RichTextEditor({ name, defaultValue = "" }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: "min-h-[320px] px-4 py-3 text-[14px] leading-[1.8] text-[#374151] outline-none",
      },
    },
  });

  const html = editor?.getHTML() ?? defaultValue;

  return (
    <div className="rounded-lg border border-[#d7dee9] focus-within:border-[#2f6cff]">
      {/* ツールバー */}
      <div className="flex flex-wrap gap-1 border-b border-[#d7dee9] bg-[#f8fafc] px-2 py-1.5">
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
        <ToolBtn onClick={() => {
          const url = window.prompt("URL:");
          if (url) editor?.chain().focus().setLink({ href: url }).run();
        }} active={editor?.isActive("link")} title="リンク">
          🔗 リンク
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().unsetLink().run()} title="リンク解除">
          ✕リンク
        </ToolBtn>
        <ToolBtn onClick={() => editor?.chain().focus().setHardBreak().run()} title="改行">
          ↵
        </ToolBtn>
      </div>

      <EditorContent editor={editor} />

      {/* hidden input で formData に含める */}
      <input type="hidden" name={name} value={html} />
    </div>
  );
}

function ToolBtn({
  onClick,
  active,
  title,
  children,
}: {
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
