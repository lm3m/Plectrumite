import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  TabStave,
  TabNote,
  StaveConnector,
  Barline,
} from 'vexflow';
import type { MusicalNotationContent, CombinedTabNotationContent, CombinedMeasure } from '../types';

const STAVE_WIDTH = 400;
const STAVE_X = 10;

function getStaveColor(): string {
  const isDark = !document.documentElement.classList.contains('light-mode');
  return isDark ? '#cccccc' : '#000000';
}

// Standard guitar tuning (string number -> MIDI note)
const GUITAR_TUNING = [
  64, // String 1 (high E) = E4
  59, // String 2 (B) = B3
  55, // String 3 (G) = G3
  50, // String 4 (D) = D3
  45, // String 5 (A) = A2
  40, // String 6 (low E) = E2
];

const NOTE_NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];

function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteName = NOTE_NAMES[midi % 12];
  return `${noteName}/${octave}`;
}

function tabPositionToNote(string: number, fret: number): string {
  // string is 1-indexed (1=high E, 6=low E)
  if (string < 1 || string > 6) return 'c/4';
  const midi = GUITAR_TUNING[string - 1] + fret;
  return midiToNoteName(midi);
}

function parseTimeSignature(timeSig: string): { numBeats: number; beatValue: number } {
  const parts = timeSig.split('/').map(Number);
  return {
    numBeats: parts[0] || 4,
    beatValue: parts[1] || 4,
  };
}

function parseDuration(dur: string): string {
  // Map common duration strings
  const map: Record<string, string> = {
    w: 'w', h: 'h', q: 'q', '8': '8', '16': '16', '32': '32',
  };
  return map[dur] || dur;
}

function parseNoteString(noteStr: string): { keys: string[]; duration: string } {
  // Format: "C4/q" or "C4 D4/q" (chord) or "C4/8"
  const parts = noteStr.trim().split('/');
  const keys = parts[0].trim().split(/\s+/).map(k => {
    // Convert "C4" format to "c/4" format that VexFlow expects
    const match = k.match(/^([A-Ga-g][#b]?)(\d+)$/);
    if (match) {
      const [, note, octave] = match;
      return `${note.toLowerCase()}/${octave}`;
    }
    return k;
  });
  const duration = parseDuration(parts[1]?.trim() || 'q');
  return { keys, duration };
}

export function renderNotation(
  container: HTMLDivElement,
  data: MusicalNotationContent
): void {
  container.innerHTML = '';

  if (!data.measures || data.measures.length === 0) return;

  const totalWidth = STAVE_X + data.measures.length * STAVE_WIDTH + 20;
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(totalWidth, 160);
  const context = renderer.getContext();
  
  // Set color for dark mode
  const color = getStaveColor();
  context.setFillStyle(color);
  context.setStrokeStyle(color);

  let x = STAVE_X;

  for (let i = 0; i < data.measures.length; i++) {
    const measure = data.measures[i];
    const stave = new Stave(x, 20, STAVE_WIDTH);

    if (i === 0) {
      stave.addClef(data.clef || 'treble');
      stave.addTimeSignature(data.timeSignature || '4/4');
      stave.addKeySignature(data.keySignature || 'C');
      stave.setBegBarType(Barline.type.REPEAT_BEGIN);
    }

    stave.setContext(context).draw();

    if (measure.notes && measure.notes.trim()) {
      try {
        const noteTokens = measure.notes.split(',').map(s => s.trim()).filter(Boolean);
        const staveNotes = noteTokens.map(token => {
          const { keys, duration } = parseNoteString(token);
          return new StaveNote({ keys: keys.map(k => `${k}`), duration });
        });

        const { numBeats, beatValue } = parseTimeSignature(data.timeSignature || '4/4');
        const voice = new Voice({ num_beats: numBeats, beat_value: beatValue }).setStrict(false);
        voice.addTickables(staveNotes);

        new Formatter().joinVoices([voice]).format([voice], STAVE_WIDTH - 50);
        voice.draw(context, stave);
      } catch (e) {
        console.warn('VexFlow notation render error:', e);
      }
    }

    x += STAVE_WIDTH;
  }
}

export function renderCombined(
  container: HTMLDivElement,
  data: CombinedTabNotationContent,
  staveWidth = STAVE_WIDTH,
  notationY = 20,
  tabY = 160,
  totalHeight = 320
): void {
  container.innerHTML = '';

  if (!data.measures || data.measures.length === 0) return;

  const totalWidth = STAVE_X + data.measures.length * staveWidth + 20;
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(totalWidth, totalHeight);
  const context = renderer.getContext();

  // Set color for dark mode
  const color = getStaveColor();
  context.setFillStyle(color);
  context.setStrokeStyle(color);

  let x = STAVE_X;

  for (let i = 0; i < data.measures.length; i++) {
    const measure = data.measures[i];

    // Notation stave
    const notationStave = new Stave(x, notationY, staveWidth);
    if (i === 0) {
      notationStave.addClef(data.clef || 'treble');
      notationStave.addTimeSignature(data.timeSignature || '4/4');
      notationStave.addKeySignature(data.keySignature || 'C');
      notationStave.setBegBarType(Barline.type.REPEAT_BEGIN);
    }
    notationStave.setContext(context).draw();

    // Tab stave
    const tabStave = new TabStave(x, tabY, staveWidth);
    if (i === 0) {
      tabStave.addClef('tab');
      tabStave.addTimeSignature(data.timeSignature || '4/4');
      tabStave.setBegBarType(Barline.type.REPEAT_BEGIN);
    }
    tabStave.setContext(context).draw();

    // Connector
    if (i === 0) {
      new StaveConnector(notationStave, tabStave)
        .setType('singleLeft')
        .setContext(context)
        .draw();
    }

    const hasNotes = measure.notes && measure.notes.trim();
    const hasTab = measure.tabPositions && measure.tabPositions.length > 0 && 
                   measure.tabPositions.some(pos => pos.length > 0);

    if (hasNotes || hasTab) {
      try {
        let staveNotes: StaveNote[] = [];
        let tabNotes: TabNote[] = [];

        // Case 1: Both notes and tabs provided
        if (hasNotes && hasTab) {
          const noteTokens = measure.notes.split(',').map(s => s.trim()).filter(Boolean);
          const color = getStaveColor();
          staveNotes = noteTokens.map(token => {
            const { keys, duration } = parseNoteString(token);
            return new StaveNote({ keys: keys.map(k => `${k}`), duration });
          });

          tabNotes = (measure.tabPositions || []).map((positions, idx) => {
            const duration = staveNotes[idx]?.getDuration() || 'q';
            const note = new TabNote({
              positions: positions.map(p => ({ str: p.string, fret: p.fret })),
              duration,
            });
            note.setStyle({ fillStyle: color, strokeStyle: color });
            return note;
          });
        }
        // Case 2: Only tabs provided - generate notes from tabs
        else if (hasTab) {
          const positions = measure.tabPositions || [];
          const color = getStaveColor();
          
          // Create notes from tab positions
          staveNotes = positions.map((pos) => {
            const keys = pos.map(p => tabPositionToNote(p.string, p.fret));
            return new StaveNote({ keys, duration: 'q' });
          });

          // Create tab notes
          tabNotes = positions.map((pos) => {
            const note = new TabNote({
              positions: pos.map(p => ({ str: p.string, fret: p.fret })),
              duration: 'q',
            });
            note.setStyle({ fillStyle: color, strokeStyle: color });
            return note;
          });
        }
        // Case 3: Only notes provided - generate tabs from notes
        else if (hasNotes) {
          const noteTokens = measure.notes.split(',').map(s => s.trim()).filter(Boolean);
          const color = getStaveColor();
          
          staveNotes = noteTokens.map(token => {
            const { keys, duration } = parseNoteString(token);
            return new StaveNote({ keys: keys.map(k => `${k}`), duration });
          });

          // Generate placeholder tabs matching each note
          tabNotes = staveNotes.map((note) => {
            const tabNote = new TabNote({
              positions: [{ str: 1, fret: 0 }],
              duration: note.getDuration(),
            });
            tabNote.setStyle({ fillStyle: color, strokeStyle: color });
            return tabNote;
          });
        }

        // Create voices and format
        if (staveNotes.length > 0 && tabNotes.length > 0) {
          const { numBeats, beatValue } = parseTimeSignature(data.timeSignature || '4/4');
          
          const notationVoice = new Voice({ num_beats: numBeats, beat_value: beatValue }).setStrict(false);
          notationVoice.addTickables(staveNotes);

          const tabVoice = new Voice({ num_beats: numBeats, beat_value: beatValue }).setStrict(false);
          tabVoice.addTickables(tabNotes);

          const formatter = new Formatter();
          formatter.joinVoices([notationVoice]);
          formatter.joinVoices([tabVoice]);
          formatter.format([notationVoice, tabVoice], staveWidth - 50);

          notationVoice.draw(context, notationStave);
          tabVoice.draw(context, tabStave);
        }
      } catch (e) {
        console.warn('VexFlow combined render error:', e);
      }
    }

    x += staveWidth;
  }
}

export function renderTab(
  container: HTMLDivElement,
  measures: CombinedMeasure[],
  timeSignature = '4/4',
  staveWidth = STAVE_WIDTH,
  staveY = 20,
  totalHeight = 120
): void {
  container.innerHTML = '';
  if (!measures.length) return;

  const totalWidth = STAVE_X + measures.length * staveWidth + 20;
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(totalWidth, totalHeight);
  const context = renderer.getContext();

  const color = getStaveColor();
  context.setFillStyle(color);
  context.setStrokeStyle(color);

  const { numBeats, beatValue } = parseTimeSignature(timeSignature);
  let x = STAVE_X;

  for (let i = 0; i < measures.length; i++) {
    const tabStave = new TabStave(x, staveY, staveWidth);
    if (i === 0) {
      tabStave.addClef('tab');
      tabStave.addTimeSignature(timeSignature);
    }
    tabStave.setContext(context).draw();

    const positions = measures[i].tabPositions;
    if (positions && positions.length > 0) {
      try {
        const tabNotes = positions.map(beat => {
          const note = new TabNote({
            positions: beat.map(p => ({ str: p.string, fret: p.fret })),
            duration: 'q',
          });
          note.setStyle({ fillStyle: color, strokeStyle: color });
          return note;
        });

        const voice = new Voice({ num_beats: numBeats, beat_value: beatValue }).setStrict(false);
        voice.addTickables(tabNotes);
        new Formatter().joinVoices([voice]).format([voice], staveWidth - 40);
        voice.draw(context, tabStave);
      } catch (e) {
        console.warn('VexFlow tab render error:', e);
      }
    }

    x += staveWidth;
  }
}
