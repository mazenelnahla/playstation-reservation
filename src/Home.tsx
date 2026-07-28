import React, { useEffect, useState } from "react";
import { PlusIcon,Gamepad2 } from "lucide-react";
import Button from "./components/ui/Button";
import StationGrid from "./components/StationGrid";
import DataEntryDialog from "./components/Dialog/DataEntryDialog";
import { load, updateRecord, DataRecord } from "./DataHandle/storage";
import { useLanguage } from "./context/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<DataRecord[]>([]);
  const [dataEntryOpen, setDataEntryOpen] = useState(false);

  const refreshRecords = async () => {
    try {
      const updated = await load();
      setItems(updated);
    } catch (err) {
      console.warn("[HomePage refreshRecords] failed", err);
    }
  };

  useEffect(() => {
    load()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  async function saveOut(updated: DataRecord) {
    try {
      await updateRecord(updated.id, updated);
      await refreshRecords();
    } catch (err) {
      console.warn("[HomePage saveOut] failed", err);
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white light:text-slate-900 tracking-tight">Active Stations Overview</h1>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Real-time lounge management, active timers, and live capacity tracking
            </p>
          </div>
        </div>

        <Button
          size="sm"
          className="h-10 px-5 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 font-bold text-xs sm:text-sm transition-all shrink-0 border border-emerald-400/30"
          onClick={() => setDataEntryOpen(true)}
        >
          <PlusIcon className="w-4 h-4 stroke-[2.5]" />
          <span>{t("addJob")}</span>
        </Button>
      </div>

      {/* Overview Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Revenue */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Today's Revenue</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight my-1">
            EGP {items
              .filter((r) => {
                const today = new Date().toISOString().substring(0, 10);
                return (r.Date_out || r.Date_in || "").startsWith(today);
              })
              .reduce((sum, r) => sum + (parseFloat(String(r.MaintinancePrice).replace(/[^0-9.-]+/g, "")) || 0), 0)
              .toFixed(2)}
          </div>
        </div>

        {/* Active Sessions */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-950/80 via-slate-900 to-slate-900 border border-teal-500/30 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Active Sessions</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              In-Progress
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight my-1">
            {items.filter((r) => !r.Date_out).length} <span className="text-xs font-normal text-slate-400">active</span>
          </div>
        </div>

        {/* Completed Today */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-900 border border-blue-500/30 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Completed Today</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Checked Out
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight my-1">
            {items.filter((r) => {
              const today = new Date().toISOString().substring(0, 10);
              return r.Date_out && r.Date_out.startsWith(today);
            }).length} <span className="text-xs font-normal text-slate-400">sessions</span>
          </div>
        </div>

        {/* Current Capacity */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/30 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Current Capacity</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Occupancy
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight my-1">
            {Math.min(100, Math.round((items.filter((r) => !r.Date_out).length / 10) * 100))}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-purple-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((items.filter((r) => !r.Date_out).length / 10) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Categorized Active Stations Grid (Playstation vs PC) */}
      <StationGrid
        sessions={items}
        onRefresh={refreshRecords}
        onSaveOut={saveOut}
      />

      {/* Start Session Dialog */}
      <DataEntryDialog
        open={dataEntryOpen}
        onOpenChange={setDataEntryOpen}
        onSuccess={refreshRecords}
      />
    </div>
  );
}
