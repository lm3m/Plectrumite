export enum BlockType {
  GuitarTab = 'guitar_tab',
  FretboardView = 'fretboard_view',
  MusicalNotation = 'musical_notation',
  CombinedTabNotation = 'combined_tab_notation',
  MarkdownText = 'markdown_text',
  Image = 'image',
}

// --- Block content types ---

export interface GuitarTabContent {
  text: string;
  tempo?: number;
  practiceMinutes?: number;
}

export interface FretMarker {
  string: number;  // 1-6 (1 = high E, 6 = low E)
  fret: number;    // 0 = open, 1-24
  color?: string;
  label?: string;
}

export interface FretboardViewContent {
  fretCount: 12 | 24;
  startFret: number;
  markers: FretMarker[];
  tuning?: string[];
  label?: string;
  practiceMinutes?: number;
}

export interface NotationMeasure {
  notes: string; // VexFlow EasyScore format
}

export interface MusicalNotationContent {
  measures: NotationMeasure[];
  clef: 'treble' | 'bass';
  timeSignature: string;
  keySignature: string;
  practiceMinutes?: number;
}

export interface CombinedMeasure {
  notes: string;
  tabPositions: Array<Array<{ string: number; fret: number }>>;
}

export interface CombinedTabNotationContent {
  measures: CombinedMeasure[];
  clef: 'treble' | 'bass';
  timeSignature: string;
  keySignature: string;
  practiceMinutes?: number;
}

export interface MarkdownTextContent {
  markdown: string;
  practiceMinutes?: number;
}

export interface ImageContent {
  url: string;
  caption?: string;
  practiceMinutes?: number;
}

export type BlockContent =
  | GuitarTabContent
  | FretboardViewContent
  | MusicalNotationContent
  | CombinedTabNotationContent
  | MarkdownTextContent
  | ImageContent;

// --- Document & Block ---

export interface Document {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Block {
  id: number;
  document_id: number;
  block_type: BlockType;
  position: number;
  content: BlockContent;
  created_at: string;
  updated_at: string;
}

export interface DocumentWithBlocks extends Document {
  blocks: Block[];
}

// --- API request types ---

export interface CreateDocumentRequest {
  title?: string;
  description?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  description?: string;
}

export interface CreateBlockRequest {
  block_type: BlockType;
  position?: number;
  content: BlockContent;
}

export interface UpdateBlockRequest {
  content: BlockContent;
}

export interface ReorderBlocksRequest {
  block_ids: number[];
}

// --- Helpers ---

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  [BlockType.GuitarTab]: 'Guitar Tab',
  [BlockType.FretboardView]: 'Fretboard',
  [BlockType.MusicalNotation]: 'Notation',
  [BlockType.CombinedTabNotation]: 'Tab + Notation',
  [BlockType.MarkdownText]: 'Text',
  [BlockType.Image]: 'Image',
};

export function defaultContentForType(type: BlockType): BlockContent {
  switch (type) {
    case BlockType.GuitarTab:
      return {
        text: 'e|------|\nB|------|\nG|------|\nD|------|\nA|------|\nE|------|',
      };
    case BlockType.FretboardView:
      return { fretCount: 12, startFret: 0, markers: [] };
    case BlockType.MusicalNotation:
      return {
        measures: [{ notes: 'C4/q, D4/q, E4/q, F4/q' }],
        clef: 'treble',
        timeSignature: '4/4',
        keySignature: 'C',
      };
    case BlockType.CombinedTabNotation:
      return {
        measures: [{
          notes: 'C4/q, D4/q, E4/q, F4/q',
          tabPositions: [
            [{ string: 2, fret: 1 }],
            [{ string: 3, fret: 2 }],
            [{ string: 4, fret: 2 }],
            [{ string: 4, fret: 3 }],
          ],
        }],
        clef: 'treble',
        timeSignature: '4/4',
        keySignature: 'C',
      };
    case BlockType.MarkdownText:
      return { markdown: '' };
    case BlockType.Image:
      return { url: '', caption: '' };
  }
}
