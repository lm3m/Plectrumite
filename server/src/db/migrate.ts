import { getDb } from './connection.js';
import * as migration001 from './migrations/001_initial.js';
import * as migration002 from './migrations/002_add_image_block_type.js';

interface Migration {
  name: string;
  up: (db: import('better-sqlite3').Database) => void;
}

const migrations: Migration[] = [migration001, migration002];

export function runMigrations(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name       TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const applied = new Set(
    (db.prepare('SELECT name FROM _migrations').all() as { name: string }[]).map(row => row.name)
  );

  const insert = db.prepare('INSERT INTO _migrations (name) VALUES (?)');

  for (const migration of migrations) {
    if (!applied.has(migration.name)) {
      console.log(`Running migration: ${migration.name}`);
      db.transaction(() => {
        migration.up(db);
        insert.run(migration.name);
      })();
      console.log(`Migration complete: ${migration.name}`);
    }
  }
}
