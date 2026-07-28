import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  Gamepad2,
  Globe,
  Sun,
  Moon,
  Shield,
  LogOut,
  Archive,
  TrendingUp,
  Wrench,
  User,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface HeaderNavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  isAdmin: boolean;
  username: string;
  avatarColor: string;
  colorGradients: Record<string, string>;
  handleLogout: () => void;
}

export function HeaderNavbar({
  sidebarOpen,
  setSidebarOpen,
  theme,
  toggleTheme,
  isAdmin,
  username,
  avatarColor,
  colorGradients,
  handleLogout,
}: HeaderNavbarProps) {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-emerald-500/20 shadow-2xl">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-emerald-500/30 transition-colors flex items-center justify-center shrink-0 shadow-lg"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-emerald-400" />
          </button>
          <Link to="/" className="flex items-center gap-3 group min-w-0">
            <div className="relative flex items-center justify-center shrink-0">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 border border-emerald-400/40 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <Gamepad2 className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-base sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent transition-all truncate">
                {t("appName")}
              </span>
              <span className="hidden sm:flex text-[10px] font-extrabold uppercase tracking-widest text-emerald-400/80 -mt-1 items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Station Manager
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {isAdmin && (
            <Link
              to="/Admin"
              className="hidden sm:flex items-center gap-2 h-10 px-3.5 rounded-xl bg-slate-800/80 light:bg-white border border-amber-500/40 hover:bg-amber-500/30 light:bg-amber-500 light:text-slate-950 light:border-amber-600 light:hover:bg-amber-600 text-xs font-bold transition-all shrink-0 shadow-sm"
            >
              <Shield className="w-4 h-4 text-amber-400 light:text-slate-950" />
              <span>{t("adminMode")}</span>
            </Link>
          )}

          <Link
            to="/Profile"
            className="flex items-center gap-1.5 h-9 sm:h-10 px-2 sm:px-3 rounded-xl bg-slate-800/80 light:bg-white hover:bg-slate-700/80 light:hover:bg-slate-100 border border-white/10 light:border-slate-300 transition-all shrink-0 shadow-sm"
            title={t("profile")}
          >
            <div
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] sm:text-xs bg-gradient-to-br ${
                colorGradients[avatarColor] || colorGradients.blue
              }`}
            >
              {username ? username.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="hidden sm:inline text-sm font-medium text-white light:text-slate-800 max-w-[90px] sm:max-w-[120px] truncate">
              {username}
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800/80 light:bg-white hover:bg-red-500/20 light:hover:bg-red-50 text-red-400 light:text-red-600 border border-white/10 light:border-slate-300 transition-all flex items-center justify-center shrink-0 shadow-sm"
            title={t("logout")}
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function MobileBottomNavbar() {
  const location = useLocation();
  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 px-2 py-2 flex items-center justify-around">
      <Link
        to="/"
        className={`flex flex-col items-center gap-1 text-[10px] font-bold p-1.5 rounded-lg transition-colors ${
          isActive("/") ? "text-emerald-400" : "text-slate-400 hover:text-white"
        }`}
      >
        <Gamepad2 className="w-5 h-5" />
        <span>Sessions</span>
      </Link>

      <Link
        to="/Search"
        className={`flex flex-col items-center gap-1 text-[10px] font-bold p-1.5 rounded-lg transition-colors ${
          isActive("/Search") ? "text-emerald-400" : "text-slate-400 hover:text-white"
        }`}
      >
        <Archive className="w-5 h-5" />
        <span>Archive</span>
      </Link>

      <Link
        to="/Profits"
        className={`flex flex-col items-center gap-1 text-[10px] font-bold p-1.5 rounded-lg transition-colors ${
          isActive("/Profits") ? "text-emerald-400" : "text-slate-400 hover:text-white"
        }`}
      >
        <TrendingUp className="w-5 h-5" />
        <span>Profits</span>
      </Link>

      <Link
        to="/Maintenance"
        className={`flex flex-col items-center gap-1 text-[10px] font-bold p-1.5 rounded-lg transition-colors ${
          isActive("/Maintenance") ? "text-emerald-400" : "text-slate-400 hover:text-white"
        }`}
      >
        <Wrench className="w-5 h-5" />
        <span>Repairs</span>
      </Link>

      <Link
        to="/Profile"
        className={`flex flex-col items-center gap-1 text-[10px] font-bold p-1.5 rounded-lg transition-colors ${
          isActive("/Profile") ? "text-emerald-400" : "text-slate-400 hover:text-white"
        }`}
      >
        <User className="w-5 h-5" />
        <span>Profile</span>
      </Link>
    </nav>
  );
}
