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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
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
    </LanguageProvider>
  </React.StrictMode>,
);
