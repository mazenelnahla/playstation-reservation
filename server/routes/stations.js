import express from "express";
import { getDb } from "../db.js";

const router = express.Router();

const getStationsHandler = (req, res) => {
  try {
    const db = getDb();
    const stations = db.prepare("SELECT * FROM stations ORDER BY name").all();
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.get("/stations", getStationsHandler);
router.get("/vendors", getStationsHandler);

const saveStationHandler = (req, res) => {
  try {
    const db = getDb();
    const { id, name, stationType } = req.body;
    if (id) {
      db.prepare("UPDATE stations SET name = ?, stationType = ? WHERE id = ?").run(
        name,
        stationType || "PS5 Station",
        id
      );
      res.json({ id, name, stationType: stationType || "PS5 Station" });
    } else {
      const info = db
        .prepare("INSERT INTO stations (name, stationType) VALUES (?, ?)")
        .run(name, stationType || "PS5 Station");
      res.json({ id: Number(info.lastInsertRowid), name, stationType: stationType || "PS5 Station" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.post("/stations", saveStationHandler);
router.post("/vendors", saveStationHandler);

const deleteStationHandler = (req, res) => {
  try {
    const db = getDb();
    db.prepare("DELETE FROM stations WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.delete("/stations/:id", deleteStationHandler);
router.delete("/vendors/:id", deleteStationHandler);

export default router;
