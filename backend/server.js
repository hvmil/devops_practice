const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool, Client } = require("pg");

// Load environment variables in dev
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

// --------------------
// Step 1: Ensure DB exists
// --------------------
const ensureDatabase = async () => {
  try {
    // Connect to default postgres database first
    const client = new Client({
      user: POSTGRES_USER,
      host: POSTGRES_HOST,
      database: "postgres",
      password: POSTGRES_PASSWORD,
      port: 5432,
    });
    await client.connect();

    // Create the database if it doesn't exist
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'`
    );
    if (res.rowCount === 0) {
      console.log(`Database ${POSTGRES_DB} not found, creating...`);
      await client.query(`CREATE DATABASE ${POSTGRES_DB}`);
      console.log(`Database ${POSTGRES_DB} created`);
    } else {
      console.log(`Database ${POSTGRES_DB} exists`);
    }

    await client.end();
  } catch (err) {
    console.error("Error ensuring database exists:", err);
    process.exit(1);
  }
};
// --------------------
// Step 2: Connect to the target DB
// --------------------
const pool = new Pool({
  user: POSTGRES_USER,
  host: POSTGRES_HOST,
  database: POSTGRES_DB,
  password: POSTGRES_PASSWORD,
  port: 5432,
});

// --------------------
// Step 3: Ensure table exists
// --------------------
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

// Initialize DB and table, then start server
const init = async () => {
  await ensureDatabase();
  await ensureItemsTable();

  app.listen(process.env.PORT || 8989, () =>
    console.log(`Backend running on port ${process.env.PORT || 8989}`)
  );
};

init();
// // PostgreSQL pool
// const pool = new Pool({
//   user: process.env.POSTGRES_USER,
//   host: process.env.POSTGRES_HOST,
//   database: process.env.POSTGRES_DB,
//   password: process.env.POSTGRES_PASSWORD,
//   port: 5432,
// });
// pool.connect((err, client, release) => {
//   if (err) {
//     console.error("Error connecting to database", err.stack);
//   } else {
//     console.log("Connected to database!");
//     release();
//   }
// });

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
