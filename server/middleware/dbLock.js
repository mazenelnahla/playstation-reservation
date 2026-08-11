import fs from "fs";
import { checkIsDbInitialized, dbPath } from "../db.js";

export function dbLockMiddleware(req, res, next) {
  if (req.path.startsWith("/api/db/")) {
    return next();
  }
  if (!checkIsDbInitialized() || !fs.existsSync(dbPath)) {
    return res.status(423).json({
      error: "Database file is missing or not initialized. Master authorization password required.",
      dbLocked: true,
    });
  }
  next();
}
