import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const db = getDb();
    const users = db
      .prepare("SELECT id, email, name, isAdmin, createdAt, updatedAt FROM users ORDER BY createdAt DESC")
      .all();
    res.json(users.map((u) => ({ ...u, isAdmin: u.isAdmin === 1 })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { email, name, password, isAdmin } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (existingUser) {
      return res.status(409).json({ error: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const now = new Date().toISOString();
    const adminVal = isAdmin ? 1 : 0;

    db.prepare(
      "INSERT INTO users (id, email, name, password, isAdmin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(userId, email, name, hashedPassword, adminVal, now, now);

    res.status(201).json({
      id: userId,
      email,
      name,
      isAdmin: adminVal === 1,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { name, email, isAdmin, password } = req.body;
    const now = new Date().toISOString();

    // Check duplicate email for other user
    if (email) {
      const existing = db
        .prepare("SELECT * FROM users WHERE email = ? AND id != ?")
        .get(email, req.params.id);
      if (existing) {
        return res.status(409).json({ error: "Email is already taken by another account" });
      }
    }

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.prepare(
        "UPDATE users SET name = ?, email = ?, isAdmin = ?, password = ?, updatedAt = ? WHERE id = ?"
      ).run(name, email, isAdmin ? 1 : 0, hashedPassword, now, req.params.id);
    } else {
      db.prepare(
        "UPDATE users SET name = ?, email = ?, isAdmin = ?, updatedAt = ? WHERE id = ?"
      ).run(name, email, isAdmin ? 1 : 0, now, req.params.id);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/role", (req, res) => {
  try {
    const db = getDb();
    const { isAdmin } = req.body;
    const now = new Date().toISOString();
    const adminVal = isAdmin ? 1 : 0;

    db.prepare("UPDATE users SET isAdmin = ?, updatedAt = ? WHERE id = ?").run(
      adminVal,
      now,
      req.params.id
    );

    res.json({ success: true, isAdmin: adminVal === 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const db = getDb();
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
