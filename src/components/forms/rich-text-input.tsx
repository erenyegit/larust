"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";

export function RichTextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder ?? "Write your response...",
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-[140px] rounded-b-lg border border-slate-300 border-t-0 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-lg">
      <div className="flex flex-wrap gap-1 rounded-t-lg border border-slate-300 bg-slate-100 p-2 text-xs">
        <button
          type="button"
          className={cn("rounded px-2 py-1", editor.isActive("bold") ? "bg-blue-600 text-white" : "bg-white text-slate-700")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          className={cn("rounded px-2 py-1", editor.isActive("italic") ? "bg-blue-600 text-white" : "bg-white text-slate-700")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          type="button"
          className={cn("rounded px-2 py-1", editor.isActive("bulletList") ? "bg-blue-600 text-white" : "bg-white text-slate-700")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          List
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
