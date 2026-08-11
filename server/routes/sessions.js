import express from "express";
import { getDb } from "../db.js";
import { formatSession } from "../utils/sessionMapper.js";

const router = express.Router();

const getSessionsHandler = (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM sessions ORDER BY id DESC").all();
    res.json(rows.map(formatSession));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.get("/sessions", getSessionsHandler);
router.get("/records", getSessionsHandler);

const createSessionHandler = (req, res) => {
  try {
    const db = getDb();
    const startTime = req.body.startTime || req.body.Date_in || "";
    const customerName = req.body.customerName || req.body.CustomerName || "";
    const customerPhone = req.body.customerPhone || req.body.CustomerPhoneNumber || "";
    const stationType = req.body.stationType || req.body.Device_Type || "";
    const stationName = req.body.stationName || req.body.VendorName || "";
    const gameType = req.body.gameType || req.body.ModelName || "";
    const sessionNotes = req.body.sessionNotes || req.body.issue || "";
    const hourlyRate = req.body.hourlyRate || req.body.MaintinancePrice || "";
    const endTime = req.body.endTime !== undefined ? req.body.endTime : req.body.Date_out;
    const staffMember = req.body.staffMember !== undefined ? req.body.staffMember : req.body.DoneBy;
    const notes = req.body.notes !== undefined ? req.body.notes : req.body.Notes;

    const stmt = db.prepare(`
      INSERT INTO sessions (startTime, customerName, customerPhone, stationType,
        stationName, gameType, sessionNotes, hourlyRate, endTime, staffMember, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      startTime,
      customerName,
      customerPhone,
      stationType,
      stationName,
      gameType,
      sessionNotes,
      hourlyRate,
      endTime,
      staffMember,
      notes
    );

    const insertedRow = db.prepare("SELECT * FROM sessions WHERE id = ?").get(info.lastInsertRowid);
    res.json(formatSession(insertedRow));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.post("/sessions", createSessionHandler);
router.post("/records", createSessionHandler);

const updateSessionHandler = (req, res) => {
  try {
    const db = getDb();
    const body = req.body;
    const updateData = {};
    if (body.startTime !== undefined || body.Date_in !== undefined) updateData.startTime = body.startTime || body.Date_in;
    if (body.customerName !== undefined || body.CustomerName !== undefined) updateData.customerName = body.customerName || body.CustomerName;
    if (body.customerPhone !== undefined || body.CustomerPhoneNumber !== undefined) updateData.customerPhone = body.customerPhone || body.CustomerPhoneNumber;
    if (body.stationType !== undefined || body.Device_Type !== undefined) updateData.stationType = body.stationType || body.Device_Type;
    if (body.stationName !== undefined || body.VendorName !== undefined) updateData.stationName = body.stationName || body.VendorName;
    if (body.gameType !== undefined || body.ModelName !== undefined) updateData.gameType = body.gameType || body.ModelName;
    if (body.sessionNotes !== undefined || body.issue !== undefined) updateData.sessionNotes = body.sessionNotes || body.issue;
    if (body.hourlyRate !== undefined || body.MaintinancePrice !== undefined) updateData.hourlyRate = body.hourlyRate || body.MaintinancePrice;
    if (body.endTime !== undefined || body.Date_out !== undefined) updateData.endTime = body.endTime !== undefined ? body.endTime : body.Date_out;
    if (body.staffMember !== undefined || body.DoneBy !== undefined) updateData.staffMember = body.staffMember !== undefined ? body.staffMember : body.DoneBy;
    if (body.notes !== undefined || body.Notes !== undefined) updateData.notes = body.notes !== undefined ? body.notes : body.Notes;

    const fields = Object.keys(updateData);
    if (fields.length > 0) {
      const setClause = fields.map((f) => `${f} = ?`).join(", ");
      const values = fields.map((f) => updateData[f]);
      const stmt = db.prepare(`UPDATE sessions SET ${setClause} WHERE id = ?`);
      stmt.run(...values, req.params.id);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.put("/sessions/:id", updateSessionHandler);
router.put("/records/:id", updateSessionHandler);

const deleteSessionHandler = (req, res) => {
  try {
    const db = getDb();
    db.prepare("DELETE FROM sessions WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.delete("/sessions/:id", deleteSessionHandler);
router.delete("/records/:id", deleteSessionHandler);

export default router;
