"use client";

const COLORS: { key: string; hex: string }[] = [
  { key: "default", hex: "#FFFFFF" },
  { key: "yellow", hex: "#FCEFC7" },
  { key: "rose", hex: "#F6E1E1" },
  { key: "sky", hex: "#E1EAF6" },
  { key: "sage", hex: "#E3ECE1" },
  { key: "lilac", hex: "#EAE1F0" },
];

export default function NoteToolbar({
  title,
  onTitleChange,
  color,
  onColorChange,
  pinned,
  onTogglePin,
  folders,
  folderId,
  onFolderChange,
  deleted,
  onDelete,
  onRestore,
  onPermanentDelete,
  onBack,
}: {
  title: string;
  onTitleChange: (v: string) => void;
  color: string;
  onColorChange: (c: string) => void;
  pinned: boolean;
  onTogglePin: () => void;
  folders: { id: string; name: string }[];
  folderId: string | null;
  onFolderChange: (id: string | null) => void;
  deleted: boolean;
  onDelete: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  onBack: () => void;
}) {
  return (
    <div className="border-b border-line px-4 py-2.5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button className="md:hidden text-sm text-accent" onClick={onBack}>
          ‹ Back
        </button>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Title"
          className="flex-1 font-display text-lg outline-none bg-transparent"
        />
        {!deleted && (
          <button onClick={onTogglePin} title="Pin" className={`text-sm ${pinned ? "text-accent" : "text-muted"}`}>
            📌
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.key}
              onClick={() => onColorChange(c.key)}
              className={`w-5 h-5 rounded-full border ${color === c.key ? "ring-2 ring-accent ring-offset-1" : "border-line"}`}
              style={{ backgroundColor: c.hex }}
              title={c.key}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!deleted && (
            <select
              value={folderId ?? ""}
              onChange={(e) => onFolderChange(e.target.value || null)}
              className="text-xs border border-line rounded-md px-1.5 py-1 bg-white outline-none"
            >
              <option value="">No folder</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          )}

          {!deleted ? (
            <button onClick={onDelete} className="text-xs text-muted hover:text-rose-600">
              Delete
            </button>
          ) : (
            <>
              <button onClick={onRestore} className="text-xs text-accent hover:opacity-80">
                Restore
              </button>
              <button onClick={onPermanentDelete} className="text-xs text-rose-600 hover:opacity-80">
                Delete forever
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
