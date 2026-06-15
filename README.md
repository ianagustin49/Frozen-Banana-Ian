# 🍌 Frozen Banana — Gamified Daily Tracker

A clean, minimal, gamified personal tracker built for Ian to stay disciplined
across everything he's juggling: the **frozen banana business**, **drum
lessons**, **website building**, **workouts**, and **studies**.

Check tasks off, edit them inline, jot notes between them, watch a calendar fill
in, and earn XP, levels, streaks, and badges for showing up every day.

## Features

- **Today view** — your daily tasks grouped by life area, with a level + XP bar
  and a "done today" ring.
- **Daily habits & one-off to-dos** — repeat every day, on certain weekdays, or
  schedule a one-time task with a due date.
- **Check / edit / note** — tap to complete, double-click to rename, and attach
  notes to any task.
- **Calendar** — a month grid where each day shows colored dots for the areas
  you made progress in; tap a day to check things off.
- **Gamification** — XP per task (harder = more), a streak multiplier, global
  and per-area levels, streaks, and themed badges ("First Sale", "Ship It",
  "No Cramming", and more).
- **Stats** — XP over the last 30 days, streaks by area, and your badge case.
- **Works offline** — everything is saved in your browser; optional sign-in
  syncs your phone and laptop.

## Run it locally

```bash
npm install
npm run dev      # open the printed localhost URL
npm run build    # production build into dist/
```

## Cross-device sync (optional)

The app works fully **local-only** with no setup. To sync your phone and
laptop, set up a free Supabase project — see **[SETUP.md](./SETUP.md)**.

## Deployment

Pushing to `main` auto-deploys to GitHub Pages via
`.github/workflows/deploy.yml`. In the repo: **Settings → Pages → Source =
"GitHub Actions"**. The site then lives at
`https://<your-username>.github.io/Frozen-Banana-Ian/`.

## Tech

React + TypeScript + Vite · Tailwind CSS · Zustand (local-first persistence) ·
React Router · date-fns · Framer Motion · Recharts · Supabase (optional sync).
