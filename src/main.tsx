import React from "react";
import ReactDOM from "react-dom/client";
import HomePage from "./Home";
import SearchPage from "./Search";
import AdminPage from "./Admin";
import Login from "./Login";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Layout from "./components/Layout";

import NotFound from "./NotFound";
import Profile from "./Profile";
import ProfitsPage from "./Profits";
import MaintenancePage from "./Maintenance";

// Protected Route Component (only accessible when logged in)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Guest Route Component (only accessible when NOT logged in)
function GuestRoute({ children }: { children: React.ReactNode }) {
  const sessionId = localStorage.getItem("sessionId");
  if (sessionId) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Admin Route Component (only accessible by admins)
function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}

import { LanguageProvider } from "./context/LanguageContext";

// Login Wrapper to handle Theme toggle on login page
function LoginWrapper() {
  const [theme, setTheme] = React.useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "dark";
  });

  React.useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return <Login theme={theme} toggleTheme={toggleTheme} />;
}

import { DbUnlockModal } from "./components/DbUnlockModal";

function DbGuard({ children }: { children: React.ReactNode }) {
  const [dbLocked, setDbLocked] = React.useState<boolean | null>(null);

  const checkStatus = React.useCallback(async () => {
    try {
      const res = await fetch("/api/db/status");
      const data = await res.json();
      setDbLocked(!data.initialized || !data.exists);
    } catch (err) {
      console.error("Failed to check DB status:", err);
      // If endpoint failed or returned locked status
      setDbLocked(true);
    }
  }, []);

  React.useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  if (dbLocked === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
        <div className="animate-pulse">Checking database authorization status...</div>
      </div>
    );
  }

  if (dbLocked) {
    return <DbUnlockModal onUnlocked={() => setDbLocked(false)} />;
  }

  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
      <DbGuard>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginWrapper />
                </GuestRoute>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/Search" element={<SearchPage />} />
                      <Route path="/Profits" element={<ProfitsPage />} />
                      <Route path="/Maintenance" element={<MaintenancePage />} />
                      <Route path="/Profile" element={<Profile />} />
                      <Route
                        path="/Admin"
                        element={
                          <AdminRoute>
                            <AdminPage />
                          </AdminRoute>
                        }
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </DbGuard>
    </LanguageProvider>
  </React.StrictMode>,
);
