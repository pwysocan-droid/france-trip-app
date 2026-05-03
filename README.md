# Trips — App

Mobile-first interactive itinerary and map for the trip library. Built
with Next.js, Mapbox, and Tailwind. Designed to deploy on Vercel with
zero config.

The app is **multi-trip from the ground up**. The home page is a trip
picker; each trip lives in its own JSON file and gets its own URL.
Places live in a shared library and can be referenced by multiple trips.

## What's here

- **`app/`** — Next.js 14 App Router pages
  - **`page.tsx`** — trip picker (the home page)
  - **`trips/[slug]/page.tsx`** — a specific trip's map + itinerary
  - **`places/[id]/page.tsx`** — a place entry, shows all trips that reference it
- **`components/`** — `Map`, `Itinerary`, `PlaceCard`
- **`data/`**
  - **`places.json`** — the place library (auto-generated from your
    place-file markdown via the parser; seeded with 28 core places)
  - **`trips/_index.json`** — registers all trips for the picker
  - **`trips/<slug>.json`** — one file per trip (e.g. `france-june-2026.json`)
- **`scripts/parse-places.ts`** — converts your place-file markdown to
  JSON in seconds. Run it whenever you add or edit place files.
- **`types/`** — TypeScript interfaces for places, trips, trip index
- **`CLAUDE.md`** — project orientation for Claude Code (architecture,
  conventions, common tasks, gotchas). Read first if iterating with AI.
- **`.claude/`** — Claude Code permission settings (pre-approved safe
  commands, denied destructive ones)

## Quick start (5 minutes from zero to running locally)

### 1. Get a free Mapbox token

- Go to https://www.mapbox.com/ → sign up free
- Account → Tokens → copy your **Default public token**
- It starts with `pk.`

### 2. Clone or unzip this folder

```bash
cd france-trip-app
cp .env.local.example .env.local
# Edit .env.local and paste your Mapbox token
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you should see the map with all the trip
stops, and the itinerary on the right (or accessible via a button on
mobile).

## Deploying to Vercel (5 more minutes)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: France trip app"
# Create a new repo on GitHub (e.g. france-trip-2026), then:
git remote add origin https://github.com/YOUR_USERNAME/france-trip-2026.git
git branch -M main
git push -u origin main
```

### 2. Import on Vercel

- Go to https://vercel.com/ (free account, sign in with GitHub)
- "New Project" → import your `france-trip-2026` repo
- Add environment variable: `NEXT_PUBLIC_MAPBOX_TOKEN` = your token
- Click "Deploy"

You'll get a live URL like `france-trip-2026.vercel.app` to share.
Every push to `main` auto-deploys in ~30 seconds.

## Updating

The data lives in JSON files in `data/`. Edit, commit, push — Vercel
redeploys automatically.

### Add or change a stop on a specific day

Edit `data/trips/<slug>.json` (e.g. `france-june-2026.json`). Find the
day, modify the `stops` array.

```json
{
  "day": 6,
  ...
  "stops": [
    {
      "placeId": "fondation-vasarely",
      "type": "anchor",
      "time": "2:30 PM",
      "duration": 120,
      "notes": "Vasarely's hexagonal temple"
    }
  ]
}
```

`placeId` must match a place in `data/places.json`.

### Add a new place

Either edit `data/places.json` directly (one entry, copy the format),
OR if you have the place-file markdown locally:

```bash
npm run build-places
```

This regenerates `data/places.json` from all your `.md` files in the
batch directories (`../places-batch-01`, `../places-batch-02-cinephile`,
`../places-batch-03-spectrum`). Adjust the path in `package.json`'s
`build-places` script if your folders are elsewhere.

### Lock in a decision

Edit the trip's `openDecisions` and `bookingsToLock` arrays as choices
firm up. The app reflects them in the itinerary drawer.

### Add a new trip

Three steps, no app code changes needed:

1. Drop a new JSON file in `data/trips/<slug>.json`. Copy
   `france-june-2026.json` as a template and edit. The `slug` field
   becomes the URL (`/trips/<slug>`).

2. Register it in `data/trips/_index.json` — add an entry to the `trips`
   array. The picker reads from this file.

3. (Optional) Add region colors. If your trip covers a region the app
   doesn't know yet (Burgundy, Brittany, etc.), add a color for it in
   `REGION_COLORS` in `components/Map.tsx`. Until then, new regions
   render as gray, which is fine.

The placeholder `aquitaine-june-2026.json` is included as a worked
example. It's a real second trip's skeleton — open it to see the full
shape.

A place can appear in multiple trips. The place entry page
(`/places/[id]`) automatically lists every trip that references it.

## Design system

### Typography

Inter for body, JetBrains Mono for metadata (dates, durations, codes,
labels). Two weights only — 400 regular, 500 medium. No bold. Tracking
is tightened on display (-0.025em) and loosened on uppercase metadata
(+0.10em). Background is warm cream (`#F8F5EF`), text is warm near-black
(`#1A1A1A`). The palette intentionally avoids pure white and pure black.

### Regional palette

Colors are landscape-derived — each one is tied to what the region
actually looks like:

| Region | Color | Rationale |
|--------|-------|-----------|
| Riviera | `#B8553A` | Esterel limestone, Provençal roof tiles |
| Var inland | `#7C8049` | Maquis, Coteaux Varois vines |
| Côte Bleue (Cassis) | `#1B3FA0` | Calanque deep water (Klein blue) |
| Luberon | `#C8893A` | Roussillon ochre |
| Languedoc | `#3D6E5C` | Garrigue, Cévennes oxidized green |
| Languedoc Coast (Sète) | `#7896A6` | Étang de Thau, oyster shell |

Edit `REGION_COLORS` and `colorForPlace` in `components/Map.tsx` to
change. The mapping is by `subRegion` (e.g. `var`, `vaucluse`,
`alpes-maritimes`) not just `region`, for finer control.

### Status indicators

Locked / confirmed bookings show as `◆ LOCKED` in the Riviera red,
set in monospace uppercase. Edit the `formatBookingStatus` function
in `app/places/[id]/page.tsx` to change.

## Notes on what's deliberately simple

- **No backend.** Everything is static. Deploys are fast, costs are
  zero, and there's no database to manage.
- **No login.** The URL is private-by-obscurity — anyone with the link
  can see it. Don't put anything in `notes` you wouldn't want public.
- **Single shared state.** Everyone who opens the URL sees the same
  thing. If you want personalized favorites or notes per person, that's
  a v2 feature.

## What v2 might add

- Filter by tag (architecture / cinephile / shop / meal)
- Search across places by keyword
- Favorites synced to localStorage
- Photos per place (currently just placeholder)
- Walking and driving directions between consecutive stops
- Offline-capable (PWA)
- Print-friendly itinerary view
- Claude integration for "what should we do given the weather" /
  "what's a backup if Cap Moderne is fully booked"

## Common issues

**Map not loading?** Check that `NEXT_PUBLIC_MAPBOX_TOKEN` is set in
`.env.local` (locally) or in Vercel's environment variables (deployed).

**Place not appearing on map?** Check that the place has `coordinates`
in `places.json`. Format is `[longitude, latitude]` (note: longitude
first, this trips up everyone).

**Day showing the wrong stops?** Each stop in `trip.json` references a
place by `placeId`. If the ID doesn't match anything in `places.json`,
the stop's name shows the raw ID. Fix by matching the IDs.

## Repository structure

```
france-trip-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # main view (map + itinerary drawer)
│   ├── places/[id]/
│   │   └── page.tsx          # full-screen place entry page
│   └── globals.css           # ECAL design tokens
├── components/
│   ├── Map.tsx               # Mapbox GL component + region color logic
│   ├── Itinerary.tsx         # day-by-day sidebar/drawer
│   └── PlaceCard.tsx         # tap-a-pin overlay (links to /places/[id])
├── data/
│   ├── places.json           # all places (seed; regenerable)
│   └── trip.json             # the itinerary
├── scripts/
│   └── parse-places.ts       # markdown → JSON parser
├── types/
│   └── index.ts              # TypeScript interfaces
├── .env.local.example
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

*Built May 2026. Edit aggressively as the trip firms up.*
