import "dotenv/config";
import express from "express";
import cors from "cors";
import { dbPath } from "./db.js";
import { dbLockMiddleware } from "./middleware/dbLock.js";

import dbRouter from "./routes/db.js";
import sessionsRouter from "./routes/sessions.js";
import stationsRouter from "./routes/stations.js";
import menuRouter from "./routes/menu.js";
import ordersRouter from "./routes/orders.js";
import maintenanceRouter from "./routes/maintenance.js";
import resetsRouter from "./routes/resets.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import adminRouter from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes exempt from DB initialization lock
app.use("/api/db", dbRouter);

// DB lock guard middleware for all other API endpoints
app.use(dbLockMiddleware);

// API Routes
app.use("/api", sessionsRouter);
app.use("/api", stationsRouter);
app.use("/api/menu", menuRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/resets", resetsRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/admin", adminRouter);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Database: ${dbPath}`);
});
