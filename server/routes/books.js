import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const books = db.prepare(`
    SELECT * FROM books ORDER BY created_at DESC
  `).all();
  res.json(books);
});

router.get('/:id', (req, res) => {
  const book = db.prepare(`SELECT * FROM books WHERE id = ?`).get(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

router.post('/', (req, res) => {
  const { title, author, cover_url, open_library_key, date_finished, rating, review_text } = req.body;

  if (!title || !author || !date_finished) {
    return res.status(400).json({ error: 'title, author, and date_finished are required' });
  }

  const result = db.prepare(`
    INSERT INTO books (title, author, cover_url, open_library_key, date_finished, rating, review_text)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(title, author, cover_url || null, open_library_key || null, date_finished, rating || null, review_text || null);

  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(book);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Book not found' });
  res.json({ success: true });
});

export default router;
