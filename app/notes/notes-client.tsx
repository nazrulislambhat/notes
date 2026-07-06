"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/Sidebar";
import NoteList, { NoteRow } from "@/components/NoteList";
import NoteToolbar from "@/components/NoteToolbar";
import RichEditor from "@/components/RichEditor";

type Note = NoteRow & { content: any; folder_id: string | null; user_id: string; note_tags?: { tag_id: string }[] };
type Folder = { id: string; name: string };
type Tag = { id: string; name: string };
type Filter = { type: "all" | "folder" | "tag" | "trash"; id?: string };

export default function NotesClient({
  initialNotes,
  initialFolders,
  initialTags,
  userEmail,
}: {
  initialNotes: Note[];
  initialFolders: Folder[];
  initialTags: Tag[];
  userEmail: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [tags] = useState<Tag[]>(initialTags);
  const [filter, setFilter] = useState<Filter>({ type: "all" });
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEditorOnMobile, setShowEditorOnMobile] = useState(false);

  // --- Realtime: keep every device in sync ---------------------------------
  useEffect(() => {
    const channel = supabase
      .channel("notes-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, (payload) => {
        setNotes((prev) => {
          if (payload.eventType === "INSERT") {
            if (prev.some((n) => n.id === (payload.new as Note).id)) return prev;
            return [payload.new as Note, ...prev];
          }
          if (payload.eventType === "UPDATE") {
            return prev.map((n) => (n.id === (payload.new as Note).id ? { ...n, ...(payload.new as Note) } : n));
          }
          if (payload.eventType === "DELETE") {
            return prev.filter((n) => n.id !== (payload.old as any).id);
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeNote = useMemo(() => notes.find((n) => n.id === activeId) ?? null, [notes, activeId]);

  const visibleNotes = useMemo(() => {
    let list = notes;
    if (filter.type === "trash") {
      list = list.filter((n) => n.deleted_at);
    } else {
      list = list.filter((n) => !n.deleted_at);
      if (filter.type === "folder") list = list.filter((n) => n.folder_id === filter.id);
      if (filter.type === "tag") list = list.filter((n) => n.note_tags?.some((t) => t.tag_id === filter.id));
    }
    return [...list].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [notes, filter]);

  // --- Persist helpers -------------------------------------------------------
  const patchLocal = useCallback((id: string, patch: Partial<Note>) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }, []);

  const persist = useDebouncedCallback(async (id: string, patch: Partial<Note>) => {
    await supabase.from("notes").update(patch).eq("id", id);
  }, 600);

  function updateNote(id: string, patch: Partial<Note>, debounce = true) {
    patchLocal(id, patch);
    if (debounce) {
      persist(id, patch);
    } else {
      persist.cancel();
      supabase.from("notes").update(patch).eq("id", id);
    }
  }

  async function createNote() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const folder_id = filter.type === "folder" ? filter.id! : null;
    const { data, error } = await supabase
      .from("notes")
      .insert({ user_id: user.id, title: "", content: {}, content_text: "", folder_id })
      .select()
      .single();
    if (!error && data) {
      setNotes((prev) => [data as Note, ...prev]);
      setActiveId(data.id);
      setShowEditorOnMobile(true);
    }
  }

  async function createFolder(name: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("folders").insert({ user_id: user.id, name }).select().single();
    if (!error && data) setFolders((prev) => [...prev, data as Folder]);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function selectNote(id: string) {
    setActiveId(id);
    setShowEditorOnMobile(true);
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar
        folders={folders}
        tags={tags}
        activeFilter={filter}
        onSelectFilter={(f) => {
          setFilter(f);
          setSidebarOpen(false);
        }}
        onCreateFolder={createFolder}
        onNewNote={createNote}
        onSignOut={signOut}
        userEmail={userEmail}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className={`${showEditorOnMobile ? "hidden md:flex" : "flex"} md:flex flex-col w-full md:w-auto`}>
          <div className="flex items-center gap-2 p-3 border-b border-line md:hidden">
            <button onClick={() => setSidebarOpen(true)} className="text-sm">☰</button>
            <span className="font-display text-lg">Notes</span>
          </div>
          <NoteList
            notes={visibleNotes}
            activeId={activeId}
            onSelect={selectNote}
            search={search}
            onSearchChange={setSearch}
          />
        </div>

        <div className={`${showEditorOnMobile ? "flex" : "hidden md:flex"} flex-col flex-1 bg-white`}>
          {activeNote ? (
            <>
              <NoteToolbar
                title={activeNote.title}
                onTitleChange={(v) => updateNote(activeNote.id, { title: v })}
                color={activeNote.color}
                onColorChange={(c) => updateNote(activeNote.id, { color: c }, false)}
                pinned={activeNote.pinned}
                onTogglePin={() => updateNote(activeNote.id, { pinned: !activeNote.pinned }, false)}
                folders={folders}
                folderId={activeNote.folder_id}
                onFolderChange={(id) => updateNote(activeNote.id, { folder_id: id }, false)}
                deleted={!!activeNote.deleted_at}
                onDelete={() => updateNote(activeNote.id, { deleted_at: new Date().toISOString() }, false)}
                onRestore={() => updateNote(activeNote.id, { deleted_at: null }, false)}
                onPermanentDelete={async () => {
                  await supabase.from("notes").delete().eq("id", activeNote.id);
                  setNotes((prev) => prev.filter((n) => n.id !== activeNote.id));
                  setActiveId(null);
                  setShowEditorOnMobile(false);
                }}
                onBack={() => setShowEditorOnMobile(false)}
              />
              <RichEditor
                content={activeNote.content}
                onChange={(json, text) => updateNote(activeNote.id, { content: json, content_text: text })}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted text-sm">
              Select a note, or create a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
