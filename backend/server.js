import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "nur",
  database: "web_dev",
});

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users ORDER BY id",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, password],
    );
    res.json({ message: "User registered", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      res.status(400).json({ message: "Email already exists" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});

app.post("/login", async (req, res) => {
  const { name, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE name = $1 AND password = $2",
      [name, password],
    );
    if (result.rows.length > 0) {
      res.json({ message: "Login successful" });
    } else {
      res.status(400).json({ message: "Invalid name or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email",
      [name, id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Username updated", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
