import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.NODE_ENV === 'production'
  ? '/data/bookshelf.db'
  : path.join(__dirname, 'bookshelf.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    cover_url TEXT,
    open_library_key TEXT,
    date_finished TEXT NOT NULL,
    rating INTEGER,
    review_text TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Migrate existing DBs that predate review_text
try {
  db.exec(`ALTER TABLE books ADD COLUMN review_text TEXT`);
} catch {
  // column already exists
}

export default db;
