import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// GET all books
app.get("/api/books", (req, res) => {
  db.all("SELECT * FROM books ORDER BY created_at ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// CREATE a book
app.post("/api/books", (req, res) => {
  const { shelf, title, author, review, genre, rating, impact, why, color } =
    req.body;

  if (!title || !shelf) {
    return res.status(400).json({ error: "Title and shelf are required." });
  }

  const stmt = `
    INSERT INTO books 
    (shelf, title, author, review, genre, rating, impact, why, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    stmt,
    [shelf, title, author, review, genre, rating, impact, why, color],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.get("SELECT * FROM books WHERE id = ?", [this.lastID], (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json(row);
      });
    }
  );
});

// UPDATE a book
app.put("/api/books/:id", (req, res) => {
  const { id } = req.params;
  const { shelf, title, author, review, genre, rating, impact, why, color } =
    req.body;

  const stmt = `
    UPDATE books
    SET shelf = ?, title = ?, author = ?, review = ?, genre = ?,
        rating = ?, impact = ?, why = ?, color = ?
    WHERE id = ?
  `;

  db.run(
    stmt,
    [shelf, title, author, review, genre, rating, impact, why, color, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ error: "Book not found." });

      db.get("SELECT * FROM books WHERE id = ?", [id], (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(row);
      });
    }
  );
});

// DELETE a book
app.delete("/api/books/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM books WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: "Book not found." });
    res.status(204).send();
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
