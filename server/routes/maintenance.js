import express from "express";
import { getDb } from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const db = getDb();
    const logs = db.prepare("SELECT * FROM maintenanceLogs ORDER BY id DESC").all();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", (req, res) => {
  try {
    const db = getDb();
    const { deviceName, cost, description, status } = req.body;
    const now = new Date().toISOString();
    const itemStatus = status || "Under Maintenance";

    // If putting device under maintenance, close any active sessions for this station so it becomes idle
    if (itemStatus === "Under Maintenance" && deviceName) {
      db.prepare(
        "UPDATE sessions SET endTime = ? WHERE stationName = ? AND (endTime IS NULL OR endTime = '' OR endTime = 'null')"
      ).run(now, deviceName);
    }

    const info = db.prepare(
      "INSERT INTO maintenanceLogs (deviceName, cost, description, status, createdAt) VALUES (?, ?, ?, ?, ?)"
    ).run(deviceName, cost || 0, description || "", itemStatus, now);
    res.json({ id: Number(info.lastInsertRowid), deviceName, cost, description, status: itemStatus, createdAt: now });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", (req, res) => {
  try {
    const db = getDb();
    const { deviceName, cost, description, status } = req.body;
    const now = new Date().toISOString();

    // If putting device under maintenance, close any active sessions for this device so it becomes idle
    if (status === "Under Maintenance" && deviceName) {
      db.prepare(
        "UPDATE records SET Date_out = ? WHERE VendorName = ? AND (Date_out IS NULL OR Date_out = '' OR Date_out = 'null')"
      ).run(now, deviceName);
    }

    db.prepare(
      "UPDATE maintenanceLogs SET deviceName = ?, cost = ?, description = ?, status = ? WHERE id = ?"
    ).run(deviceName, cost || 0, description || "", status, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const db = getDb();
    db.prepare("DELETE FROM maintenanceLogs WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
