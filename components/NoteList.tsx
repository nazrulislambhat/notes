"use client";

const COLOR_MAP: Record<string, string> = {
  default: "#FFFFFF",
  yellow: "#FCEFC7",
  rose: "#F6E1E1",
  sky: "#E1EAF6",
  sage: "#E3ECE1",
  lilac: "#EAE1F0",
};

export type NoteRow = {
  id: string;
  title: string;
  content_text: string;
  color: string;
  pinned: boolean;
  updated_at: string;
  deleted_at: string | null;
};

export default function NoteList({
  notes,
  activeId,
  onSelect,
  search,
  onSearchChange,
}: {
  notes: NoteRow[];
  activeId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
}) {
  const filtered = notes.filter((n) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content_text.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col h-full border-r border-line w-full md:w-80">
      <div className="p-3 border-b border-line">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notes"
          className="w-full rounded-md bg-white border border-line px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-sm text-muted text-center mt-10 px-4">No notes here yet.</p>
        )}
        {filtered.map((n) => (
          <button
            key={n.id}
            onClick={() => onSelect(n.id)}
            className={`w-full text-left px-4 py-3 border-b border-line/70 transition ${
              activeId === n.id ? "bg-accentSoft" : "hover:bg-line/30"
            }`}
            style={{ backgroundColor: activeId === n.id ? undefined : COLOR_MAP[n.color] !== "#FFFFFF" ? COLOR_MAP[n.color] + "55" : undefined }}
          >
            <div className="flex items-center gap-1.5">
              {n.pinned && <span className="text-accent text-xs">📌</span>}
              <span className="font-medium text-sm truncate">{n.title || "New note"}</span>
            </div>
            <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.content_text || "No additional text"}</p>
            <p className="text-[11px] text-muted/70 mt-1">
              {new Date(n.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
