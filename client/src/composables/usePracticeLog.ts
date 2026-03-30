import { ref } from 'vue';
import { BLOCK_TYPE_LABELS, type BlockType } from '../types';

const STORAGE_KEY = 'practice-log';
const MAX_ENTRIES = 500;

export interface PracticeLogEntry {
  id: string;
  timestamp: string;       // ISO string
  documentId: number;
  documentTitle: string;
  blockId: number;
  blockLabel: string;      // human-readable block type
  durationMinutes?: number;
}

function loadEntries(): PracticeLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PracticeLogEntry[]) : [];
  } catch {
    return [];
  }
}

// Module-level ref so all callers share the same reactive list
const entries = ref<PracticeLogEntry[]>(loadEntries());

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value));
}

export function usePracticeLog() {
  function addEntry(opts: {
    documentId: number;
    documentTitle: string;
    blockId: number;
    blockType: BlockType;
    durationMinutes?: number;
  }) {
    const entry: PracticeLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      documentId: opts.documentId,
      documentTitle: opts.documentTitle,
      blockId: opts.blockId,
      blockLabel: BLOCK_TYPE_LABELS[opts.blockType],
      durationMinutes: opts.durationMinutes,
    };
    entries.value = [entry, ...entries.value].slice(0, MAX_ENTRIES);
    persist();
  }

  function clearLog() {
    entries.value = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  return { entries, addEntry, clearLog };
}
