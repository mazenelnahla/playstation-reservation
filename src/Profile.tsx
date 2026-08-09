import React, { useState, useEffect } from "react";
import { User, Mail, Lock, CheckCircle, AlertCircle, Save, Shield, Palette } from "lucide-react";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Label from "./components/ui/Label";
import { useLanguage } from "./context/LanguageContext";

export const AVATAR_COLORS = [
  { id: "blue", label: "Blue", bgClass: "bg-blue-600", gradientClass: "from-blue-400 to-blue-600" },
  { id: "emerald", label: "Emerald", bgClass: "bg-emerald-600", gradientClass: "from-emerald-400 to-emerald-600" },
  { id: "purple", label: "Purple", bgClass: "bg-purple-600", gradientClass: "from-purple-400 to-purple-600" },
  { id: "amber", label: "Amber", bgClass: "bg-amber-600", gradientClass: "from-amber-400 to-amber-600" },
  { id: "rose", label: "Rose", bgClass: "bg-rose-600", gradientClass: "from-rose-400 to-rose-600" },
  { id: "indigo", label: "Indigo", bgClass: "bg-indigo-600", gradientClass: "from-indigo-400 to-indigo-600" },
  { id: "teal", label: "Teal", bgClass: "bg-teal-600", gradientClass: "from-teal-400 to-teal-600" },
];

export default function Profile() {
  const { language, setLanguage, t } = useLanguage();
  const userId = localStorage.getItem("user_id") || "";
  const initialName = localStorage.getItem("username") || "";
  const initialEmail = localStorage.getItem("email") || "";
  const initialColor = localStorage.getItem("avatarColor") || "blue";
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [avatarColor, setAvatarColor] = useState(initialColor);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setName(localStorage.getItem("username") || "");
    setEmail(localStorage.getItem("email") || "");
    setAvatarColor(localStorage.getItem("avatarColor") || "blue");
  }, []);

  const selectedColorObj = AVATAR_COLORS.find((c) => c.id === avatarColor) || AVATAR_COLORS[0];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }
    if (!email.trim()) {
      setError("Email cannot be empty");
      return;
    }
    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const payload: { name: string; email: string; isAdmin: boolean; password?: string } = {
        name,
        email,
        isAdmin,
      };
      if (password) {
        payload.password = password;
      }

      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Update local storage
      localStorage.setItem("username", name);
      localStorage.setItem("email", email);
      localStorage.setItem("avatarColor", avatarColor);

      // Dispatch custom event to update navbar/sidebar immediately
      window.dispatchEvent(new Event("profile-updated"));

      setSuccess("Profile updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <User className="w-7 h-7 text-blue-400" />
            <span>{t("profileTitle")}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t("profileSub")}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Shield className="w-4 h-4" />
            <span>{t("administrator")}</span>
          </div>
        )}
      </div>

      <div className="w-full bg-slate-900 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Picture Color Selection */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-white/5 space-y-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 avatar-circle bg-gradient-to-br ${selectedColorObj.gradientClass} rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white/20`}
              >
                <span className="user-avatar-letter" style={{ color: "#ffffff" }}>
                  {name ? name.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-blue-400" />
                  <span>{t("avatarColor")}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {t("avatarColorSub")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setAvatarColor(c.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    avatarColor === c.id
                      ? "border-white bg-slate-700 text-white scale-105 ring-2 ring-blue-500/50 shadow-md"
                      : "border-white/10 bg-slate-800/60 text-slate-300 hover:bg-slate-700/50"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-gradient-to-br ${c.gradientClass} border border-white/20`} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            {/* Language & App Preferences */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-white/5 space-y-3">
              <h3 className="text-sm font-semibold text-white">
                {t("appPreferences")} — {t("language")}
              </h3>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    language === "en"
                      ? "bg-blue-600 text-white border-blue-400 shadow-md"
                      : "bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700"
                  }`}
                >
                  🇬🇧 {t("english")}
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("ar")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    language === "ar"
                      ? "bg-emerald-600 text-white border-emerald-400 shadow-md"
                      : "bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700"
                  }`}
                >
                  🇪🇬 {t("arabic")}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-300">
                {t("fullName")}
              </Label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-11 bg-slate-800/50 border-white/10 text-white rounded-xl w-full"
                  placeholder={t("fullName")}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                {t("emailAddress")}
              </Label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-slate-800/50 border-white/10 text-white rounded-xl w-full"
                  placeholder={t("emailAddress")}
                  required
                />
              </div>
            </div>
          </div>

          <hr className="border-white/10 my-6" />

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-200">{t("changePassword")}</h3>
            <p className="text-xs text-slate-400">{t("passwordLeaveBlank")}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                  {t("newPassword")}
                </Label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 bg-slate-800/50 border-white/10 text-white rounded-xl w-full"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                  {t("confirmPassword")}
                </Label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-11 bg-slate-800/50 border-white/10 text-white rounded-xl w-full"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium h-11 rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? "..." : t("saveChanges")}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

