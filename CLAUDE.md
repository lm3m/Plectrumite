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
| Guitar Tab | `guitar_tab` | `{ text, tempo?, practiceMinutes? }` |
| Fretboard View | `fretboard_view` | `{ fretCount, startFret, markers, tuning?, label?, practiceMinutes? }` |
| Musical Notation | `musical_notation` | `{ measures, clef, timeSignature, keySignature, practiceMinutes? }` |
| Combined Tab+Notation | `combined_tab_notation` | `{ measures (with tabPositions), clef, timeSignature, keySignature, practiceMinutes? }` |
| Markdown Text | `markdown_text` | `{ markdown, practiceMinutes? }` |
| Image | `image` | `{ url, caption?, practiceMinutes? }` |

All content types share the optional `practiceMinutes?: number` field — stored in the existing JSON content column, no migration required.

Notation measures use VexFlow note format strings (e.g. `"C4/q, D4/q"`); tab positions use `"string:fret"` mapping.

## Header Menu & Modals

`AppHeader.vue` contains a hamburger menu (dropdown) with three items: theme toggle, Practice Tools, and Practice Log. Each opens a separate `<Teleport to="body">` modal. The dropdown closes on outside-click via a document listener in `onMounted`/`onUnmounted`. Tool and log components live in `components/tools/`.

**`MetronomeWidget.vue`** (`components/tools/`) — Web Audio API lookahead scheduler: `setInterval` at 25ms pre-queues oscillator bursts 100ms ahead for sample-accurate timing. Beat 1 (index 0) plays at 1500 Hz; beats within `beatsPerChord` play at 1000 Hz (accented); remaining beats at 700 Hz. Variable time signatures (2/4, 3/4, 4/4, 5/4, 6/8, 7/8) — selected via a button row; `beats = computed(() => parseInt(timeSig.split('/')[0]))` drives pip count and `nextBeatIndex % beats`. Switching time signature while running stops and restarts cleanly. BPM and time signature both persisted to `localStorage`. The first `beatsPerChord` pips flash red (`accented` class) when active; all pip slots always shown. Accepts `beatsPerChord` as a prop from `AppHeader`.

**`ChordPracticeWidget.vue`** (`components/tools/`) — Three modes toggled via radio buttons:
- **Open chords**: 2-slot layout; picks from 9 cowboy chords; each slot has a dropdown override
- **Barre chords**: 2-slot layout; E-shape (root on string 6) or A-shape (root on string 5); `barreChordData(shape, root)` — `n = (rootIdx - openIdx + 12) % 12`; minor uses `barreMinorChordData(root)` (Em-shape: string 3 at barre fret instead of barre+1)
- **Progressions**: selectable key (all 12 notes) + preset progression; renders all chords in a wrapping grid with chord name and bar number above each diagram

Progression presets: I–IV–V, I–IV–V–I, I–V–vi–IV, I–vi–IV–V, ii–V–I, i–VII–VI–VII, 12-Bar Blues. Each `ProgressionChord` stores `{ interval, quality: 'M'|'m' }` — chord root = `NOTES[(keyIdx + interval) % 12]`. Major chords use E-shape barre; minor chords use Em-shape barre. Exposes `beatsPerChord` via `defineModel` (synced with `AppHeader`'s lifted state).

**`ChordDiagram.vue`** (`components/tools/`) — Pure SVG chord box diagram component. Props: `label`, `tab` (array of `{string, fret}`), `showLabel?`, `startFret?` (default 1), `barreFret?`. Layout: 6 strings (string 6 = leftmost), 4 fret rows. When `startFret === 1` the top line is drawn as a thick nut; otherwise a thin fret line is drawn and a "Nfr" fret label appears at the right. Barre bar rendered as a rounded `<rect>` spanning the barre strings. Individual finger dots rendered as `<circle>` elements at `cy = fy(fret - startFret) + FS/2`. Diagram width expands by `FRET_LABEL_W = 30` when `startFret > 1`.

## Fretboard Scale Overlay

`useFretboard.ts` exports `NOTES`, `SCALES`, and `computeScaleOverlay(root, scaleKey, fretCount, tuning?)`. Scale keys: `pentatonicMinor`, `pentatonicMajor`, `blues`, `major`, `minor`, `dorian`, `mixolydian`. The function iterates all (string, fret) positions, checks if `(openNoteIdx + fret) % 12` falls in the scale's interval set relative to the root, and returns `ScaleNote[]` with `{string, fret, cx, cy, isRoot, noteName}`.

`FretboardSvg.vue` accepts `scaleOverlay?: ScaleNote[]` and renders overlay dots before user markers (so user markers appear on top). Root notes use orange (`.scale-root`); other scale tones use semi-transparent primary (`.scale-tone`); note names shown inside each dot (font-size 8).

`FretboardControls.vue` has a scale row with root note and scale type dropdowns; emits `set-scale(root, scaleKey)`. Scale state (`scaleRoot`, `scaleKey`) is local to `FretboardBlock.vue` — not persisted to block content.

## Practice Timers & Log

**Timer** — Every block content type has an optional `practiceMinutes?: number` field stored in the JSON content (no DB migration needed). `BlockWrapper.vue` renders a footer below each block with:
- A number input (1–99 min) — saved to block content on `@change`
- Start/pause (▶/⏸) and reset (↺) controls — shown only when `practiceMinutes` is set
- `MM:SS` countdown; primary color when running, green when done
- Timer auto-logs and transitions to "Done!" state at zero
- Timer state (`timerState: 'idle'|'running'|'paused'|'done'`, `timeLeft`) is local, not persisted; resets via `watch(targetSeconds)`; `clearInterval` in `onUnmounted`

**Complete button** — Always visible in the footer; manually logs a session for the block regardless of timer state. Shows "✓ Logged" for 2 seconds after clicking.

**Practice Log** — `composables/usePracticeLog.ts` holds a module-level `ref<PracticeLogEntry[]>` initialized from localStorage (shared across all callers). `addEntry()` prepends and caps at 500 entries; `clearLog()` wipes both ref and localStorage. `BlockWrapper` receives `documentId` and `documentTitle` props (threaded down from `DocumentView` → `BlockList` → `BlockWrapper`) to populate log entries. `AppHeader.vue` has a "Practice Log" dropdown item opening a modal that renders `PracticeLogModal.vue` — entries grouped by calendar date (Today / Yesterday / date string), showing time, document title, block type, and duration.

## Key Conventions

- TypeScript strict mode across both workspaces; shared types defined in `server/src/types/index.ts`
- ESLint 9 flat config in both `client/` and `server/` (run from respective directories)
- The Vite dev proxy means the frontend never needs to know the backend port; always use relative `/api` paths in `api/` client code
- Database schema changes require a new migration file in `server/src/db/migrations/` — do not modify existing migrations
