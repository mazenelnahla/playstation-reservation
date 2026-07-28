import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Clock, AlertCircle, Coffee, DollarSign, Bell, CheckCircle, Flame, Monitor, Tv, Wrench, AlertTriangle } from "lucide-react";
import { DataRecord, fetchMaintenanceLogs, MaintenanceLog } from "../DataHandle/storage";
import DetailedSessionReceipt from "./Dialog/DetailedSessionReceipt";
import AddSnackDialog from "./Dialog/AddSnackDialog";

interface StationGridProps {
  sessions: DataRecord[];
  onRefresh: () => void;
  onSaveOut: (updated: DataRecord) => void;
  onOpenNewSession?: () => void;
}

export default function StationGrid({ sessions, onRefresh, onSaveOut, onOpenNewSession }: StationGridProps) {
  const [activeReceiptSession, setActiveReceiptSession] = useState<DataRecord | null>(null);
  const [snackSession, setSnackSession] = useState<DataRecord | null>(null);
  const [alertedSessions, setAlertedSessions] = useState<Set<number>>(new Set());
  const [categoryTab, setCategoryTab] = useState<string>("ALL");

  // Filter only ongoing active sessions (where Date_out is empty)
  const activeSessions = sessions.filter((s) => !s.Date_out || s.Date_out.trim() === "");

  // Dynamically extract unique station categories from active sessions
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    activeSessions.forEach((s) => {
      if (s.Device_Type && s.Device_Type.trim()) {
        set.add(s.Device_Type.trim());
      }
    });
    return Array.from(set);
  }, [activeSessions]);

  const filteredSessions = useMemo(() => {
    if (categoryTab === "ALL") return activeSessions;
    return activeSessions.filter((s) => (s.Device_Type || "").trim() === categoryTab);
  }, [activeSessions, categoryTab]);

  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);

  useEffect(() => {
    fetchMaintenanceLogs()
      .then(setMaintenanceLogs)
      .catch(() => setMaintenanceLogs([]));
  }, [sessions]);

  const downDevices = maintenanceLogs.filter((m) => m.status === "Under Maintenance");

  // Real-time timer update interval (every second)
  const [, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Play audio alert chime when 5 minutes remain
  useEffect(() => {
    activeSessions.forEach((session) => {
      const startTime = session.Date_in ? new Date(session.Date_in).getTime() : Date.now();
      const bookedHours = parseFloat(session.ModelName) || 1;
      const durationMs = bookedHours * 60 * 60 * 1000;
      const remainingMs = startTime + durationMs - Date.now();
      const isWarning5Mins = remainingMs > 0 && remainingMs <= 5 * 60 * 1000;

      if (isWarning5Mins && !alertedSessions.has(session.id)) {
        setAlertedSessions((prev) => new Set(prev).add(session.id));
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
          console.warn("Web Audio API not allowed or supported yet:", e);
        }
      }
    });
  }, [activeSessions, alertedSessions]);

  return (
    <div className="space-y-4">
      {/* Down for Maintenance Alert Banner */}
      {downDevices.length > 0 && (
        <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Wrench className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <span>🛠️ {downDevices.length} Device{downDevices.length === 1 ? "" : "s"} Down for Maintenance</span>
              </h4>
              <p className="text-xs text-amber-200/80">
                Unavailable for new session assignment:{" "}
                <strong className="text-white">{downDevices.map((d) => d.deviceName).join(", ")}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Station Grid Header with Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/90 p-4 rounded-2xl border border-emerald-500/20 shadow-lg gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Gamepad2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              Active Gaming Sessions
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {activeSessions.length} Active
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live countdown timers with 5-minute alerts & delay fee tracking
            </p>
          </div>
        </div>

        {/* Category Tabs: All + Dynamic station categories */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1 rounded-xl border border-white/10 text-xs font-bold">
          <button
            onClick={() => setCategoryTab("ALL")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              categoryTab === "ALL"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>All Stations ({activeSessions.length})</span>
          </button>
          {availableCategories.map((catName: string) => {
            const count = activeSessions.filter((s) => (s.Device_Type || "").trim() === catName).length;
            return (
              <button
                key={catName}
                onClick={() => setCategoryTab(catName)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  categoryTab === catName
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>{catName} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-white/5">
          <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-slate-400">No active stations in this category.</p>
          <p className="text-xs text-slate-500">Click "+ Start New Session" to register a session.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session: DataRecord) => {
            const startTime = session.Date_in ? new Date(session.Date_in).getTime() : Date.now();
            const bookedHours = parseFloat(session.ModelName) || 1;
            const durationMs = bookedHours * 60 * 60 * 1000;
            const expectedEndMs = startTime + durationMs;
            const remainingMs = expectedEndMs - Date.now();

            const isWarning5Mins = remainingMs > 0 && remainingMs <= 5 * 60 * 1000;
            const isOverdue = remainingMs <= 0;

            // Formatting time
            const totalSecs = Math.abs(Math.floor(remainingMs / 1000));
            const hrs = Math.floor(totalSecs / 3600);
            const mins = Math.floor((totalSecs % 3600) / 60);
            const secs = totalSecs % 60;
            const formattedTimer = `${hrs > 0 ? hrs + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

            // Card styling according to status
            let statusCardStyle = "bg-slate-900 border-white/10 hover:border-blue-500/40";
            let badgeBg = "bg-blue-500/20 text-blue-300 border-blue-500/30";
            let statusText = "Active Session";

            if (isWarning5Mins) {
              statusCardStyle = "bg-amber-950/40 border-amber-500/60 animate-pulse";
              badgeBg = "bg-amber-500/30 text-amber-200 border-amber-500/50";
              statusText = "⚠️ 5 MINS REMAINING!";
            } else if (isOverdue) {
              statusCardStyle = "bg-red-950/40 border-red-500/60";
              badgeBg = "bg-red-500/30 text-red-200 border-red-500/50";
              statusText = "🚨 OVERTIME / DELAYED";
            }

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-2xl border ${statusCardStyle} transition-all space-y-3 relative overflow-hidden flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-xs">
                        #{session.id}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">{session.Device_Type}</h4>
                        <span className="text-[11px] text-slate-400">{session.VendorName}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                      {statusText}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Customer:</span>
                      <strong className="text-white">{session.CustomerName}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Shift Staff:</span>
                      <strong className="text-blue-400">{session.DoneBy || "Employee"}</strong>
                    </div>
                  </div>

                  {/* Dynamic Timer Box */}
                  <div className="mt-3 bg-slate-950/80 p-3 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                      {isOverdue ? "Overdue Delay Time" : "Time Remaining"}
                    </span>
                    <div className={`text-2xl font-black font-mono tracking-widest ${isOverdue ? "text-red-400 animate-pulse" : isWarning5Mins ? "text-amber-400" : "text-emerald-400"}`}>
                      {isOverdue ? `+ ${formattedTimer}` : formattedTimer}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex gap-2">
                  <button
                    onClick={() => setSnackSession(session)}
                    className="w-1/2 h-9 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/30 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1 transition-all"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    + Add Snacks
                  </button>
                  <button
                    onClick={() => setActiveReceiptSession(session)}
                    className="w-1/2 h-9 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1 transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Checkout
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {snackSession && (
        <AddSnackDialog
          open={!!snackSession}
          onOpenChange={(op) => !op && setSnackSession(null)}
          session={snackSession}
          onOrdersUpdated={onRefresh}
        />
      )}

      {activeReceiptSession && (
        <DetailedSessionReceipt
          open={!!activeReceiptSession}
          onOpenChange={(op) => !op && setActiveReceiptSession(null)}
          session={activeReceiptSession}
          onCheckout={(updated) => {
            onSaveOut(updated);
            setActiveReceiptSession(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
