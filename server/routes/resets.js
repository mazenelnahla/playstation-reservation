import express from "express";
import { getDb } from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const db = getDb();
    const resets = db.prepare("SELECT * FROM dailyResets ORDER BY id DESC").all();
    res.json(resets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", (req, res) => {
  try {
    const db = getDb();
    const { totalProfit, sessionCount, resetBy } = req.body;
    const now = new Date().toISOString();
    const info = db.prepare("INSERT INTO dailyResets (resetAt, totalProfit, sessionCount, resetBy) VALUES (?, ?, ?, ?)").run(now, totalProfit || 0, sessionCount || 0, resetBy || "System Admin");
    res.json({ id: Number(info.lastInsertRowid), resetAt: now, totalProfit, sessionCount, resetBy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
