import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const userId = req.auth.userId;
  try {
    const result = await db.execute({
      sql: `SELECT * FROM books WHERE username = ? ORDER BY created_at DESC`,
      args: [userId],
    });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM books WHERE id = ?`,
      args: [req.params.id],
    });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', async (req, res) => {
  const userId = req.auth.userId;
  const { title, author, cover_url, open_library_key, date_finished, rating, review_text } = req.body;

  if (!title || !author || !date_finished) {
    return res.status(400).json({ error: 'title, author, and date_finished are required' });
  }

  try {
    const result = await db.execute({
      sql: `INSERT INTO books (username, title, author, cover_url, open_library_key, date_finished, rating, review_text)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [userId, title, author, cover_url || null, open_library_key || null, date_finished, rating || null, review_text || null],
    });

    const book = await db.execute({
      sql: `SELECT * FROM books WHERE id = ?`,
      args: [result.lastInsertRowid],
    });

    res.status(201).json(book.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.execute({
      sql: `DELETE FROM books WHERE id = ?`,
      args: [req.params.id],
    });
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Book not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
