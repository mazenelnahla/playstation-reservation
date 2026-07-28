import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, AlertCircle, Loader, Sun, Moon, Globe } from "lucide-react";
import Button from "./components/ui/Button";
import { useLanguage } from "./context/LanguageContext";

interface LoginProps {
  theme?: "dark" | "light";
  toggleTheme?: () => void;
}

const Login = ({ theme = "dark", toggleTheme }: LoginProps) => {
  const { toggleLanguage, t, isRtl } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "", // For registration
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred");
        return;
      }

      if (isLogin) {
        // Store session and user data
        localStorage.setItem("sessionId", data.sessionId);
        localStorage.setItem("user_id", data.user.id);
        localStorage.setItem("username", data.user.name);
        localStorage.setItem("isAdmin", String(data.user.isAdmin));
        localStorage.setItem("email", data.user.email);

        // Redirect to home
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        // Show success and switch to login
        setSuccess(true);
        setTimeout(() => {
          setIsLogin(true);
          setFormData({ email: "", password: "", name: "" });
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 light:from-slate-100 light:via-slate-50 light:to-slate-200 flex items-center justify-center p-3 overflow-hidden">
      {/* Top Header Control Buttons: Theme & Language Toggles */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleLanguage}
          className="h-9 px-3 rounded-xl bg-slate-800/80 light:bg-white border border-white/10 light:border-slate-300 text-slate-200 light:text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-slate-700 light:hover:bg-slate-100 transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400 light:text-emerald-700" />
          <span>{t("switchLanguage")}</span>
        </button>

        {toggleTheme && (
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-slate-800/80 light:bg-white border border-white/10 light:border-slate-300 text-slate-200 light:text-slate-800 flex items-center justify-center shadow-sm hover:bg-slate-700 light:hover:bg-slate-100 transition-all"
            title="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        )}
      </div>

      {/* Background decoration */}
      <div className="hidden sm:block fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 light:opacity-10 animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 light:opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Card */}
        <div className="bg-slate-900/90 light:bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 light:border-slate-300 p-4 sm:p-8 text-slate-100 light:text-slate-900">
          {/* Header */}
          <motion.div
            className="text-center mb-3 sm:mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <div className="hidden sm:flex w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl items-center justify-center mx-auto mb-4 shadow-lg">
              <LogIn className="text-white w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-white light:text-slate-900 mb-1 sm:mb-2">
              {isLogin ? t("welcomeBack") : t("createAccountTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 light:text-slate-600">
              {isLogin ? t("signInDesc") : t("createAccountDesc")}
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-2.5 sm:space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Name Field - Registration Only */}
            {!isLogin && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-xs sm:text-sm font-medium text-slate-200 light:text-slate-700 mb-1">
                  {t("fullNameLabel")}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t("fullNamePlaceholder")}
                  required={!isLogin}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/80 light:bg-slate-50 border border-white/10 light:border-slate-300 rounded-lg text-white light:text-slate-900 text-sm placeholder-slate-400 light:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </motion.div>
            )}

            {/* Email Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: !isLogin ? 0.5 : 0.4 }}
            >
              <label className="block text-xs sm:text-sm font-medium text-slate-200 light:text-slate-700 mb-1">
                {t("emailLabel")}
              </label>
              <div className="relative">
                <Mail
                  className={`absolute ${isRtl ? "right-3" : "left-3"} top-2.5 sm:top-3.5 text-slate-400`}
                  size={18}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t("emailPlaceholder")}
                  required
                  className={`w-full ${isRtl ? "pr-9 sm:pr-10 pl-3" : "pl-9 sm:pl-10 pr-3"} py-2 sm:py-3 bg-slate-800/80 light:bg-slate-50 border border-white/10 light:border-slate-300 rounded-lg text-white light:text-slate-900 text-sm placeholder-slate-400 light:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all`}
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: !isLogin ? 0.6 : 0.5 }}
            >
              <label className="block text-xs sm:text-sm font-medium text-slate-200 light:text-slate-700 mb-1">
                {t("passwordLabel")}
              </label>
              <div className="relative">
                <Lock
                  className={`absolute ${isRtl ? "right-3" : "left-3"} top-2.5 sm:top-3.5 text-slate-400`}
                  size={18}
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t("passwordPlaceholder")}
                  required
                  className={`w-full ${isRtl ? "pr-9 sm:pr-10 pl-3" : "pl-9 sm:pl-10 pr-3"} py-2 sm:py-3 bg-slate-800/80 light:bg-slate-50 border border-white/10 light:border-slate-300 rounded-lg text-white light:text-slate-900 text-sm placeholder-slate-400 light:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all`}
                />
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="flex items-center gap-2 p-2.5 bg-red-500/10 light:bg-red-50 border border-red-500/50 light:border-red-300 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="text-red-400 light:text-red-600 shrink-0" size={16} />
                <span className="text-red-200 light:text-red-800 text-xs sm:text-sm font-semibold">{error}</span>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                className="flex items-center gap-2 p-2.5 bg-emerald-500/10 light:bg-emerald-50 border border-emerald-500/50 light:border-emerald-300 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="text-emerald-200 light:text-emerald-800 text-xs sm:text-sm font-semibold">
                  {isLogin
                    ? t("loginSuccess")
                    : t("accountCreatedSuccess")}
                </span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || success}
              className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-sm sm:text-base font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3 sm:mt-5 shadow-md"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  <span>Loading...</span>
                </>
              ) : isLogin ? (
                <>
                  <LogIn size={18} />
                  <span>{t("signInBtn")}</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>{t("createAccountBtn")}</span>
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Toggle Form */}
          <motion.div
            className="mt-3 sm:mt-5 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-slate-400 light:text-slate-600 text-xs sm:text-sm">
              {isLogin ? t("dontHaveAccount") : t("alreadyHaveAccount")}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ email: "", password: "", name: "" });
                  setError("");
                }}
                className="text-blue-400 light:text-blue-700 hover:underline font-bold transition-colors"
              >
                {isLogin ? t("signUpLink") : t("signInLink")}
              </button>
            </p>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="text-center text-slate-400 light:text-slate-500 text-[10px] sm:text-xs mt-2.5 sm:mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {t("footerCopyright")}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
