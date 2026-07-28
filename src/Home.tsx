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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">🎮 Live Gaming & Net Stations</h1>
          <p className="text-xs text-slate-400">Monitor active rooms, PS5 stations & PCs with real-time countdown timers</p>
        </div>

        <Button
          size="sm"
          className="h-11 px-5 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/30 font-bold text-sm transition-all shrink-0"
          onClick={() => setDataEntryOpen(true)}
        >
          <PlusIcon className="w-5 h-5" />
          <span>{t("addJob")}</span>
        </Button>
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
