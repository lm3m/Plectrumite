import { Router } from 'express';
import { getDb } from '../db/connection.js';
import type { Document, Block, CreateDocumentRequest, UpdateDocumentRequest } from '../types/index.js';

const router = Router();

// GET /api/documents — list all documents
router.get('/', (_req, res) => {
  const db = getDb();
  const docs = db.prepare(
    'SELECT id, title, description, created_at, updated_at FROM documents ORDER BY updated_at DESC'
  ).all() as Document[];
  res.json(docs);
});

// POST /api/documents — create a document
router.post('/', (req, res) => {
  const db = getDb();
  const { title, description } = req.body as CreateDocumentRequest;
  const result = db.prepare(
    'INSERT INTO documents (title, description) VALUES (?, ?)'
  ).run(title || 'Untitled Practice', description || '');
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(result.lastInsertRowid) as Document;
  res.status(201).json(doc);
});

// GET /api/documents/:id — get document with blocks
router.get('/:id', (req, res) => {
  const db = getDb();
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id) as Document | undefined;
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }
  const blocks = db.prepare(
    'SELECT * FROM blocks WHERE document_id = ? ORDER BY position ASC'
  ).all(req.params.id) as Block[];
  const parsedBlocks = blocks.map(b => ({
    ...b,
    content: JSON.parse(b.content as string),
  }));
  res.json({ ...doc, blocks: parsedBlocks });
});

// PUT /api/documents/:id — update document
router.put('/:id', (req, res) => {
  const db = getDb();
  const { title, description } = req.body as UpdateDocumentRequest;
  const existing = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id) as Document | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }
  db.prepare(
    `UPDATE documents SET title = ?, description = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(
    title !== undefined ? title : existing.title,
    description !== undefined ? description : existing.description,
    req.params.id
  );
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id) as Document;
  res.json(doc);
});

// DELETE /api/documents/:id — delete document and all blocks
router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }
  db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export { router as documentRoutes };
