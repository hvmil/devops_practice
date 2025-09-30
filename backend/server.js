const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
console.log(process.env.DB_USER, process.env.DB_NAME, process.env.DB_PASSWORD);


// PostgreSQL pool
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'db',  // <-- IMPORTANT
  database: process.env.POSTGRES_DB || 'mydb',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: 5432,
});
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to database", err.stack);
  } else {
    console.log("Connected to database!");
    release();
  }
});

// Routes
app.get("/", (req, res) => {
  res.send("Server is working!");
});

app.get("/api/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/items", (req, res) => {
  console.log("Received body:", req.body);
  const { name } = req.body;
  pool.query(
    "INSERT INTO items (name) VALUES ($1) RETURNING *",
    [name],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
      }
      res.json(result.rows[0]);
    }
  );
});

app.delete("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM items WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ message: "Item deleted", item: result.rows[0] });
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


const PORT = process.env.PORT || 8989;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
