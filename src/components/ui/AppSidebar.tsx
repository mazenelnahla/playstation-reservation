import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  Archive,
  TrendingUp,
  Wrench,
  Shield,
  PlusCircle,
  User,
  LogOut,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import { Sidebar as BaseSidebar, SidebarContent } from "./Sidebar";
import Button from "./Button";
import { useLanguage } from "../../context/LanguageContext";

interface SidebarNavProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  isAdmin: boolean;
  username: string;
  handleLogout: () => void;
  closeSidebarOnMobile: () => void;
}

export function AppSidebar({
  sidebarOpen,
  setSidebarOpen,
  theme,
  toggleTheme,
  isAdmin,
  username,
  handleLogout,
  closeSidebarOnMobile,
}: SidebarNavProps) {
  const { toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <BaseSidebar
        isOpen={sidebarOpen}
        className="bg-slate-900 light:bg-slate-300 border-r border-white/10 light:border-slate-400 top-[64px] h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] shadow-2xl z-50 overflow-hidden"
      >
        <SidebarContent className="py-3 pb-8 flex flex-col justify-between h-full overflow-y-auto">
          <div>
            <div className="space-y-1">
              <Button
                asChild
                variant="ghost"
                size="lg"
                className={`justify-start w-full rounded-xl transition-all ${
                  isActive("/")
                    ? "bg-emerald-600 text-white font-bold"
                    : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <Link to="/" onClick={closeSidebarOnMobile} className="flex items-center gap-3 w-full">
                  <Gamepad2 className="w-5 h-5 shrink-0" />
                  <span className="truncate">{t("jobs")}</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="lg"
                className={`justify-start w-full rounded-xl transition-all ${
                  isActive("/Search")
                    ? "bg-emerald-600 text-white font-bold"
                    : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <Link to="/Search" onClick={closeSidebarOnMobile} className="flex items-center gap-3 w-full">
                  <Archive className="w-5 h-5 shrink-0" />
                  <span className="truncate">{t("archiveTable")}</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="lg"
                className={`justify-start w-full rounded-xl transition-all ${
                  isActive("/Profits")
                    ? "bg-emerald-600 text-white font-bold"
                    : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <Link to="/Profits" onClick={closeSidebarOnMobile} className="flex items-center gap-3 w-full">
                  <TrendingUp className="w-5 h-5 shrink-0" />
                  <span className="truncate">{t("profits")}</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="lg"
                className={`justify-start w-full rounded-xl transition-all ${
                  isActive("/Maintenance")
                    ? "bg-emerald-600 text-white font-bold"
                    : "hover:bg-slate-800 text-slate-300"
                }`}
              >
                <Link to="/Maintenance" onClick={closeSidebarOnMobile} className="flex items-center gap-3 w-full">
                  <Wrench className="w-5 h-5 shrink-0" />
                  <span className="truncate">Maintenance</span>
                </Link>
              </Button>
            </div>
          </div>
          <div>
            <div className="border-t border-white/10 my-4 pt-4 space-y-2">
              {/* Language Switcher */}
              <Button
                variant="ghost"
                size="sm"
                className="justify-start w-full rounded-xl transition-all hover:bg-slate-800 text-slate-300"
                onClick={toggleLanguage}
              >
                <div className="flex items-center gap-3 w-full">
                  <Globe className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="truncate">{t("switchLanguage")}</span>
                </div>
              </Button>

              {/* Theme Switcher */}
              <Button
                variant="ghost"
                size="sm"
                className="justify-start w-full rounded-xl transition-all hover:bg-slate-800 text-slate-300"
                onClick={toggleTheme}
              >
                <div className="flex items-center gap-3 w-full">
                  {theme === "dark" ? (
                    <Sun className="w-5 h-5 text-amber-400 shrink-0" />
                  ) : (
                    <Moon className="w-5 h-5 text-blue-400 shrink-0" />
                  )}
                  <span className="truncate">
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </span>
                </div>
              </Button>

              {isAdmin && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={`justify-start w-full rounded-lg transition-all ${
                    isActive("/Admin")
                      ? "bg-amber-600 text-white font-bold"
                      : "hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <Link to="/Admin" onClick={closeSidebarOnMobile} className="flex items-center gap-3 w-full">
                    <Shield className="w-5 h-5 shrink-0" />
                    <span className="truncate">{t("adminMode")}</span>
                  </Link>
                </Button>
              )}
            </div>

            {/* User Profile Section */}
            <div className="border-t border-white/10 pt-4">
              <Link
                to="/Profile"
                onClick={closeSidebarOnMobile}
                className="block bg-slate-800/80 hover:bg-slate-800 rounded-xl p-3 mb-3 transition-colors"
                title={t("profile")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0 bg-slate-700">
                    <User className="w-4 h-4 text-white shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">
                      {username}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {isAdmin ? t("adminRole") : t("userRole")}
                    </p>
                  </div>
                </div>
              </Link>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="justify-start w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
              >
                <div className="flex items-center gap-3 w-full">
                  <LogOut className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="truncate">{t("logout")}</span>
                </div>
              </Button>
            </div>
          </div>
        </SidebarContent>
      </BaseSidebar>
    </>
  );
}
