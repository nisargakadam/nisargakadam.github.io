import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB file will live as backend/bookshelf.db
const dbPath = path.join(__dirname, "bookshelf.db");

sqlite3.verbose();
const db = new sqlite3.Database(dbPath);

// Create table on first run
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shelf TEXT NOT NULL,          -- "top" | "bottom"
      title TEXT NOT NULL,
      author TEXT,
      review TEXT,
      genre TEXT,
      rating INTEGER,               -- 1–5
      impact INTEGER,               -- 0–100
      why TEXT,
      color TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

export default db;
