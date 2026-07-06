"use client";

import { NoteRow } from "@/components/NoteList";

function initials(email: string) {
  const name = email.split("@")[0];
  return name.slice(0, 2).toUpperCase();
}

function greetingName(email: string) {
  const name = email.split("@")[0].split(/[._-]/)[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const COLOR_MAP: Record<string, string> = {
  default: "#FFFFFF",
  yellow: "#FCEFC7",
  rose: "#F6E1E1",
  sky: "#E1EAF6",
  sage: "#E3ECE1",
  lilac: "#EAE1F0",
};

export default function MobileHome({
  userEmail,
  notes,
  onNewNote,
  onNewChecklist,
  onOpenNote,
  onGoFolders,
  onGoSearch,
  onGoTrash,
  onGoPinned,
}: {
  userEmail: string;
  notes: NoteRow[];
  onNewNote: () => void;
  onNewChecklist: () => void;
  onOpenNote: (id: string) => void;
  onGoFolders: () => void;
  onGoSearch: () => void;
  onGoTrash: () => void;
  onGoPinned: () => void;
}) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: undefined,
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const recent = [...notes]
    .filter((n) => !n.deleted_at)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-32" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-accent text-white flex items-center justify-center font-semibold text-sm">
            {initials(userEmail)}
          </div>
          <span className="text-[15px] text-ink">
            Hi, <span className="font-semibold">{greetingName(userEmail)}</span> 👋
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onGoSearch}
            className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-ink"
            aria-label="Search"
          >
            🔍
          </button>
          <button
            onClick={onGoPinned}
            className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-ink"
            aria-label="Pinned notes"
          >
            📌
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-5 pt-3 pb-4">
        <h1 className="font-display text-[28px] leading-tight">My Notes</h1>
        <p className="text-muted text-sm mt-0.5">{today}</p>
      </div>

      {/* Gradient action cards */}
      <div className="px-5 grid grid-cols-2 gap-3">
        <button
          onClick={onNewNote}
          className="relative overflow-hidden rounded-2xl p-4 h-36 flex flex-col justify-between text-left text-white active:scale-[0.98] transition"
          style={{ background: "linear-gradient(135deg, #9C8CF6 0%, #6C4FE0 100%)" }}
        >
          <span className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center text-lg">+</span>
          <span className="text-[15px] leading-tight font-medium">
            Create<br />
            <span className="text-xl font-bold">New Note</span>
          </span>
        </button>
        <button
          onClick={onNewChecklist}
          className="relative overflow-hidden rounded-2xl p-4 h-36 flex flex-col justify-between text-left text-white active:scale-[0.98] transition"
          style={{ background: "linear-gradient(135deg, #F6C453 0%, #E39A2E 100%)" }}
        >
          <span className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center text-lg">+</span>
          <span className="text-[15px] leading-tight font-medium">
            Create<br />
            <span className="text-xl font-bold">Checklist</span>
          </span>
        </button>
      </div>

      {/* Quick actions */}
      <div className="px-5 mt-6">
        <h2 className="text-sm font-medium text-muted mb-3">Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Folders", icon: "🗂️", onClick: onGoFolders, bg: "#F3E1EE" },
            { label: "Pinned", icon: "📌", onClick: onGoPinned, bg: "#E1EAF6" },
            { label: "Search", icon: "🔍", onClick: onGoSearch, bg: "#E3ECE1" },
            { label: "Trash", icon: "🗑️", onClick: onGoTrash, bg: "#F6E1E1" },
          ].map((a) => (
            <button key={a.label} onClick={a.onClick} className="flex flex-col items-center gap-1.5">
              <span
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl"
                style={{ backgroundColor: a.bg }}
              >
                {a.icon}
              </span>
              <span className="text-xs text-ink">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent notes */}
      <div className="px-5 mt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted">Recent</h2>
          <button onClick={onGoFolders} className="text-xs text-accent font-medium">
            See all
          </button>
        </div>

        {recent.length === 0 && (
          <p className="text-sm text-muted text-center py-8">No notes yet — tap a card above to start.</p>
        )}

        <div className="space-y-2.5">
          {recent.map((n) => (
            <button
              key={n.id}
              onClick={() => onOpenNote(n.id)}
              className="w-full text-left rounded-xl border border-line/70 p-3.5 active:scale-[0.99] transition"
              style={{ backgroundColor: COLOR_MAP[n.color] !== "#FFFFFF" ? COLOR_MAP[n.color] : "#FFFFFF" }}
            >
              <div className="flex items-center gap-1.5">
                {n.pinned && <span className="text-accent text-xs">📌</span>}
                <span className="font-medium text-sm truncate">{n.title || "New note"}</span>
              </div>
              <p className="text-xs text-muted mt-0.5 line-clamp-1">{n.content_text || "No additional text"}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
