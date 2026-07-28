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
const db = new Database(dbPath);

console.log(`Database location: ${dbPath}`);

// Initialize database
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

  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    Date_in TEXT NOT NULL,
    CustomerName TEXT NOT NULL,
    CustomerPhoneNumber TEXT NOT NULL,
    Device_Type TEXT NOT NULL,
    VendorName TEXT NOT NULL,
    ModelName TEXT NOT NULL,
    issue TEXT NOT NULL,
    MaintinancePrice TEXT NOT NULL,
    Date_out TEXT,
    DoneBy TEXT,
    Notes TEXT
  );

  CREATE TABLE IF NOT EXISTS vendorNames (
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
    recordId INTEGER NOT NULL,
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

// Migration: add stationType column if missing
try {
  const tableInfo = db.prepare("PRAGMA table_info(vendorNames)").all();
  const hasStationType = tableInfo.some((col) => col.name === 'stationType');
  if (!hasStationType) {
    db.exec("ALTER TABLE vendorNames ADD COLUMN stationType TEXT DEFAULT 'PS5 Station'");
  }
} catch (e) {
  console.warn("vendorNames migration warning:", e);
}

// Seed default Admin user if users table is empty
(async () => {
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

    const vCount = db.prepare("SELECT COUNT(*) as count FROM vendorNames").get();
    if (vCount.count === 0) {
      const insertVendor = db.prepare("INSERT INTO vendorNames (name, stationType) VALUES (?, ?)");
      insertVendor.run("PS5 #1", "PS5 Station");
      insertVendor.run("PS5 #2", "PS5 Station");
      insertVendor.run("PS4 #1", "PS4 Station");
      insertVendor.run("VIP Room #1", "VIP Room");
      insertVendor.run("Gaming PC #1", "Gaming PC");
      console.log("🎮 Default device categories seeded with Station Types");
    }
  } catch (err) {
    console.error("Failed to seed default admin or device categories:", err);
  }
})();

// Records API
app.get("/api/records", (req, res) => {
  try {
    const records = db.prepare("SELECT * FROM records ORDER BY id DESC").all();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/records", (req, res) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO records (Date_in, CustomerName, CustomerPhoneNumber, Device_Type,
        VendorName, ModelName, issue, MaintinancePrice, Date_out, DoneBy, Notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      req.body.Date_in,
      req.body.CustomerName,
      req.body.CustomerPhoneNumber,
      req.body.Device_Type,
      req.body.VendorName,
      req.body.ModelName,
      req.body.issue,
      req.body.MaintinancePrice,
      req.body.Date_out,
      req.body.DoneBy,
      req.body.Notes,
    );
    res.json({ id: Number(info.lastInsertRowid), ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/records/:id", (req, res) => {
  try {
    const fields = Object.keys(req.body).filter((k) => k !== "id");
    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => req.body[f]);

    const stmt = db.prepare(`UPDATE records SET ${setClause} WHERE id = ?`);
    stmt.run(...values, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/records/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM records WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vendor Names API
app.get("/api/vendors", (req, res) => {
  try {
    const vendors = db.prepare("SELECT * FROM vendorNames ORDER BY name").all();
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/vendors", (req, res) => {
  try {
    const { id, name, stationType } = req.body;
    if (id) {
      db.prepare("UPDATE vendorNames SET name = ?, stationType = ? WHERE id = ?").run(
        name,
        stationType || 'PS5 Station',
        id,
      );
      res.json({ id, name, stationType: stationType || 'PS5 Station' });
    } else {
      const info = db
        .prepare("INSERT INTO vendorNames (name, stationType) VALUES (?, ?)")
        .run(name, stationType || 'PS5 Station');
      res.json({ id: Number(info.lastInsertRowid), name, stationType: stationType || 'PS5 Station' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/vendors/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM vendorNames WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// Session Orders API (Snacks & Drinks attached to record)
app.get("/api/orders/:recordId", (req, res) => {
  try {
    const orders = db.prepare("SELECT * FROM sessionOrders WHERE recordId = ? ORDER BY id ASC").all(req.params.recordId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/orders", (req, res) => {
  try {
    const { recordId, itemName, quantity, price } = req.body;
    const qtyToAdd = quantity || 1;
    const existing = db.prepare("SELECT * FROM sessionOrders WHERE recordId = ? AND itemName = ?").get(recordId, itemName);
    if (existing) {
      const newQty = existing.quantity + qtyToAdd;
      db.prepare("UPDATE sessionOrders SET quantity = ? WHERE id = ?").run(newQty, existing.id);
      res.json({ ...existing, quantity: newQty });
    } else {
      const now = new Date().toISOString();
      const info = db.prepare("INSERT INTO sessionOrders (recordId, itemName, quantity, price, createdAt) VALUES (?, ?, ?, ?, ?)").run(recordId, itemName, qtyToAdd, price, now);
      res.json({ id: Number(info.lastInsertRowid), recordId, itemName, quantity: qtyToAdd, price, createdAt: now });
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

    // If putting device under maintenance, close any active sessions for this device so it becomes idle
    if (itemStatus === 'Under Maintenance' && deviceName) {
      db.prepare(
        "UPDATE records SET Date_out = ? WHERE VendorName = ? AND (Date_out IS NULL OR Date_out = '' OR Date_out = 'null')"
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

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Database: ${dbPath}`);
});
