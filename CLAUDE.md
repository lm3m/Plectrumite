# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies (root + server + client)
npm run install:all

# Development (Vite on :5173, Express on :3001 in parallel)
npm run dev

# Build (TypeScript server + Vue bundle)
npm run build

# Lint / auto-fix
npm run lint
npm run lint:fix

# Docker (production)
docker compose up -d --build
```

There are no test commands — this project has no test suite.

## Architecture

**Plectrumite** is a guitar practice schedule builder. It's a full-stack monorepo:

```
client/   Vue 3 + Vite frontend
server/   Express + SQLite backend
```

**Backend** (`server/src/`):
- Express on port 3001; routes under `routes/` for `documents`, `blocks`, and `uploads`
- SQLite via `better-sqlite3` with WAL mode; DB stored at `server/data/plectrumite.db`
- Migration runner (`db/migrate.ts`) runs on startup, tracks migrations in `_migrations` table
- Block `content` is stored as a JSON string in SQLite, parsed before returning in API responses
- Uploaded images land in `server/data/uploads/` with UUID filenames, served at `/uploads`
- In production, Express also serves the built Vue SPA from `client/dist/` with SPA fallback

**Frontend** (`client/src/`):
- Vue 3 Composition API + Pinia store (`stores/documents.ts`) holds all document/block state
- Typed API wrappers in `api/` call REST endpoints; Vite proxies `/api` and `/uploads` to `:3001`
- `composables/useAutoSave.ts` — debounced (1 s) save utility used by block editors
- `composables/useVexFlow.ts` — VexFlow 4 rendering for musical notation and combined tab blocks
- `composables/useFretboard.ts` — SVG geometry + click handling for interactive fretboard diagrams

## Block Types

There are six block types stored in the `block_type` column (SQLite CHECK constraint):

| Type | `block_type` value | Content fields |
|---|---|---|
| Guitar Tab | `guitar_tab` | `{ text, tempo? }` |
| Fretboard View | `fretboard_view` | `{ fretCount, startFret, markers, tuning?, label? }` |
| Musical Notation | `musical_notation` | `{ measures, clef, timeSignature, keySignature }` |
| Combined Tab+Notation | `combined_tab_notation` | `{ measures (with tabPositions), clef, timeSignature, keySignature }` |
| Markdown Text | `markdown_text` | `{ markdown }` |
| Image | `image` | `{ url, caption? }` |

Notation measures use VexFlow note format strings (e.g. `"C4/q, D4/q"`); tab positions use `"string:fret"` mapping.

## Header Menu & Modals

`AppHeader.vue` contains a hamburger menu (dropdown) and the Practice Tools modal. The dropdown closes on outside-click via a document listener registered in `onMounted`/`onUnmounted`. The modal is teleported to `<body>` with `<Teleport>` to avoid z-index/overflow issues from the sticky header. Tool components live in `components/tools/` and are imported into the modal body.

**`MetronomeWidget.vue`** (`components/tools/`) — 4/4 metronome using the Web Audio API lookahead scheduler pattern: a `setInterval` at 25ms pre-queues oscillator bursts on the `AudioContext` timeline 100ms ahead for sample-accurate timing. Beat 1 (index 0) plays at 1500 Hz; beats within `beatsPerChord` play at 1000 Hz (accented); remaining beats at 700 Hz. All 4 pips are always shown; the first `beatsPerChord` pips flash red (`accented` class) when active, the rest use the primary color. Visual pip sync uses `setTimeout` offsets derived from `AudioContext.currentTime`. BPM is persisted to `localStorage`. `AudioContext` is created lazily on first start and closed in `onUnmounted`. Accepts `beatsPerChord` as a prop (passed down from `AppHeader`).

**`ChordPracticeWidget.vue`** (`components/tools/`) — Displays two chord diagrams side-by-side with an arrow between them. Supports two modes toggled via radio buttons:
- **Open chords**: picks from 9 cowboy chords (A, Am, C, D, Dm, E, Em, F, G); each slot has a dropdown to override
- **Barre chords**: E-shape (root on string 6) or A-shape (root on string 5) barre chords; each slot has shape + root dropdowns; barre chord positions computed via `barreChordData(shape, root)` — `n = (rootIdx - openIdx + 12) % 12` gives the fret offset

Exposes `beatsPerChord` via `defineModel` (synced with `AppHeader`'s lifted state). Randomise picks 2 distinct open chords or random shape+root pairs.

**`ChordDiagram.vue`** (`components/tools/`) — Pure SVG chord box diagram component. Props: `label`, `tab` (array of `{string, fret}`), `showLabel?`, `startFret?` (default 1), `barreFret?`. Layout: 6 strings (string 6 = leftmost), 4 fret rows. When `startFret === 1` the top line is drawn as a thick nut; otherwise a thin fret line is drawn and a "Nfr" fret label appears at the right. Barre bar rendered as a rounded `<rect>` spanning the barre strings. Individual finger dots rendered as `<circle>` elements at `cy = fy(fret - startFret) + FS/2`. Diagram width expands by `FRET_LABEL_W = 30` when `startFret > 1`.

## Key Conventions

- TypeScript strict mode across both workspaces; shared types defined in `server/src/types/index.ts`
- ESLint 9 flat config in both `client/` and `server/` (run from respective directories)
- The Vite dev proxy means the frontend never needs to know the backend port; always use relative `/api` paths in `api/` client code
- Database schema changes require a new migration file in `server/src/db/migrations/` — do not modify existing migrations
