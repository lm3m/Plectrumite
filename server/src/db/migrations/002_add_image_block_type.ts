import type Database from 'better-sqlite3';

export const name = '002_add_image_block_type';

export function up(db: Database.Database): void {
  // SQLite CHECK constraints can't be altered, so recreate the table
  db.exec(`
    CREATE TABLE blocks_new (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL,
      block_type  TEXT    NOT NULL CHECK (block_type IN (
        'guitar_tab', 'fretboard_view', 'musical_notation',
        'combined_tab_notation', 'markdown_text', 'image'
      )),
      position    INTEGER NOT NULL DEFAULT 0,
      content     TEXT    NOT NULL DEFAULT '{}',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );

    INSERT INTO blocks_new (id, document_id, block_type, position, content, created_at, updated_at)
    SELECT id, document_id, block_type, position, content, created_at, updated_at FROM blocks;

    DROP TABLE blocks;

    ALTER TABLE blocks_new RENAME TO blocks;

    CREATE INDEX idx_blocks_document_id ON blocks(document_id);
    CREATE INDEX idx_blocks_position ON blocks(document_id, position);
  `);
}
