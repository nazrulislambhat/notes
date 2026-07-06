"use client";

import { useState } from "react";

type Folder = { id: string; name: string };
type Tag = { id: string; name: string };

export default function Sidebar({
  folders,
  tags,
  activeFilter,
  onSelectFilter,
  onCreateFolder,
  onNewNote,
  onSignOut,
  userEmail,
  open,
  onClose,
}: {
  folders: Folder[];
  tags: Tag[];
  activeFilter: { type: "all" | "folder" | "tag" | "trash"; id?: string };
  onSelectFilter: (f: { type: "all" | "folder" | "tag" | "trash"; id?: string }) => void;
  onCreateFolder: (name: string) => void;
  onNewNote: () => void;
  onSignOut: () => void;
  userEmail: string;
  open: boolean;
  onClose: () => void;
}) {
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  const itemClass = (active: boolean) =>
    `w-full text-left px-3 py-1.5 rounded-md text-sm transition ${
      active ? "bg-accentSoft text-accent font-medium" : "hover:bg-line/50 text-ink"
    }`;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-paper border-r border-line flex flex-col transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-4 pt-5 pb-3">
          <h1 className="font-display text-xl">Notes</h1>
        </div>

        <button
          onClick={onNewNote}
          className="mx-3 mb-3 rounded-lg bg-accent text-white text-sm font-medium py-2 hover:opacity-90 transition"
        >
          + New note
        </button>

        <nav className="flex-1 overflow-y-auto px-3 space-y-4">
          <div className="space-y-0.5">
            <button className={itemClass(activeFilter.type === "all")} onClick={() => onSelectFilter({ type: "all" })}>
              All notes
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-xs font-medium text-muted uppercase tracking-wide">Folders</span>
              <button className="text-muted hover:text-ink text-sm" onClick={() => setNewFolderOpen(!newFolderOpen)}>
                +
              </button>
            </div>
            {newFolderOpen && (
              <form
                className="px-3 mb-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (folderName.trim()) onCreateFolder(folderName.trim());
                  setFolderName("");
                  setNewFolderOpen(false);
                }}
              >
                <input
                  autoFocus
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="w-full text-sm rounded-md border border-line px-2 py-1 outline-none focus:ring-2 focus:ring-accent/30"
                />
              </form>
            )}
            <div className="space-y-0.5">
              {folders.map((f) => (
                <button
                  key={f.id}
                  className={itemClass(activeFilter.type === "folder" && activeFilter.id === f.id)}
                  onClick={() => onSelectFilter({ type: "folder", id: f.id })}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {tags.length > 0 && (
            <div>
              <div className="px-3 mb-1 text-xs font-medium text-muted uppercase tracking-wide">Tags</div>
              <div className="space-y-0.5">
                {tags.map((t) => (
                  <button
                    key={t.id}
                    className={itemClass(activeFilter.type === "tag" && activeFilter.id === t.id)}
                    onClick={() => onSelectFilter({ type: "tag", id: t.id })}
                  >
                    #{t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-0.5">
            <button className={itemClass(activeFilter.type === "trash")} onClick={() => onSelectFilter({ type: "trash" })}>
              Trash
            </button>
          </div>
        </nav>

        <div className="px-4 py-3 border-t border-line flex items-center justify-between">
          <span className="text-xs text-muted truncate">{userEmail}</span>
          <button onClick={onSignOut} className="text-xs text-muted hover:text-ink">
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
