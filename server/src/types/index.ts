export enum BlockType {
  GuitarTab = 'guitar_tab',
  FretboardView = 'fretboard_view',
  MusicalNotation = 'musical_notation',
  CombinedTabNotation = 'combined_tab_notation',
  MarkdownText = 'markdown_text',
}

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
  content: string; // JSON string in DB, parsed on read
  created_at: string;
  updated_at: string;
}

export interface DocumentWithBlocks extends Document {
  blocks: Block[];
}

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
  content: Record<string, unknown>;
}

export interface UpdateBlockRequest {
  content: Record<string, unknown>;
}

export interface ReorderBlocksRequest {
  block_ids: number[];
}
