const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let serverProcess;

function startServer() {
  const serverPath = path.join(__dirname, "server/index.js");
  console.log("🚀 Starting backend Express server process at:", serverPath);
  serverProcess = spawn("node", [serverPath], {
    cwd: __dirname,
    env: { ...process.env, PORT: "3001" },
    stdio: "inherit",
  });

  serverProcess.on("error", (err) => {
    console.error("Failed to start backend server:", err);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "Playstation Hub - Lounge Management System",
    icon: path.join(__dirname, "public/vite.svg"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  });

  const isDev = !app.isPackaged && process.env.NODE_ENV !== "production";
  const startUrl = isDev
    ? "http://localhost:5173"
    : `file://${path.join(__dirname, "dist/index.html")}`;

  console.log("🖥️ Loading Desktop UI from:", startUrl);
  
  // Retry loading until server and dev server are ready
  const loadApp = () => {
    mainWindow.loadURL(startUrl).catch((err) => {
      console.log("Waiting for UI dev server/build...", err.message);
      setTimeout(loadApp, 1000);
    });
  };

  loadApp();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (serverProcess) {
    console.log("🛑 Terminating backend server process...");
    serverProcess.kill();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
