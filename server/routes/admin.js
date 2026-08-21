import express from "express";
import bcrypt from "bcryptjs";
import { getDb } from "../db.js";

const router = express.Router();

// Reset Database (Admin only, retains admin users & default categories)
router.post("/reset-database", async (req, res) => {
  try {
    const db = getDb();
    const { techPassword } = req.body;
    if (!techPassword) {
      return res.status(400).json({ error: "Password verification required" });
    }

    const authenticated = await bcrypt.compare(techPassword, process.env.TECH_PASSWORD);

    if (!authenticated) {
      console.warn("❌ Admin reset-database authentication failed. Input password did not match TECH_PASSWORD.");
      return res.status(401).json({ error: "Invalid password. Access denied." });
    }

    // Clear all application data tables
    db.exec(`
      DELETE FROM sessions;
      DELETE FROM sessionOrders;
      DELETE FROM dailyResets;
      DELETE FROM maintenanceLogs;
      DELETE FROM users WHERE isAdmin = 0;
      DROP TABLE IF EXISTS records;
      DROP TABLE IF EXISTS vendorNames;
      DELETE FROM sqlite_sequence WHERE name IN ('sessions', 'records', 'sessionOrders', 'dailyResets', 'maintenanceLogs');
    `);

    console.log("🧹 Database successfully reset by Admin. All session records, orders, resets, maintenance logs, and non-admin staff deleted.");
    res.json({ success: true, message: "Database wiped successfully. Admin accounts preserved." });
  } catch (error) {
    console.error("Failed to reset database:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
