import React, { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
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
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Header Banner with Add Session Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-white/10 shadow-lg">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            🎮 Active Stations Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time lounge management, active timers, and live capacity tracking
          </p>
        </div>

        <Button
          size="sm"
          className="h-11 px-6 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold text-sm transition-all shrink-0 border border-emerald-500/30"
          onClick={() => setDataEntryOpen(true)}
        >
          <PlusIcon className="w-5 h-5 stroke-[2.5]" />
          <span>{t("addJob")}</span>
        </Button>
      </div>

      {/* Overview Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Revenue */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-white/10 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Revenue</span>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">
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
        <div className="bg-slate-900/80 p-4 rounded-xl border border-white/10 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Sessions</span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
            {items.filter((r) => !r.Date_out).length} <span className="text-xs font-normal text-slate-400">active</span>
          </div>
        </div>

        {/* Completed Today */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-white/10 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Today</span>
          <div className="text-xl sm:text-2xl font-bold text-blue-400 mt-1">
            {items.filter((r) => {
              const today = new Date().toISOString().substring(0, 10);
              return r.Date_out && r.Date_out.startsWith(today);
            }).length} <span className="text-xs font-normal text-slate-400">sessions</span>
          </div>
        </div>

        {/* Current Capacity */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-white/10 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Capacity</span>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-bold text-white">
              {Math.min(100, Math.round((items.filter((r) => !r.Date_out).length / 10) * 100))}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((items.filter((r) => !r.Date_out).length / 10) * 100))}%` }}
              />
            </div>
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
