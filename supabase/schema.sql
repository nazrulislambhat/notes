-- Run this in the Supabase SQL editor (or via `supabase db push`)

create extension if not exists "pgcrypto";

-- FOLDERS ------------------------------------------------------------
create table if not exists folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- TAGS ----------------------------------------------------------------
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- NOTES ----------------------------------------------------------------
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  folder_id uuid references folders(id) on delete set null,
  title text not null default '',
  content jsonb not null default '{}'::jsonb,   -- Tiptap JSON document
  content_text text not null default '',        -- plain-text mirror, for search
  color text not null default 'default',         -- default | yellow | rose | sky | sage | lilac
  pinned boolean not null default false,
  deleted_at timestamptz,                        -- soft delete -> Trash
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_user_id_idx on notes (user_id);
create index if not exists notes_folder_id_idx on notes (folder_id);
create index if not exists notes_search_idx on notes using gin (to_tsvector('english', content_text || ' ' || title));

-- NOTE <-> TAGS ----------------------------------------------------------
create table if not exists note_tags (
  note_id uuid not null references notes(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (note_id, tag_id)
);

-- ATTACHMENTS (metadata; files live in Supabase Storage bucket "attachments") --
create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- updated_at trigger -------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists notes_set_updated_at on notes;
create trigger notes_set_updated_at
  before update on notes
  for each row execute function set_updated_at();

-- ROW LEVEL SECURITY --------------------------------------------------
alter table folders enable row level security;
alter table tags enable row level security;
alter table notes enable row level security;
alter table note_tags enable row level security;
alter table attachments enable row level security;

create policy "own folders" on folders for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own tags" on tags for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own notes" on notes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own note_tags" on note_tags for all
  using (exists (select 1 from notes n where n.id = note_id and n.user_id = auth.uid()))
  with check (exists (select 1 from notes n where n.id = note_id and n.user_id = auth.uid()));

create policy "own attachments" on attachments for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- REALTIME --------------------------------------------------------------
alter publication supabase_realtime add table notes;
alter publication supabase_realtime add table folders;

-- STORAGE ---------------------------------------------------------------
-- Create the bucket from the dashboard (Storage -> New bucket -> "attachments", private),
-- then apply these policies:
insert into storage.buckets (id, name, public) values ('attachments', 'attachments', false)
  on conflict (id) do nothing;

create policy "read own attachments" on storage.objects for select
  using (bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "upload own attachments" on storage.objects for insert
  with check (bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "delete own attachments" on storage.objects for delete
  using (bucket_id = 'attachments' and auth.uid()::text = (storage.foldername(name))[1]);
