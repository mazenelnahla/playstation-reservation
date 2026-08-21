import express from "express";
import fs from "fs";
import bcrypt from "bcryptjs";
import { checkIsDbInitialized, dbPath, initializeDatabase } from "../db.js";

const router = express.Router();

// Check database status
router.get("/status", (req, res) => {
  res.json({
    initialized: checkIsDbInitialized(),
    exists: fs.existsSync(dbPath),
  });
});

// Create/Unlock database with master password
router.post("/initialize", async (req, res) => {
  try {
    const { password } = req.body;
    const authenticated = await bcrypt.compare(password, process.env.TECH_PASSWORD);

    // Accept valid master password ('123456' or tech password)
    if (!authenticated) {
      return res.status(401).json({ error: "Invalid master authorization password." });
    }

    await initializeDatabase();
    console.log("✅ Database initialized successfully after password authorization!");
    res.json({ success: true, message: "Database created and initialized successfully." });
  } catch (error) {
    console.error("Error initializing database:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
