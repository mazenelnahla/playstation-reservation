import express from "express";
import { getDb } from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const db = getDb();
    const items = db.prepare("SELECT * FROM menuItems ORDER BY name").all();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", (req, res) => {
  try {
    const db = getDb();
    const { name, category, price } = req.body;
    const info = db.prepare("INSERT INTO menuItems (name, category, price) VALUES (?, ?, ?)").run(name, category || "Beverage", price || 0);
    res.json({ id: Number(info.lastInsertRowid), name, category, price });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", (req, res) => {
  try {
    const db = getDb();
    const { name, category, price } = req.body;
    db.prepare("UPDATE menuItems SET name = ?, category = ?, price = ? WHERE id = ?").run(name, category, price, req.params.id);
    res.json({ success: true, id: Number(req.params.id), name, category, price });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const db = getDb();
    db.prepare("DELETE FROM menuItems WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
