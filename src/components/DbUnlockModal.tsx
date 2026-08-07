import React, { useState } from "react";
import { ShieldAlert, KeyRound, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface DbUnlockModalProps {
  onUnlocked: () => void;
}

export const DbUnlockModal: React.FC<DbUnlockModalProps> = ({ onUnlocked }) => {
  const { language } = useLanguage();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/db/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid authorization password");
      }

      onUnlocked();
    } catch (err: any) {
      setError(err.message || "Failed to initialize database");
    } finally {
      setLoading(false);
    }
  };

  const isAr = language === "ar";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-6 shadow-lg shadow-amber-500/5 animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">
            {isAr ? "قاعدة البيانات غير مفعلة / مفقودة" : "Database Protection Lock"}
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            {isAr
              ? "تم حذف أو نقل ملف قاعدة البيانات. لحماية تطبيقك ومنع استخدامه على جهاز آخر بدون إذنك، يرجى إدخال كلمة المرور المعتمدة لإنشاء قاعدة البيانات وتهيئة النظام."
              : "The database file is missing or deleted. To protect your application from being used on an unauthorized machine, enter the Master Password to initialize a new database."}
          </p>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 text-left">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isAr ? "أدخل كلمة مرور الفني / الأدمن..." : "Enter Master Password..."}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span>{isAr ? "جاري تهيئة قاعدة البيانات..." : "Initializing Database..."}</span>
              ) : (
                <>
                  <span>{isAr ? "إنشاء وتفعيل قاعدة البيانات" : "Authorize & Create Database"}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-slate-600 mt-6">
            {isAr ? "Playstation Hub System Security" : "Playstation Hub Security Protection"}
          </p>
        </div>
      </div>
    </div>
  );
};
