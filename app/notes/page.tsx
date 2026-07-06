import { createClient } from "@/lib/supabase/server";
import NotesClient from "./notes-client";

export default async function NotesPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: notes }, { data: folders }, { data: tags }] = await Promise.all([
    supabase
      .from("notes")
      .select("*, note_tags(tag_id)")
      .is("deleted_at", null)
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false }),
    supabase.from("folders").select("*").order("name"),
    supabase.from("tags").select("*").order("name"),
  ]);

  return (
    <NotesClient
      initialNotes={notes ?? []}
      initialFolders={folders ?? []}
      initialTags={tags ?? []}
      userEmail={user?.email ?? ""}
    />
  );
}
