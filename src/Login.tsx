import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, AlertCircle, Loader } from "lucide-react";
import Button from "./components/ui/Button";

const Login = () => {
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

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" },
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-3 overflow-hidden">
      {/* Background decoration (desktop/tablet only to save space/performance) */}
      <div className="hidden sm:block fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
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
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-8">
          {/* Header */}
          <motion.div
            className="text-center mb-3 sm:mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <div className="hidden sm:flex w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full items-center justify-center mx-auto mb-4">
              <LogIn className="text-white w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {isLogin
                ? "Sign in to your account to continue"
                : "Create a new account to get started"}
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
                <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required={!isLogin}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all"
                />
              </motion.div>
            )}

            {/* Email Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: !isLogin ? 0.5 : 0.4 }}
            >
              <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-2.5 sm:top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: !isLogin ? 0.6 : 0.5 }}
            >
              <label className="block text-xs sm:text-sm font-medium text-slate-200 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-2.5 sm:top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all"
                />
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/50 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="text-red-400 shrink-0" size={16} />
                <span className="text-red-200 text-xs sm:text-sm">{error}</span>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/50 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="text-green-200 text-xs sm:text-sm">
                  {isLogin
                    ? "Login successful! Redirecting..."
                    : "Account created! Redirecting to login..."}
                </span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || success}
              className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3 sm:mt-5"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Loading...
                </>
              ) : isLogin ? (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              ) : (
                <>Create Account</>
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
            <p className="text-slate-400 text-xs sm:text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ email: "", password: "", name: "" });
                  setError("");
                }}
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="text-center text-slate-400 text-[10px] sm:text-xs mt-2.5 sm:mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            PlayStation Hub & Coffee Net System
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
