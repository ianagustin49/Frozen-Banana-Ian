# Setup guide

The app works **out of the box, local-only** — your tasks and progress are
saved in your browser. Follow this guide only when you want your **phone and
laptop to sync**.

## 1. Create a free Supabase project

1. Go to <https://supabase.com> and sign up (free tier is plenty).
2. Click **New project**. Give it a name and a database password, pick a region
   near you, and wait ~1 minute for it to spin up.

## 2. Create the database table

1. In your project, open **SQL Editor** → **New query**.
2. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and
   click **Run**. This creates the `app_states` table, the security rules that
   keep your data private to you, and turns on realtime sync.

## 3. Turn on email sign-in

1. Open **Authentication → Providers** and make sure **Email** is enabled
   (it is by default). Magic links require no password.

## 4. Get your keys

1. Open **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.

## 5. Plug the keys in

**For local development**, create a `.env` file in the project root (copy from
`.env.example`):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**For the live GitHub Pages site**, add the same two values as repository
secrets: **Settings → Secrets and variables → Actions → New repository secret**,
named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The deploy workflow
reads them at build time. Re-run the deploy (push any commit, or run the
workflow manually) so the live site picks them up.

> The anon key is **safe to expose** — the row-level security rules from step 2
> mean each signed-in person can only ever read and write their own data.

## 6. Sign in

Open the app, go to **Settings → Sync across devices**, enter your email, and
click **Send link**. Open the link from your email and you're synced. Do the
same on your other device with the same email, and they'll stay in sync.
