# Claude Code orientation

This file is read by Claude Code when it opens the project. It's the
project's mental model in one place. Read this before doing anything.

## What this app is

A multi-trip itinerary and map. Mobile-first, deployed on Vercel.
The home page is a trip picker; each trip lives in its own JSON file
and gets its own URL. Places live in a shared library and can be
referenced by multiple trips.

The app is a thin presentation layer over data files. **Most edits are
JSON edits.** Component code only changes when the design or
interactions change.

## Working with Claude

The owner has chosen to leverage Claude (via chat) as a primary planning collaborator on this project, not just a task executor. Significant time has been spent in conversation establishing the project's aesthetic, editorial voice, taste, and constraints. When Claude Code makes design or content decisions, it should defer to that accumulated voice rather than to defaults.

If a design or content decision is ambiguous, the right move is to ask the owner in chat rather than to guess. The owner explicitly prefers more iterations of dialogue over fewer iterations of misaligned work.

See `PHILOSOPHY.md` at the repo root for the project's voice, editorial taste, accumulated decisions, and capture-and-process workflow for new places. **Read it in full before any non-trivial task.** `CLAUDE.md` describes the codebase architecture; `PHILOSOPHY.md` describes what the project means.

## File layout

```
app/
  layout.tsx                       # Root layout, design tokens, fonts
  globals.css                      # ECAL design tokens (cream, ink, regional colors)
  page.tsx                         # / — trip picker (lists all trips)
  trips/[slug]/page.tsx            # /trips/<slug> — one trip's map + itinerary
  places/[id]/page.tsx             # /places/<id> — one place's full entry
components/
  Map.tsx                          # Mapbox component + REGION_COLORS + colorForPlace()
  Itinerary.tsx                    # Day-by-day drawer/sidebar
  PlaceCard.tsx                    # Tooltip overlay when a pin is tapped
data/
  places.json                      # The place library (shared across trips)
  trips/
    _index.json                    # Registers all trips for the picker
    france-june-2026.json          # The current locked trip
    aquitaine-june-2026.json       # Placeholder/example for second trip
scripts/
  parse-places.ts                  # Markdown → places.json regenerator
types/
  index.ts                         # TypeScript interfaces
```

## The data model

There are three JSON shapes. Knowing them is the whole job.

### `places.json` — the library

```json
{
  "places": [
    {
      "id": "hostellerie-abbaye-de-la-celle",
      "name": "Hostellerie de l'Abbaye de la Celle",
      "vibe": "The fulcrum of the trip. 12th-century abbey...",
      "category": "country-inn",
      "region": "provence",
      "subRegion": "var",
      "nearestTown": "La Celle",
      "address": "10 Place du Général de Gaulle, 83170 La Celle",
      "phone": "+33 4 98 05 14 14",
      "website": "https://www.abbaye-celle.com/",
      "coordinates": [6.040698, 43.393736],   // [lng, lat]
      "tags": ["hotel", "meal:dinner", "ducasse", "vibe:still-center"],
      "status": "confirmed-loved",
      "booking": "LOCKED — Lucrèce de Barras suite",
      "recommendations": [...],
      "narrative": "..."   // optional long-form markdown
    }
  ]
}
```

`id` is the canonical reference — used by trips to point at places.
`subRegion` drives the map color (see colorForPlace in Map.tsx).

### `trips/<slug>.json` — one trip

```json
{
  "tripId": "france-june-2026",
  "slug": "france-june-2026",       // must match filename
  "title": "France 2026 — Nice to Narbonne",
  "subtitle": "...",
  "summary": "...",                 // shown on picker card
  "regions": ["riviera", "var", ...], // for picker card region dots
  "status": "planning",             // planning | draft | locked | past
  "dates": { "start": "2026-06-09", "end": "2026-06-19" },
  "bases": [...],
  "days": [
    {
      "day": 3,
      "date": "2026-06-11",
      "weekday": "Thursday",
      "title": "Cap Moderne, then the still center",
      "summary": "...",
      "stops": [
        {
          "placeId": "hostellerie-abbaye-de-la-celle",  // must exist in places.json
          "type": "anchor",         // anchor | morning | afternoon | lunch | settle | optional
          "time": "5:00 PM",
          "duration": 60,
          "notes": "..."
        }
      ]
    }
  ],
  "openDecisions": [...],
  "bookingsToLock": [...]
}
```

### `trips/_index.json` — the picker manifest

```json
{
  "trips": [
    {
      "slug": "france-june-2026",
      "file": "france-june-2026.json",
      "title": "France 2026 — Nice to Narbonne",
      "summary": "...",
      "regions": ["riviera", "var", ...],
      "dates": { "start": "...", "end": "..." },
      "nights": 10,
      "bases": 6,
      "status": "planning"
    }
  ]
}
```

The picker reads from this file alone — it doesn't load every trip.
**If you add a trip file but forget the index entry, the picker won't
show it.** This is the most common mistake.

## Common tasks (in order of frequency)

### Edit a stop's details

`data/trips/<slug>.json` → find the day → find the stop in `stops[]`
→ edit. The `placeId` must reference an `id` in `places.json`.

### Add a new stop to a day

`data/trips/<slug>.json` → find the day → add object to `stops[]`.
If the place doesn't exist in `places.json` yet, add it there first
(or run `npm run build-places` to regenerate from markdown if your
place files have it).

### Lock a booking

`data/trips/<slug>.json` → `bookingsToLock` array → change the entry's
`status`. Or, more visually: edit the place's `booking` field in
`places.json` to start with `LOCKED` (e.g. `"LOCKED — Lucrèce de Barras
suite"`). The `formatBookingStatus()` function in `app/places/[id]/page.tsx`
detects this and shows the `◆ LOCKED` mark in the warm red.

### Add a new place

Either (a) edit `places.json` directly with a new entry following the
schema above, or (b) regenerate from markdown:

```bash
npm run build-places
```

The parser script reads from sibling directories (`../places-batch-01`
etc.) — adjust paths in the script if your place files are elsewhere.

### Add a new trip

Three steps, no app code:

1. Create `data/trips/<your-slug>.json`. Copy `france-june-2026.json`
   as the template, edit dates / days / stops. The `slug` field must
   match the filename (without .json).
2. Add a corresponding entry to `data/trips/_index.json`.
3. (Optional) If the trip covers a new geographic region, add a color
   for it in `REGION_COLORS` in `components/Map.tsx`. Until then, new
   regions render gray, which is fine.

The `aquitaine-june-2026.json` placeholder shows the full skeleton.

### Change regional colors

`components/Map.tsx` → `REGION_COLORS` object. Colors are
landscape-derived (Esterel limestone, Klein blue, Roussillon ochre,
etc.). Document the rationale if changing.

The mapping from a place to a color happens in `colorForPlace()` —
it checks `subRegion` first, then `region`. Edit there if you need
finer-grained control (e.g. Cassis = blue even though Bouches-du-Rhône
generally = olive).

## Conventions

### Typography

Inter for body, JetBrains Mono for metadata (dates, durations, codes,
labels). Two weights: 400 regular, 500 medium. Never bold. Tracking
tightened on display, loosened on uppercase metadata.

The `t-mono` and `t-display` classes in `globals.css` are the canonical
way to apply this. Don't add font-family declarations elsewhere.

### Color tokens

All colors come from CSS custom properties in `globals.css`:

- `--cream`, `--cream-soft`, `--cream-deep`, `--paper` — surfaces
- `--ink`, `--ink-mid`, `--ink-soft`, `--ink-faint` — text
- `--hair`, `--hair-mid`, `--hair-strong` — borders
- `--color-riviera`, `--color-var`, etc. — regional accents
- `--status-locked` — the warm red used for locked bookings

**Don't hardcode colors.** Use the token. If a color you need doesn't
exist, add it to `globals.css` rather than inlining.

### No emoji in the UI

Status indicators use typographic marks (`◆ LOCKED`, `◇ TO BOOK`, `●`,
`○`). Emoji breaks the ECAL register.

### No bold

Headings are weight 500, not 700. Body is 400. There's no third weight.
If something looks like it needs more emphasis, use uppercase + tracking
or color, not bold.

### Sentence case

Never Title Case in headings. "Open decisions" not "Open Decisions".

## Gotchas

### `placeId` references must resolve

If a trip references a `placeId` that doesn't exist in `places.json`,
the day card will show the raw ID (e.g. "hostellerie-abbaye-de-la-celle")
instead of the place name. Map pin won't render either. Always
double-check after adding stops.

### Coordinates are `[lng, lat]`, not `[lat, lng]`

Mapbox convention, opposite of what most people instinctively type.
If a pin appears in the wrong country, this is why.

### Tailwind classes vs inline styles

The codebase uses inline styles with CSS variables for design tokens
(`style={{ color: 'var(--ink-soft)' }}`) and Tailwind utility classes
for layout (`className="flex flex-wrap"`). Don't try to rewrite all
of one into the other — the mix is intentional.

### Mapbox token

Required at runtime. Set `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local`
locally and as a Vercel env var in production. Without it the map
renders empty (no error, just a blank gray rectangle).

### The dynamic trip import is a runtime-only pattern

`app/trips/[slug]/page.tsx` uses `await import(...)` to load the trip
JSON dynamically by slug. This works because Next.js bundles every
JSON file in `data/trips/` regardless of whether it's imported. If
you add a new trip file, no rebuild is needed for it to be reachable
— but you still need to add it to `_index.json` for the picker.

## Workflow

1. Edit JSON file (or component, if doing design work)
2. `npm run dev` to verify locally — server is at http://localhost:3000
3. `npm run build` if you want to catch type errors before pushing
4. `git add . && git commit -m "..." && git push`
5. Vercel auto-deploys in ~30 seconds

Most edits don't need step 3 — JSON changes can't break the build,
only the rendering. If a place doesn't show up after pushing, check
the browser console first; usually it's a missing `placeId`.

## What to do if something's wrong

- **Map is blank**: Mapbox token. Check `.env.local` and Vercel env vars.
- **Place not in itinerary**: `placeId` typo or place missing from `places.json`.
- **Trip not on picker**: not registered in `_index.json`.
- **Wrong color on a pin**: `subRegion` mismatch in places.json. Check `colorForPlace()` in Map.tsx.
- **Locked badge not showing**: `booking` field doesn't start with "LOCKED" (case sensitive).
- **Build fails**: usually a TypeScript error from a missing field. The error message points to the file.

## What this project deliberately doesn't have

- User accounts / auth
- A backend / database (everything is static JSON)
- Real-time collaboration
- Favorites / hearts (deferred until there's a real ask)
- Photos (slot exists in schema but no UI yet)
- Search across places (the place count is small enough to browse)
- Offline mode (Mapbox needs network)

These are deliberate omissions, not oversights. If asked to add one,
push back and ask whether it's actually needed before building.
