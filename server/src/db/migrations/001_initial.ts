import type Database from 'better-sqlite3';

export const name = '001_initial';

export function up(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL DEFAULT 'Untitled Practice',
      description TEXT    NOT NULL DEFAULT '',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blocks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL,
      block_type  TEXT    NOT NULL CHECK (block_type IN (
        'guitar_tab', 'fretboard_view', 'musical_notation',
        'combined_tab_notation', 'markdown_text'
      )),
      position    INTEGER NOT NULL DEFAULT 0,
      content     TEXT    NOT NULL DEFAULT '{}',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_blocks_document_id ON blocks(document_id);
    CREATE INDEX IF NOT EXISTS idx_blocks_position ON blocks(document_id, position);
  `);
}
