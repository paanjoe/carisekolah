# carisekolah.my — KPM School Finder

Web app to search and analyse KPM (Ministry of Education Malaysia) schools using data from the KPM directory.

## Features

- **Find schools** — Search by name, code, state, PPD, type, and location.
- **Map** — View schools on a map; “Near me” option with radius (km).
- **Statistics** — Aggregate dashboard and list of “packed” schools (high pupil–teacher ratio).
- **Data** — Synced daily from Google Sheet to `data/schools.json` via GitHub Actions.

## Tech stack

- Next.js (App Router), TypeScript, Tailwind CSS, Shadcn-style UI (Radix), React Leaflet, Recharts.
- No backend: JSON data in repo, updated by cron (GitHub Actions).

## Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Run the dev server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000).

## Data sync

- **In CI:** The workflow `.github/workflows/sync-schools.yml` runs daily (02:00 UTC) and on `workflow_dispatch`. It fetches CSV from a Google Sheet and writes `data/schools.json`.
- **Locally:** Ensure the Google Sheet is exportable as CSV (anyone with the link can view). Run:
  ```bash
  npm run sync-schools
  ```

## Build

```bash
npm run build
npm start
```

For static export (e.g. GitHub Pages), add `output: 'export'` in `next.config.ts` and run `npm run build`.
