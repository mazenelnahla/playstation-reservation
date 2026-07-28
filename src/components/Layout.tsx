import React, { useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { useLanguage } from "../context/LanguageContext";
import { HeaderNavbar, MobileBottomNavbar } from "./ui/NavigationBars";
import { AppSidebar } from "./ui/AppSidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { isRtl } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [avatarColor, setAvatarColor] = useState("blue");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
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

  const colorGradients: Record<string, string> = {
    blue: "from-blue-400 to-blue-600 bg-blue-600",
    emerald: "from-emerald-400 to-emerald-600 bg-emerald-600",
    purple: "from-purple-400 to-purple-600 bg-purple-600",
    amber: "from-amber-400 to-amber-600 bg-amber-600",
    rose: "from-rose-400 to-rose-600 bg-rose-600",
    indigo: "from-indigo-400 to-indigo-600 bg-indigo-600",
    teal: "from-teal-400 to-teal-600 bg-teal-600",
  };

  const loadProfile = () => {
    setUsername(localStorage.getItem("username") || "User");
    setIsAdmin(localStorage.getItem("isAdmin") === "true");
    setAvatarColor(localStorage.getItem("avatarColor") || "blue");
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener("profile-updated", loadProfile);
    return () => window.removeEventListener("profile-updated", loadProfile);
  }, []);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      if (sessionId) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    }

    localStorage.removeItem("sessionId");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("email");

    navigate("/login");
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 light:from-slate-100 light:via-slate-50 light:to-slate-200 transition-colors">
      {/* Top Header Navbar Component */}
      <HeaderNavbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        theme={theme}
        toggleTheme={toggleTheme}
        isAdmin={isAdmin}
        username={username}
        avatarColor={avatarColor}
        colorGradients={colorGradients}
        handleLogout={handleLogout}
      />

      {/* App Sidebar Component */}
      <AppSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isAdmin={isAdmin}
        username={username}
        handleLogout={handleLogout}
        closeSidebarOnMobile={closeSidebarOnMobile}
      />

      {/* Main Content Area */}
      <motion.main
        className={cn(
          "w-full min-w-0 p-3 sm:p-4 md:p-6 transition-all duration-300 pb-20 md:pb-6",
          isRtl
            ? sidebarOpen
              ? "md:pr-64 md:pl-0"
              : "md:pr-0 md:pl-0"
            : sidebarOpen
              ? "md:pl-64 md:pr-0"
              : "md:pl-0 md:pr-0"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>

      {/* Mobile Bottom Navbar Component */}
      <MobileBottomNavbar />
    </div>
  );
}
