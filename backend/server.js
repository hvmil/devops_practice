const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");

// Load dev env if not production
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.dev" });
}

const app = express();
app.use(cors());
app.use(express.json());

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_HOST,
} = process.env;

const pool = new Pool({
  user: POSTGRES_USER,
  host: POSTGRES_HOST,
  database: POSTGRES_DB,
  password: POSTGRES_PASSWORD,
  port: 5432,
  ssl: { rejectUnauthorized: false }, // allows insecure connection, for testing only
});

// Ensure items table exists
const ensureItemsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);
    console.log("Items table is ready");
  } catch (err) {
    console.error("Error creating items table:", err);
    process.exit(1);
  }
};

// Initialize DB and start server
const init = async () => {
  await ensureItemsTable();
  const PORT = process.env.PORT || 8989;
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
};

init();

// Routes
app.get("/", (req, res) => res.send("Server is working!"));

app.get("/api/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/items", async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO items (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query(
      "UPDATE items SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Item not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM items WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted", item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
