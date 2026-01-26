import { Router } from 'express';
import { getDb } from '../db/connection.js';
import type { Block, CreateBlockRequest, UpdateBlockRequest, ReorderBlocksRequest } from '../types/index.js';

const router = Router();

// POST /api/documents/:id/blocks — add block to document
router.post('/documents/:id/blocks', (req, res) => {
  const db = getDb();
  const docId = req.params.id;
  const doc = db.prepare('SELECT id FROM documents WHERE id = ?').get(docId);
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  const { block_type, position, content } = req.body as CreateBlockRequest;

  // If no position specified, append to end
  let pos = position;
  if (pos === undefined) {
    const maxPos = db.prepare(
      'SELECT MAX(position) as max_pos FROM blocks WHERE document_id = ?'
    ).get(docId) as { max_pos: number | null };
    pos = (maxPos.max_pos ?? -1) + 1;
  }

  const result = db.prepare(
    'INSERT INTO blocks (document_id, block_type, position, content) VALUES (?, ?, ?, ?)'
  ).run(docId, block_type, pos, JSON.stringify(content));

  const block = db.prepare('SELECT * FROM blocks WHERE id = ?').get(result.lastInsertRowid) as Block;
  res.status(201).json({ ...block, content: JSON.parse(block.content as string) });
});

// PUT /api/blocks/:id — update block content
router.put('/blocks/:id', (req, res) => {
  const db = getDb();
  const block = db.prepare('SELECT * FROM blocks WHERE id = ?').get(req.params.id) as Block | undefined;
  if (!block) {
    res.status(404).json({ error: 'Block not found' });
    return;
  }

  const { content } = req.body as UpdateBlockRequest;
  db.prepare(
    `UPDATE blocks SET content = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(JSON.stringify(content), req.params.id);

  // Also update the parent document's updated_at
  db.prepare(
    `UPDATE documents SET updated_at = datetime('now') WHERE id = ?`
  ).run(block.document_id);

  const updated = db.prepare('SELECT * FROM blocks WHERE id = ?').get(req.params.id) as Block;
  res.json({ ...updated, content: JSON.parse(updated.content as string) });
});

// DELETE /api/blocks/:id — delete block
router.delete('/blocks/:id', (req, res) => {
  const db = getDb();
  const block = db.prepare('SELECT * FROM blocks WHERE id = ?').get(req.params.id) as Block | undefined;
  if (!block) {
    res.status(404).json({ error: 'Block not found' });
    return;
  }
  db.prepare('DELETE FROM blocks WHERE id = ?').run(req.params.id);

  // Update parent document
  db.prepare(
    `UPDATE documents SET updated_at = datetime('now') WHERE id = ?`
  ).run(block.document_id);

  res.json({ success: true });
});

// PUT /api/documents/:id/blocks/reorder — reorder blocks
router.put('/documents/:id/blocks/reorder', (req, res) => {
  const db = getDb();
  const docId = req.params.id;
  const doc = db.prepare('SELECT id FROM documents WHERE id = ?').get(docId);
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  const { block_ids } = req.body as ReorderBlocksRequest;

  const updatePosition = db.prepare(
    `UPDATE blocks SET position = ?, updated_at = datetime('now') WHERE id = ? AND document_id = ?`
  );

  db.transaction(() => {
    for (let i = 0; i < block_ids.length; i++) {
      updatePosition.run(i, block_ids[i], docId);
    }
    db.prepare(
      `UPDATE documents SET updated_at = datetime('now') WHERE id = ?`
    ).run(docId);
  })();

  const blocks = db.prepare(
    'SELECT * FROM blocks WHERE document_id = ? ORDER BY position ASC'
  ).all(docId) as Block[];
  const parsed = blocks.map(b => ({ ...b, content: JSON.parse(b.content as string) }));
  res.json(parsed);
});

export { router as blockRoutes };
