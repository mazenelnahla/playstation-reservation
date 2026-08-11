import express from "express";
import { getDb } from "../db.js";

const router = express.Router();

const getOrdersHandler = (req, res) => {
  try {
    const db = getDb();
    const targetId = req.params.sessionId || req.params.recordId;
    const orders = db.prepare("SELECT * FROM sessionOrders WHERE sessionId = ? OR recordId = ? ORDER BY id ASC").all(targetId, targetId);
    res.json(orders.map((o) => ({ ...o, recordId: o.sessionId || o.recordId, sessionId: o.sessionId || o.recordId })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.get("/:sessionId", getOrdersHandler);

router.post("/", (req, res) => {
  try {
    const db = getDb();
    const { recordId, sessionId, itemName, quantity, price } = req.body;
    const targetId = sessionId || recordId;
    const qtyToAdd = quantity || 1;
    const existing = db.prepare("SELECT * FROM sessionOrders WHERE (sessionId = ? OR recordId = ?) AND itemName = ?").get(targetId, targetId, itemName);
    if (existing) {
      const newQty = existing.quantity + qtyToAdd;
      db.prepare("UPDATE sessionOrders SET quantity = ? WHERE id = ?").run(newQty, existing.id);
      res.json({ ...existing, quantity: newQty, recordId: targetId, sessionId: targetId });
    } else {
      const now = new Date().toISOString();
      const info = db.prepare("INSERT INTO sessionOrders (sessionId, recordId, itemName, quantity, price, createdAt) VALUES (?, ?, ?, ?, ?, ?)").run(targetId, targetId, itemName, qtyToAdd, price, now);
      res.json({ id: Number(info.lastInsertRowid), recordId: targetId, sessionId: targetId, itemName, quantity: qtyToAdd, price, createdAt: now });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", (req, res) => {
  try {
    const db = getDb();
    const { quantity } = req.body;
    if (quantity <= 0) {
      db.prepare("DELETE FROM sessionOrders WHERE id = ?").run(req.params.id);
      res.json({ success: true, deleted: true });
    } else {
      db.prepare("UPDATE sessionOrders SET quantity = ? WHERE id = ?").run(quantity, req.params.id);
      res.json({ success: true, quantity });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const db = getDb();
    db.prepare("DELETE FROM sessionOrders WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
