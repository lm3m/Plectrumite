# Plectrumite

A guitar practice schedule builder. Create documents with blocks of guitar tabs, fretboard diagrams, musical notation, and freeform text to organize your practice sessions.

## Features

- **Document management** — Create, edit, and delete practice schedule documents
- **Block-based editor** — Each document contains an ordered list of content blocks that can be rearranged
- **Five block types:**
  - **Guitar Tab** — Monospace tablature editor with a standard 6-string template
  - **Fretboard View** — Interactive SVG fretboard (12 or 24 frets) where you click to place/remove note markers
  - **Musical Notation** — Standard notation rendered via VexFlow, with editable measures, clef, time signature, and key
  - **Combined Tab + Notation** — Stacked standard notation and tablature rendered together via VexFlow
  - **Markdown Text** — Freeform rich text with a live preview powered by `marked`
- **Auto-save** — Changes are persisted automatically after a short debounce
- **Single-user, no auth** — Designed as a local tool; no login required

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Vue 3 (Composition API), TypeScript, Vite |
| State    | Pinia                               |
| Notation | VexFlow 4                           |
| Markdown | marked + DOMPurify                  |
| Backend  | Express.js, TypeScript              |
| Database | SQLite via better-sqlite3           |
| Linting  | ESLint 9 + typescript-eslint + eslint-plugin-vue |
| Deploy   | Docker (multi-stage build)          |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm run install:all
```

This installs dependencies for the root, server, and client workspaces.

### Development

```bash
npm run dev
```

Starts both the Express server (port 3001) and the Vite dev server (port 5173) concurrently. Open [http://localhost:5173](http://localhost:5173) in your browser. The Vite dev server proxies `/api` requests to the backend.

### Build

```bash
npm run build
```

Compiles the server TypeScript to `server/dist/` and builds the Vue client to `client/dist/`.

### Lint

```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix what's possible
```

Runs ESLint across both client (Vue + TypeScript) and server (TypeScript).

### Docker

Build and run in production with Docker:

```bash
docker compose up -d
```

The app is available at [http://localhost:3000](http://localhost:3000). In production, Express serves the built Vue client as static files alongside the API. SQLite data is persisted via a Docker volume.

To rebuild after code changes:

```bash
docker compose up -d --build
```

## Project Structure

```
Plectrumite/
├── package.json                 # Root scripts (dev, build, lint, install:all)
├── tsconfig.base.json           # Shared TypeScript config
├── Dockerfile                   # Multi-stage production build
├── docker-compose.yml           # Production orchestration
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts             # Express entry point
│       ├── db/
│       │   ├── connection.ts    # SQLite singleton (WAL mode)
│       │   ├── migrate.ts       # Migration runner
│       │   └── migrations/
│       │       └── 001_initial.ts
│       ├── routes/
│       │   ├── documents.ts     # Document CRUD
│       │   └── blocks.ts        # Block CRUD + reorder
│       ├── types/
│       │   └── index.ts
│       └── middleware/
│           └── errorHandler.ts
└── client/
    ├── package.json
    ├── vite.config.ts           # Vue plugin + API proxy
    ├── eslint.config.js         # ESLint flat config (Vue + TS)
    ├── index.html
    └── src/
        ├── main.ts
        ├── App.vue
        ├── router/index.ts
        ├── stores/documents.ts  # Pinia store
        ├── api/                 # Fetch wrapper + endpoint functions
        ├── types/index.ts       # Block content types + helpers
        ├── composables/
        │   ├── useVexFlow.ts    # VexFlow rendering logic
        │   ├── useFretboard.ts  # SVG fretboard geometry + interaction
        │   └── useAutoSave.ts   # Debounced auto-save
        ├── views/
        │   ├── HomeView.vue
        │   └── DocumentView.vue
        ├── components/
        │   ├── layout/          # AppHeader, AppSidebar
        │   ├── document/        # DocumentHeader, BlockList, BlockWrapper, BlockToolbar
        │   ├── blocks/          # TabBlock, FretboardBlock, NotationBlock, CombinedBlock, MarkdownBlock
        │   └── fretboard/       # FretboardSvg, FretboardControls
        └── styles/              # CSS variables, global styles, block styles
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/documents` | List all documents |
| POST | `/api/documents` | Create a document |
| GET | `/api/documents/:id` | Get a document with its blocks |
| PUT | `/api/documents/:id` | Update document title/description |
| DELETE | `/api/documents/:id` | Delete a document and all its blocks |
| POST | `/api/documents/:id/blocks` | Add a block to a document |
| PUT | `/api/blocks/:id` | Update a block's content |
| DELETE | `/api/blocks/:id` | Delete a block |
| PUT | `/api/documents/:id/blocks/reorder` | Reorder blocks within a document |

## Block Content Formats

### Guitar Tab

Plain text tablature stored as-is and rendered in a monospace font.

### Fretboard View

Click positions on the SVG fretboard to toggle note markers. Toggle between 12-fret and 24-fret views. Markers store string number (1–6), fret number (0–24), and optional color/label.

### Musical Notation

Enter measures in VexFlow format — one measure per line. Example:

```
C4/q, D4/q, E4/q, F4/q
G4/h, A4/h
```

Durations: `w` (whole), `h` (half), `q` (quarter), `8` (eighth), `16` (sixteenth).

### Combined Tab + Notation

Same as notation with added tab positions. Format per line:

```
C4/q, D4/q, E4/q, F4/q | 2:1, 3:2, 4:2, 4:3
```

Where `string:fret` maps each note to a tab position.

### Markdown Text

Standard markdown rendered with live preview. Supports headings, lists, code blocks, bold, italic, and links.

## Data Storage

All data is stored in a SQLite database at `server/data/plectrumite.db` (created automatically on first run). This path is gitignored. Block content is stored as JSON text in the `blocks` table.
