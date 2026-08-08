import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "data.db");
let db = null;
let isDbInitialized = fs.existsSync(dbPath);

console.log(`Database location: ${dbPath} (Exists: ${isDbInitialized})`);

// Helper function to initialize sqlite tables and default data
async function initializeDatabase() {
  if (!db) {
    db = new Database(dbPath);
  }

  db.exec(`
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
    // Migration logic: migrate vendorNames -> stations if vendorNames exists
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((t) => t.name);
    
    if (tables.includes("vendorNames")) {
      const stationsCount = db.prepare("SELECT COUNT(*) as count FROM stations").get().count;
      if (stationsCount === 0) {
        db.exec(`
          INSERT INTO stations (id, name, stationType)
          SELECT id, name, COALESCE(stationType, 'PS5 Station') FROM vendorNames;
        `);
      }
    }

    if (tables.includes("records")) {
      const sessionsCount = db.prepare("SELECT COUNT(*) as count FROM sessions").get().count;
      if (sessionsCount === 0) {
        db.exec(`
          INSERT INTO sessions (id, startTime, customerName, customerPhone, stationType, stationName, gameType, sessionNotes, hourlyRate, endTime, staffMember, notes)
          SELECT id, Date_in, CustomerName, CustomerPhoneNumber, Device_Type, VendorName, ModelName, issue, MaintinancePrice, Date_out, DoneBy, Notes FROM records;
        `);
      }
    }

    if (tables.includes("sessionOrders")) {
      const orderCols = db.prepare("PRAGMA table_info(sessionOrders)").all().map((c) => c.name);
      if (orderCols.includes("recordId") && !orderCols.includes("sessionId")) {
        db.exec("ALTER TABLE sessionOrders ADD COLUMN sessionId INTEGER DEFAULT 0;");
        db.exec("UPDATE sessionOrders SET sessionId = recordId WHERE sessionId = 0;");
      }
    }
  } catch (e) {
    console.warn("Migration warning:", e);
  }

  // Seed default Admin user if users table is empty
  try {
    const count = db.prepare("SELECT COUNT(*) as count FROM users").get();
    if (count.count === 0) {
      const defaultPassword = await bcrypt.hash("123456", 10);
      const adminId = uuidv4();
      const now = new Date().toISOString();
      db.prepare(
        "INSERT INTO users (id, email, name, password, isAdmin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run(adminId, "admin@admin.com", "Admin Staff", defaultPassword, 1, now, now);
      console.log("🔑 Default admin user seeded: admin@admin.com / 123456");
    }

    const vCount = db.prepare("SELECT COUNT(*) as count FROM stations").get();
    if (vCount.count === 0) {
      const insertStation = db.prepare("INSERT INTO stations (name, stationType) VALUES (?, ?)");
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

// Check database status
app.get("/api/db/status", (req, res) => {
  res.json({
    initialized: isDbInitialized && fs.existsSync(dbPath),
    exists: fs.existsSync(dbPath),
  });
});

// Create/Unlock database with master password
app.post("/api/db/initialize", async (req, res) => {
  try {
    const { password } = req.body;
    // Accept valid master password ('123456' or tech password)
    if (!password || (password !== "123456" && password !== "admin123")) {
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

// Middleware to block all API routes if database is not authorized / created
app.use((req, res, next) => {
  if (req.path.startsWith("/api/db/")) {
    return next();
  }
  if (!isDbInitialized || !fs.existsSync(dbPath)) {
    return res.status(423).json({
      error: "Database file is missing or not initialized. Master authorization password required.",
      dbLocked: true,
    });
  }
  next();
});

// Helper mapper for session objects to ensure front-end compatibility
function formatSession(row) {
  if (!row) return null;
  const startTime = row.startTime || row.Date_in || "";
  const customerName = row.customerName || row.CustomerName || "";
  const customerPhone = row.customerPhone || row.CustomerPhoneNumber || "";
  const stationType = row.stationType || row.Device_Type || "";
  const stationName = row.stationName || row.VendorName || "";
  const gameType = row.gameType || row.ModelName || "";
  const sessionNotes = row.sessionNotes || row.issue || "";
  const hourlyRate = row.hourlyRate || row.MaintinancePrice || "";
  const endTime = row.endTime !== undefined ? row.endTime : row.Date_out;
  const staffMember = row.staffMember !== undefined ? row.staffMember : row.DoneBy;
  const notes = row.notes !== undefined ? row.notes : row.Notes;

  return {
    id: row.id,
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
    notes,
    // Legacy field aliases
    Date_in: startTime,
    CustomerName: customerName,
    CustomerPhoneNumber: customerPhone,
    Device_Type: stationType,
    VendorName: stationName,
    ModelName: gameType,
    issue: sessionNotes,
    MaintinancePrice: hourlyRate,
    Date_out: endTime,
    DoneBy: staffMember,
    Notes: notes,
  };
}

// Sessions API
const getSessionsHandler = (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM sessions ORDER BY id DESC").all();
    res.json(rows.map(formatSession));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

app.get("/api/sessions", getSessionsHandler);
app.get("/api/records", getSessionsHandler);

const createSessionHandler = (req, res) => {
  try {
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
      notes,
    );

    const insertedRow = db.prepare("SELECT * FROM sessions WHERE id = ?").get(info.lastInsertRowid);
    res.json(formatSession(insertedRow));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

app.post("/api/sessions", createSessionHandler);
app.post("/api/records", createSessionHandler);

const updateSessionHandler = (req, res) => {
  try {
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

app.put("/api/sessions/:id", updateSessionHandler);
app.put("/api/records/:id", updateSessionHandler);

const deleteSessionHandler = (req, res) => {
  try {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

app.delete("/api/sessions/:id", deleteSessionHandler);
app.delete("/api/records/:id", deleteSessionHandler);

// Stations API
const getStationsHandler = (req, res) => {
  try {
    const stations = db.prepare("SELECT * FROM stations ORDER BY name").all();
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

app.get("/api/stations", getStationsHandler);
app.get("/api/vendors", getStationsHandler);

const saveStationHandler = (req, res) => {
  try {
    const { id, name, stationType } = req.body;
    if (id) {
      db.prepare("UPDATE stations SET name = ?, stationType = ? WHERE id = ?").run(
        name,
        stationType || 'PS5 Station',
        id,
      );
      res.json({ id, name, stationType: stationType || 'PS5 Station' });
    } else {
      const info = db
        .prepare("INSERT INTO stations (name, stationType) VALUES (?, ?)")
        .run(name, stationType || 'PS5 Station');
      res.json({ id: Number(info.lastInsertRowid), name, stationType: stationType || 'PS5 Station' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

app.post("/api/stations", saveStationHandler);
app.post("/api/vendors", saveStationHandler);

const deleteStationHandler = (req, res) => {
  try {
    db.prepare("DELETE FROM stations WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

app.delete("/api/stations/:id", deleteStationHandler);
app.delete("/api/vendors/:id", deleteStationHandler);

// Menu Items API (Drinks & Snacks)
app.get("/api/menu", (req, res) => {
  try {
    const items = db.prepare("SELECT * FROM menuItems ORDER BY name").all();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/menu", (req, res) => {
  try {
    const { name, category, price } = req.body;
    const info = db.prepare("INSERT INTO menuItems (name, category, price) VALUES (?, ?, ?)").run(name, category || "Beverage", price || 0);
    res.json({ id: Number(info.lastInsertRowid), name, category, price });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/menu/:id", (req, res) => {
  try {
    const { name, category, price } = req.body;
    db.prepare("UPDATE menuItems SET name = ?, category = ?, price = ? WHERE id = ?").run(name, category, price, req.params.id);
    res.json({ success: true, id: Number(req.params.id), name, category, price });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/menu/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM menuItems WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Session Orders API (Snacks & Drinks attached to session)
const getOrdersHandler = (req, res) => {
  try {
    const targetId = req.params.sessionId || req.params.recordId;
    const orders = db.prepare("SELECT * FROM sessionOrders WHERE sessionId = ? OR recordId = ? ORDER BY id ASC").all(targetId, targetId);
    res.json(orders.map((o) => ({ ...o, recordId: o.sessionId || o.recordId, sessionId: o.sessionId || o.recordId })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

app.get("/api/orders/:sessionId", getOrdersHandler);

app.post("/api/orders", (req, res) => {
  try {
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

app.put("/api/orders/:id", (req, res) => {
  try {
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

app.delete("/api/orders/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM sessionOrders WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Equipment Maintenance & Device Down API
app.get("/api/maintenance", (req, res) => {
  try {
    const logs = db.prepare("SELECT * FROM maintenanceLogs ORDER BY id DESC").all();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/maintenance", (req, res) => {
  try {
    const { deviceName, cost, description, status } = req.body;
    const now = new Date().toISOString();
    const itemStatus = status || 'Under Maintenance';

    // If putting device under maintenance, close any active sessions for this station so it becomes idle
    if (itemStatus === 'Under Maintenance' && deviceName) {
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

app.put("/api/maintenance/:id", (req, res) => {
  try {
    const { deviceName, cost, description, status } = req.body;
    const now = new Date().toISOString();

    // If putting device under maintenance, close any active sessions for this device so it becomes idle
    if (status === 'Under Maintenance' && deviceName) {
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

app.delete("/api/maintenance/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM maintenanceLogs WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Daily Resets API (24-Hour Cycle)
app.get("/api/resets", (req, res) => {
  try {
    const resets = db.prepare("SELECT * FROM dailyResets ORDER BY id DESC").all();
    res.json(resets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/resets", (req, res) => {
  try {
    const { totalProfit, sessionCount, resetBy } = req.body;
    const now = new Date().toISOString();
    const info = db.prepare("INSERT INTO dailyResets (resetAt, totalProfit, sessionCount, resetBy) VALUES (?, ?, ?, ?)").run(now, totalProfit || 0, sessionCount || 0, resetBy || "System Admin");
    res.json({ id: Number(info.lastInsertRowid), resetAt: now, totalProfit, sessionCount, resetBy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Authentication API
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // Validate input
    if (!email || !name || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user exists
    const existingUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const now = new Date().toISOString();

    // Create user
    db.prepare(
      "INSERT INTO users (id, email, name, password, isAdmin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ).run(userId, email, name, hashedPassword, 0, now, now);

    res.status(201).json({
      id: userId,
      email,
      name,
      isAdmin: false,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    // Find user
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate session ID
    const sessionId = uuidv4();

    res.json({
      sessionId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin === 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.json({ success: true });
});

app.get("/api/auth/verify/:sessionId", (req, res) => {
  res.json({ success: true });
});

// User Management API (Admin Controls)
app.get("/api/users", (req, res) => {
  try {
    const users = db
      .prepare("SELECT id, email, name, isAdmin, createdAt, updatedAt FROM users ORDER BY createdAt DESC")
      .all();
    res.json(users.map((u) => ({ ...u, isAdmin: u.isAdmin === 1 })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { email, name, password, isAdmin } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (existingUser) {
      return res.status(409).json({ error: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const now = new Date().toISOString();
    const adminVal = isAdmin ? 1 : 0;

    db.prepare(
      "INSERT INTO users (id, email, name, password, isAdmin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(userId, email, name, hashedPassword, adminVal, now, now);

    res.status(201).json({
      id: userId,
      email,
      name,
      isAdmin: adminVal === 1,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { name, email, isAdmin, password } = req.body;
    const now = new Date().toISOString();

    // Check duplicate email for other user
    if (email) {
      const existing = db
        .prepare("SELECT * FROM users WHERE email = ? AND id != ?")
        .get(email, req.params.id);
      if (existing) {
        return res.status(409).json({ error: "Email is already taken by another account" });
      }
    }

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.prepare(
        "UPDATE users SET name = ?, email = ?, isAdmin = ?, password = ?, updatedAt = ? WHERE id = ?"
      ).run(name, email, isAdmin ? 1 : 0, hashedPassword, now, req.params.id);
    } else {
      db.prepare(
        "UPDATE users SET name = ?, email = ?, isAdmin = ?, updatedAt = ? WHERE id = ?"
      ).run(name, email, isAdmin ? 1 : 0, now, req.params.id);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/users/:id/role", (req, res) => {
  try {
    const { isAdmin } = req.body;
    const now = new Date().toISOString();
    const adminVal = isAdmin ? 1 : 0;

    db.prepare("UPDATE users SET isAdmin = ?, updatedAt = ? WHERE id = ?").run(
      adminVal,
      now,
      req.params.id
    );

    res.json({ success: true, isAdmin: adminVal === 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/users/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Database (Admin only, retains admin users & default categories)
app.post("/api/admin/reset-database", async (req, res) => {
  try {
    const { techPassword } = req.body;
    if (!techPassword) {
      return res.status(400).json({ error: "Password verification required" });
    }

    // Verify password against any existing Admin account
    const adminUsers = db.prepare("SELECT * FROM users WHERE isAdmin = 1").all();
    if (!adminUsers || adminUsers.length === 0) {
      return res.status(403).json({ error: "No admin user found to authorize operation" });
    }

    let authenticated = false;
    for (const admin of adminUsers) {
      const match = await bcrypt.compare(techPassword, admin.password);
      if (match) {
        authenticated = true;
        break;
      }
    }

    if (!authenticated) {
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

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Database: ${dbPath}`);
});

