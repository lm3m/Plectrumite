# TODO

Features identified as valuable but not yet implemented, grouped by effort.

## Quick wins

**Tap tempo**
Add a "Tap" button to the metronome. Each tap records the current timestamp; BPM is calculated from the average interval across the last N taps. Resets after a pause.

**Tuning per tab block**
Surface the `tuning` field (already present on `FretboardViewContent`) in the Guitar Tab block editor. Allows labelling alternate tunings (Drop D, Open G, DADGAD) alongside the tab text.

**Metronome subdivisions**
Add subdivision options (quarter, eighth, triplet, sixteenth) to `MetronomeWidget`. The scheduler already fires per beat; subdivisions would fire additional intermediate clicks at reduced gain between beat ticks.

**Swing feel**
Add a swing ratio slider to the metronome (0% = straight, 50% = swing). Implemented by shortening the first subdivision interval and lengthening the second within each beat pair.

---

## Medium effort

~~**Timed practice segments**~~ ✓ Done

~~**Practice session log**~~ ✓ Done

**Goal BPM tracking**
Add `currentBpm` and `goalBpm` fields to the Guitar Tab and notation block content types. Display them as editable fields in the block editor so players can track speed progress over time.

**Practice session log**
Add a "Mark as practiced today" action per document. Store a log of practice dates (array of ISO date strings) in the document record. Show a streak count and last-practiced date in the document list and header.

---

## Larger features

**Notation / tab playback**
MIDI-like audio playback of VexFlow notation blocks using Tone.js or the Web Audio API. Parse the existing VexFlow EasyScore note strings to schedule oscillator or sampler events. This is the single biggest gap vs. desktop tab editors.

**PDF / print export**
Render the full document (tab blocks, fretboard SVGs, notation canvases, markdown) to a printable layout. Likely implemented via a dedicated print stylesheet (`@media print`) combined with a "Print" button that opens a clean window containing only block content.

---

## Organisation & discoverability

**Document tags**
Add a freeform `tags` field (array of strings) to documents. Show a tag filter in the sidebar/home view. Requires a new DB migration and API support.

**Difficulty rating**
Add a `difficulty` field (`beginner` | `intermediate` | `advanced`) to documents. Display as a badge in the document list and allow filtering.

**Spaced repetition queue**
Allow flagging a document for scheduled review. Store a next-review date computed using a simple interval schedule (1 day → 3 days → 1 week → 2 weeks). Show due documents highlighted in the home view.
