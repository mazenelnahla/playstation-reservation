import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const dbPath = path.join(dataDir, "data.db");
let db = null;
let isDbInitialized = fs.existsSync(dbPath);

console.log(`Database location: ${dbPath} (Exists: ${isDbInitialized})`);

export function getDb() {
  if (!db) {
    db = new Database(dbPath);
  }
  return db;
}

export function checkIsDbInitialized() {
  return isDbInitialized && fs.existsSync(dbPath);
}

export async function initializeDatabase() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      isAdmin INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      startTime TEXT NOT NULL,
      customerName TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      stationType TEXT NOT NULL,
      stationName TEXT NOT NULL,
      gameType TEXT NOT NULL,
      sessionNotes TEXT NOT NULL,
      hourlyRate TEXT NOT NULL,
      endTime TEXT,
      staffMember TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      stationType TEXT DEFAULT 'PS5 Station'
    );

    CREATE TABLE IF NOT EXISTS menuItems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessionOrders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId INTEGER NOT NULL,
      itemName TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dailyResets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resetAt TEXT NOT NULL,
      totalProfit REAL NOT NULL,
      sessionCount INTEGER NOT NULL,
      resetBy TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS maintenanceLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deviceName TEXT NOT NULL,
      cost REAL NOT NULL DEFAULT 0,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'Under Maintenance',
      createdAt TEXT NOT NULL
    );
  `);

  try {
    const tables = database.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((t) => t.name);

    if (tables.includes("vendorNames")) {
      const stationsCount = database.prepare("SELECT COUNT(*) as count FROM stations").get().count;
      if (stationsCount === 0) {
        database.exec(`
          INSERT INTO stations (id, name, stationType)
          SELECT id, name, COALESCE(stationType, 'PS5 Station') FROM vendorNames;
        `);
      }
    }

    if (tables.includes("records")) {
      const sessionsCount = database.prepare("SELECT COUNT(*) as count FROM sessions").get().count;
      if (sessionsCount === 0) {
        database.exec(`
          INSERT INTO sessions (id, startTime, customerName, customerPhone, stationType, stationName, gameType, sessionNotes, hourlyRate, endTime, staffMember, notes)
          SELECT id, Date_in, CustomerName, CustomerPhoneNumber, Device_Type, VendorName, ModelName, issue, MaintinancePrice, Date_out, DoneBy, Notes FROM records;
        `);
      }
    }

    if (tables.includes("sessionOrders")) {
      const orderCols = database.prepare("PRAGMA table_info(sessionOrders)").all().map((c) => c.name);
      if (orderCols.includes("recordId") && !orderCols.includes("sessionId")) {
        database.exec("ALTER TABLE sessionOrders ADD COLUMN sessionId INTEGER DEFAULT 0;");
        database.exec("UPDATE sessionOrders SET sessionId = recordId WHERE sessionId = 0;");
      }
    }
  } catch (e) {
    console.warn("Migration warning:", e);
  }

  try {
    const count = database.prepare("SELECT COUNT(*) as count FROM users").get();
    if (count.count === 0) {
      const defaultPassword = await bcrypt.hash("123456", 10);
      const adminId = uuidv4();
      const now = new Date().toISOString();
      database.prepare(
        "INSERT INTO users (id, email, name, password, isAdmin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run(adminId, "admin@admin.com", "Admin Staff", defaultPassword, 1, now, now);
      console.log("🔑 Default admin user seeded: admin@admin.com / 123456");
    }

    const vCount = database.prepare("SELECT COUNT(*) as count FROM stations").get();
    if (vCount.count === 0) {
      const insertStation = database.prepare("INSERT INTO stations (name, stationType) VALUES (?, ?)");
      insertStation.run("PS5 #1", "PS5 Station");
      insertStation.run("PS5 #2", "PS5 Station");
      insertStation.run("PS4 #1", "PS4 Station");
      insertStation.run("VIP Room #1", "VIP Room");
      insertStation.run("Gaming PC #1", "Gaming PC");
      console.log("🎮 Default station categories seeded with Station Types");
    }
  } catch (err) {
    console.error("Failed to seed default admin or device categories:", err);
  }

  isDbInitialized = true;
}

if (isDbInitialized) {
  initializeDatabase();
}
