import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const db = getDb();
    const { email, name, password } = req.body;

    // Validate input
    if (!email || !name || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user exists
    const existingUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const now = new Date().toISOString();

    // Create user
    db.prepare(
      "INSERT INTO users (id, email, name, password, isAdmin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(userId, email, name, hashedPassword, 0, now, now);

    res.status(201).json({
      id: userId,
      email,
      name,
      isAdmin: false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const db = getDb();
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    // Find user
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate session ID
    const sessionId = uuidv4();

    res.json({
      sessionId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin === 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/logout", (req, res) => {
  res.json({ success: true });
});

router.get("/verify/:sessionId", (req, res) => {
  res.json({ success: true });
});

export default router;
