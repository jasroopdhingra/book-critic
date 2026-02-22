import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

await db.execute(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    cover_url TEXT,
    open_library_key TEXT,
    date_finished TEXT NOT NULL,
    rating INTEGER,
    review_text TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

await db.execute(`
  CREATE INDEX IF NOT EXISTS idx_books_username ON books(username)
`);

export default db;
