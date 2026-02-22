import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'bookshelf.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL DEFAULT 'default',
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    cover_url TEXT,
    open_library_key TEXT,
    date_finished TEXT NOT NULL,
    rating INTEGER,
    review_text TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_books_username ON books(username);
`);

// Migrate existing DBs without username column
try { db.exec(`ALTER TABLE books ADD COLUMN username TEXT NOT NULL DEFAULT 'default'`); } catch {}
try { db.exec(`CREATE INDEX IF NOT EXISTS idx_books_username ON books(username)`); } catch {}

export default db;
