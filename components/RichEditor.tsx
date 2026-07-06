"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";

const TEXT_COLORS = ["#1C1B19", "#B3261E", "#8A5A00", "#1B6B3A", "#1D4E9B", "#6B3FA0"];
const HIGHLIGHT_COLORS = ["#FCEFC7", "#F6E1E1", "#E1EAF6", "#E3ECE1", "#EAE1F0"];

export default function RichEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (json: any, text: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState<"text" | "highlight" | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: content && Object.keys(content).length ? content : "",
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "editor-content" },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON(), editor.getText());
    },
  });

  // Keep editor in sync if a different note is selected
  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(content ?? {});
    if (current !== incoming) {
      editor.commands.setContent(content && Object.keys(content).length ? content : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, editor]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    `w-8 h-8 rounded-md flex items-center justify-center text-sm transition ${
      active ? "bg-accentSoft text-accent" : "hover:bg-line/60 text-ink"
    }`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 border-b border-line px-3 py-2 overflow-x-auto">
        <button className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <b>B</b>
        </button>
        <button className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <i>I</i>
        </button>
        <button className={btn(editor.isActive("underline"))} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <u>U</u>
        </button>
        <button className={btn(editor.isActive("strike"))} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          S
        </button>

        <div className="w-px h-5 bg-line mx-1" />

        <div className="relative">
          <button
            className={btn(pickerOpen === "text")}
            onClick={() => setPickerOpen(pickerOpen === "text" ? null : "text")}
            title="Text color"
          >
            <span className="font-bold" style={{ color: editor.getAttributes("textStyle").color || "#1C1B19" }}>
              A
            </span>
          </button>
          {pickerOpen === "text" && (
            <div className="absolute top-10 left-0 z-10 flex gap-1.5 bg-white border border-line rounded-lg p-2 shadow-card">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  className="w-6 h-6 rounded-full border border-line/60"
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    editor.chain().focus().setColor(c).run();
                    setPickerOpen(null);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className={btn(pickerOpen === "highlight")}
            onClick={() => setPickerOpen(pickerOpen === "highlight" ? null : "highlight")}
            title="Highlight"
          >
            <span className="px-0.5 rounded" style={{ backgroundColor: "#FCEFC7" }}>H</span>
          </button>
          {pickerOpen === "highlight" && (
            <div className="absolute top-10 left-0 z-10 flex gap-1.5 bg-white border border-line rounded-lg p-2 shadow-card">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c}
                  className="w-6 h-6 rounded-full border border-line/60"
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color: c }).run();
                    setPickerOpen(null);
                  }}
                />
              ))}
              <button
                className="w-6 h-6 rounded-full border border-line/60 flex items-center justify-center text-[10px] text-muted"
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setPickerOpen(null);
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-line mx-1" />

        <button className={btn(editor.isActive("heading", { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Title">
          H1
        </button>
        <button className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading">
          H2
        </button>
        <button className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bulleted list">
          •—
        </button>
        <button className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          1.
        </button>
        <button className={btn(editor.isActive("taskList"))} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Checklist">
          ☑
        </button>
        <button className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">
          "
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6" onClick={() => setPickerOpen(null)}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
