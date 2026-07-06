# Notes

An Apple Notes–style note app that works everywhere: web, iPhone, and Android — via a single installable web app (PWA), synced live through Supabase.

## Features

- Rich text: bold, italic, underline, strikethrough, headings, quotes
- Text color and highlight color (the thing Simplenote couldn't do)
- Checklists (nested)
- Folders and tags
- Note colors (like Apple Notes' note backgrounds)
- Pin notes
- Full-text search
- Trash / soft delete with restore
- Real-time sync across every open device — edit on your laptop, watch it update on your phone
- Installable on iPhone and Android home screen (PWA), works offline for reading

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. In the SQL editor, paste and run everything in `supabase/schema.sql`. This creates all tables, security policies (so users can only ever see their own notes), realtime, and the attachments storage bucket.
3. In **Project Settings → API**, copy your Project URL and anon public key.

## 1b. Turn on "Sign in with Google"

1. In Google Cloud Console: create (or reuse) a project → **APIs & Services → Credentials → Create Credentials → OAuth client ID** → type **Web application**.
2. Add this as an **Authorized redirect URI** (find the exact value in Supabase under Authentication → Providers → Google — it looks like `https://YOUR-PROJECT.supabase.co/auth/v1/callback`).
3. Copy the generated **Client ID** and **Client Secret**.
4. In Supabase: **Authentication → Providers → Google** → toggle it on → paste the Client ID and Secret → Save.
5. In Supabase: **Authentication → URL Configuration** → make sure your site URL (e.g. `http://localhost:3000` for local dev, and your Vercel URL once deployed) is listed under **Redirect URLs**, since the app also redirects back to `/auth/callback` on that domain.

That's it — the "Continue with Google" button on the login screen and the `/auth/callback` route are already wired up in the code.

## 2. Configure the app

```bash
cp .env.local.example .env.local
```

Fill in the two values from Supabase.

## 3. Run it

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, create an account, and start writing.

## 4. Deploy (so it's reachable from your phone)

The easiest path is [Vercel](https://vercel.com):

```bash
npm i -g vercel
vercel
```

Add the two env vars in the Vercel project settings, then deploy. You'll get a `https://your-app.vercel.app` URL that works from any device.

## 5. Install it on your phone

**iPhone:** open the URL in Safari → Share → **Add to Home Screen**.
**Android:** open the URL in Chrome → menu (⋮) → **Install app** (or "Add to Home screen").

Either way you get a real home-screen icon, full-screen app window, and it keeps syncing live via Supabase in the background — no App Store or Play Store submission needed.

## Notes on things you may want to add next

- **Image attachments**: the `attachments` table + storage bucket are already set up (see `supabase/schema.sql`). Wire an upload button in `RichEditor.tsx` that pushes to `supabase.storage.from('attachments')` and inserts an image node — I kept this out of v1 to keep the first build focused, happy to add it.
- **Sharing/collaboration**: would need a `note_shares` table + adjusted RLS policies — doable the same way Supabase docs describe for multi-user rows.
- **Version history**: Postgres can track this with a simple `note_versions` table + trigger, similar to how `updated_at` is handled now.

## Project structure

```
app/
  login/page.tsx        sign in / sign up
  notes/page.tsx         server-side initial data fetch
  notes/notes-client.tsx main app state, realtime subscription, autosave
components/
  Sidebar.tsx            folders, tags, trash
  NoteList.tsx           searchable note list
  NoteToolbar.tsx         title, color, pin, folder, delete
  RichEditor.tsx          Tiptap rich text editor
lib/supabase/           browser/server/middleware Supabase clients
supabase/schema.sql     full DB schema + RLS + storage policies
public/manifest.json    PWA manifest (installable on iOS/Android)
public/sw.js            minimal offline app-shell service worker
```
