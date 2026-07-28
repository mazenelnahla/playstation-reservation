import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Field from "./ui/Field";
import Button from "./ui/Button";
import { cn } from "../lib/utils";
import {
  PlusCircle,
  BanIcon,
  Pencil,
  PlusIcon,
  Trash2,
  LogOut,
  User,
  Menu,
  Shield,
  TrendingUp,
  Sun,
  Moon,
  Smartphone,
  Wrench,
  Globe,
  Gamepad2,
  Archive,
} from "lucide-react";
import { Sidebar, SidebarContent } from "./ui/Sidebar";
import { useState, ReactNode, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import VendorNameDialog from "../components/Dialog/VendorNameDialog";
import {
  loadVendorName,
  addOrUpdateVendorName,
  deleteVendorName,
  VendorName,
} from "../DataHandle/VendorName";
interface LayoutProps {
  children: ReactNode;
}
/* ====== Lists ====== */
type VendorNameItem = VendorName;
export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { language, toggleLanguage, t, isRtl } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // VendorName state
  const [VendorName, setVendorName] = useState<VendorNameItem[]>([]);
  const [addVendorNameOpen, setAddVendorNameOpen] = useState(false);
  const [editingVendorNames, setEditingVendorNames] =
    useState<VendorNameItem | null>(null);
  const [confirmDeleteVendorNames, setConfirmDeleteVendorNames] =
    useState<VendorNameItem | null>(null);

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

    // Clear local storage
    localStorage.removeItem("sessionId");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("email");

    // Redirect to login
    navigate("/login");
  };

  // load vendor names
  useEffect(() => {
    loadVendorName()
      .then((v) => setVendorName(Array.isArray(v) ? v : []))
      .catch(() => setVendorName([]));
  }, []);

  // Add VendorNames using IndexedDB
  async function addVendorNamesItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const VendorNamesform = new FormData(e.currentTarget);
    const name = String(VendorNamesform.get("Name") || "");

    try {
      if (editingVendorNames) {
        // Update existing
        await addOrUpdateVendorName({ id: editingVendorNames.id, name });
      } else {
        // Create new (id will be auto-generated)
        await addOrUpdateVendorName({ name } as VendorName);
      }
      const updated = await loadVendorName();
      setVendorName(Array.isArray(updated) ? updated : []);
      setEditingVendorNames(null);
      const form = e.currentTarget as HTMLFormElement;
      if (form) form.reset();
    } catch (err) {
      console.error("[addVendorNamesItem] failed", err);
    }
  }

  function handleEditVendorNames(s: VendorNameItem) {
    setEditingVendorNames(s);
  }

  function handleDeleteVendorNames(s: VendorNameItem) {
    setConfirmDeleteVendorNames(s);
  }

  async function confirmDeleteVendorNamesAction() {
    if (!confirmDeleteVendorNames) return;
    try {
      await deleteVendorName(confirmDeleteVendorNames.id);
      const updated = await loadVendorName();
      setVendorName(Array.isArray(updated) ? updated : []);
      setConfirmDeleteVendorNames(null);
    } catch (err) {
      console.error("[confirmDeleteVendorNamesAction] failed", err);
    }
  }


  const location = useLocation();

  const isActive = (path: string): boolean => location.pathname === path;

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 light:from-slate-100 light:via-slate-50 light:to-slate-200 transition-colors">
      {/* Top Navbar */}
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
                {/* Icon Badge */}
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
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="h-9 sm:h-10 px-2 sm:px-3 rounded-xl bg-slate-800/80 light:bg-white hover:bg-slate-700/80 light:hover:bg-slate-100 text-white light:text-slate-800 border border-white/10 light:border-slate-300 transition-all flex items-center gap-1 shrink-0 text-xs font-bold shadow-sm"
              title={language === "en" ? "التحويل إلى اللغة العربية" : "Switch to English"}
            >
              <Globe className="w-4 h-4 text-emerald-400 light:text-emerald-600" />
              <span className="hidden xs:inline sm:inline">{t("switchLanguage")}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800/80 light:bg-white hover:bg-slate-700/80 light:hover:bg-slate-100 text-white light:text-slate-800 border border-white/10 light:border-slate-300 transition-all flex items-center justify-center shrink-0 shadow-sm"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              )}
            </button>

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
      <Sidebar
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

              <Button
                variant="ghost"
                size="sm"
                className={`justify-start w-full rounded-lg transition-all ${
                  addVendorNameOpen
                    ? "bg-slate-700 text-white"
                    : "hover:bg-slate-800 text-slate-300"
                }`}
                onClick={() => setAddVendorNameOpen(!addVendorNameOpen)}
              >
                <div className="flex items-center gap-3 w-full">
                  <PlusCircle className="w-5 h-5 shrink-0" />
                  <span className="truncate">{t("addPhoneType")}</span>
                </div>
              </Button>
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
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0 bg-slate-700`}
                  >
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
      </Sidebar>

      {/* Add VendorNames confirm */}
      <VendorNameDialog
        open={addVendorNameOpen}
        onOpenChange={setAddVendorNameOpen}
        VendorName={VendorName}
        setVendorName={setVendorName}
        editingVendorNames={editingVendorNames}
        setEditingVendorNames={setEditingVendorNames}
        confirmDeleteVendorNames={confirmDeleteVendorNames}
        setConfirmDeleteVendorNames={setConfirmDeleteVendorNames}
        addVendorNamesItem={addVendorNamesItem}
        handleEditVendorNames={handleEditVendorNames}
        handleDeleteVendorNames={handleDeleteVendorNames}
        confirmDeleteVendorNamesAction={confirmDeleteVendorNamesAction}
        Field={Field}
        Button={Button}
        PlusIcon={PlusIcon}
        Pencil={Pencil}
        Trash2={Trash2}
        BanIcon={BanIcon}
        AnimatePresence={AnimatePresence}
        motion={motion}
      />


      {/* Main Content */}
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

      {/* Bottom Navigation Bar for Mobile Phones */}
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
    </div>
  );
}
