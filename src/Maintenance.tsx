import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Trash2,
  Pencil,
  Search,
  Filter,
  Flame,
  X,
  Save,
} from "lucide-react";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Label from "./components/ui/Label";
import Dialog, {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./components/ui/Dialog";
import {
  fetchMaintenanceLogs,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
  MaintenanceLog,
  load,
  DataRecord,
} from "./DataHandle/storage";
import { loadVendorName, VendorName } from "./DataHandle/VendorName";
import { useLanguage } from "./context/LanguageContext";

export default function Maintenance() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [vendorList, setVendorList] = useState<VendorName[]>([]);
  const [inUseDevices, setInUseDevices] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Under Maintenance" | "Repaired / Fixed">("ALL");

  // Modal State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);

  // Form State
  const [deviceName, setDeviceName] = useState("");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"Under Maintenance" | "Repaired / Fixed">("Under Maintenance");

  const loadData = async () => {
    try {
      setLoading(true);
      const [mLogs, vNames, records] = await Promise.all([
        fetchMaintenanceLogs(),
        loadVendorName(),
        load(),
      ]);
      setLogs(mLogs || []);
      setVendorList(vNames || []);

      const activeSet = new Set<string>(
        (records || [])
          .filter((r: DataRecord) => !r.Date_out || r.Date_out.trim() === "")
          .map((r: DataRecord) => r.VendorName)
      );
      setInUseDevices(activeSet);
    } catch (err) {
      console.error("Failed to load maintenance logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableVendors = useMemo(() => {
    return vendorList.filter(
      (v) => !inUseDevices.has(v.name) || (editingLog && editingLog.deviceName === v.name)
    );
  }, [vendorList, inUseDevices, editingLog]);

  const openNewModal = () => {
    setEditingLog(null);
    const available = vendorList.filter((v) => !inUseDevices.has(v.name));
    setDeviceName(available.length > 0 ? available[0].name : "");
    setCost("0");
    setDescription("");
    setStatus("Under Maintenance");
    setDialogOpen(true);
  };

  const openEditModal = (log: MaintenanceLog) => {
    setEditingLog(log);
    setDeviceName(log.deviceName);
    setCost(String(log.cost || 0));
    setDescription(log.description || "");
    setStatus(log.status);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim()) return;

    const numCost = parseFloat(cost) || 0;
    try {
      if (editingLog) {
        await updateMaintenanceLog(editingLog.id, {
          deviceName: deviceName.trim(),
          cost: numCost,
          description: description.trim(),
          status,
        });
      } else {
        await createMaintenanceLog({
          deviceName: deviceName.trim(),
          cost: numCost,
          description: description.trim(),
          status,
        });
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      console.error("Failed to save maintenance log:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this maintenance record?")) return;
    try {
      await deleteMaintenanceLog(id);
      loadData();
    } catch (err) {
      console.error("Failed to delete maintenance log:", err);
    }
  };

  const handleToggleStatus = async (log: MaintenanceLog) => {
    const newStatus = log.status === "Under Maintenance" ? "Repaired / Fixed" : "Under Maintenance";
    try {
      await updateMaintenanceLog(log.id, {
        deviceName: log.deviceName,
        cost: log.cost,
        description: log.description,
        status: newStatus,
      });
      loadData();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        log.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "ALL" || log.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [logs, searchQuery, statusFilter]);

  // Statistics
  const activeDownCount = useMemo(() => {
    return logs.filter((l) => l.status === "Under Maintenance").length;
  }, [logs]);

  const totalExpense = useMemo(() => {
    return logs.reduce((acc, l) => acc + (l.cost || 0), 0);
  }, [logs]);

  const repairedCount = useMemo(() => {
    return logs.filter((l) => l.status === "Repaired / Fixed").length;
  }, [logs]);

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white light:text-slate-900 tracking-tight">
              {t("maintTitle")}
            </h1>
            <p className="text-xs text-slate-400 light:text-slate-500">
              {t("maintSub")}
            </p>
          </div>
        </div>

        <Button
          onClick={openNewModal}
          size="sm"
          className="h-10 px-5 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 border border-amber-400/30"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t("logMaint")}</span>
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Devices Down Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-900 light:from-amber-50 light:to-white border border-amber-500/40 light:border-amber-300 p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 light:text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 light:text-amber-600 animate-pulse" /> {t("devicesDown")}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 light:bg-amber-100 text-amber-300 light:text-amber-800 border border-amber-500/30 light:border-amber-300">
              {t("outOfService")}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white light:text-slate-900 tracking-tight my-2">
            {activeDownCount} <span className="text-sm font-normal text-slate-400 light:text-slate-500">{t("activeCount")}</span>
          </div>
        </motion.div>

        {/* Total Expense Card (Subtracted from Profit) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950/80 via-slate-900 to-slate-900 light:from-red-50 light:to-white border border-red-500/40 light:border-red-300 p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 light:text-red-700 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-red-400 light:text-red-600" /> {t("totalExpenses")}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 light:bg-red-100 text-red-300 light:text-red-800 border border-red-500/30 light:border-red-300">
              {t("profitDeducted")}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-red-400 light:text-red-600 tracking-tight my-2">
            EGP {totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 light:text-slate-500">Automatically subtracted from Gross Profit</p>
        </motion.div>

        {/* Repaired / Fixed Devices Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 light:from-emerald-50 light:to-white border border-emerald-500/40 light:border-emerald-300 p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 light:text-emerald-700 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 light:text-emerald-600" /> {t("fixedRestored")}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 light:bg-emerald-100 text-emerald-300 light:text-emerald-800 border border-emerald-500/30 light:border-emerald-300">
              {t("ready")}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white light:text-slate-900 tracking-tight my-2">
            {repairedCount} <span className="text-sm font-normal text-slate-400 light:text-slate-500">{t("activeCount")}</span>
          </div>
        </motion.div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 light:bg-white p-4 rounded-xl border border-white/10 light:border-slate-300 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 light:text-slate-500" />
          <input
            type="text"
            placeholder={t("searchMaintPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 light:bg-slate-50 border border-white/10 light:border-slate-300 rounded-xl text-xs text-white light:text-slate-900 placeholder-slate-400 light:placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 light:text-slate-500" />
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              statusFilter === "ALL"
                ? "bg-amber-500 text-slate-950 border-amber-400"
                : "bg-slate-800 light:bg-slate-100 text-slate-300 light:text-slate-800 border-white/10 light:border-slate-300 hover:bg-slate-700 light:hover:bg-slate-200"
            }`}
          >
            {t("filterAll")} ({logs.length})
          </button>

          <button
            onClick={() => setStatusFilter("Under Maintenance")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              statusFilter === "Under Maintenance"
                ? "bg-amber-500 text-slate-950 border-amber-400"
                : "bg-slate-800 light:bg-amber-50 text-amber-400 light:text-amber-800 border-white/10 light:border-amber-300 hover:bg-slate-700 light:hover:bg-amber-100"
            }`}
          >
            🛠️ {t("filterDown")} ({activeDownCount})
          </button>

          <button
            onClick={() => setStatusFilter("Repaired / Fixed")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              statusFilter === "Repaired / Fixed"
                ? "bg-emerald-500 text-slate-950 border-emerald-400"
                : "bg-slate-800 light:bg-emerald-50 text-emerald-400 light:text-emerald-800 border-white/10 light:border-emerald-300 hover:bg-slate-700 light:hover:bg-emerald-100"
            }`}
          >
            ✅ {t("filterFixed")} ({repairedCount})
          </button>
        </div>
      </div>

      {/* Maintenance Records Table */}
      <div className="bg-slate-900/60 light:bg-white border border-white/10 light:border-slate-300 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 light:text-slate-900">
            <thead className="bg-slate-800/80 light:bg-slate-100 text-slate-400 light:text-slate-700 uppercase font-semibold text-[11px] border-b border-white/10 light:border-slate-200">
              <tr>
                <th className="py-3 px-4">{t("colStationDevice")}</th>
                <th className="py-3 px-4">{t("colStatus")}</th>
                <th className="py-3 px-4">{t("colRepairIssue")}</th>
                <th className="py-3 px-4 text-right">{t("colCostEgp")}</th>
                <th className="py-3 px-4">{t("colLoggedDate")}</th>
                <th className="py-3 px-4 text-center">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {t("loadingMaintLogs")}
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {t("noMaintLogs")}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isDown = log.status === "Under Maintenance";
                  return (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isDown ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
                        <span>{log.deviceName}</span>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(log)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors inline-flex items-center gap-1 ${
                            isDown
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                          }`}
                          title="Click to toggle status"
                        >
                          {isDown ? (
                            <>
                              <AlertTriangle className="w-3 h-3" />
                              <span>{t("downForMaint")}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>{t("fixedReady")}</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-slate-300 max-w-[250px] truncate">
                        {log.description || "—"}
                      </td>

                      <td className="py-3 px-4 text-right font-extrabold text-red-400">
                        - EGP {Number(log.cost || 0).toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {log.createdAt ? log.createdAt.substring(0, 10) : "—"}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(log)}
                            className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 transition-colors"
                            title="Edit Record"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(log.id)}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log / Edit Maintenance Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <span>{editingLog ? "Edit Maintenance Log" : "Log Device Maintenance / Repair"}</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Devices marked "Under Maintenance" will be blocked from starting new sessions. Repair cost is subtracted from Net Profit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          {/* Station / Device Selection */}
          <div className="space-y-1">
            <Label className="text-slate-200 text-xs font-semibold">Station / Device Name</Label>
            <select
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              required
            >
              <option value="" disabled>
                {availableVendors.length === 0 ? "No available (idle) devices to add" : "Select Station / Device"}
              </option>
              {availableVendors.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selection */}
          <div className="space-y-1">
            <Label className="text-slate-200 text-xs font-semibold">Current Device Status</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus("Under Maintenance")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  status === "Under Maintenance"
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                    : "bg-slate-800 text-amber-400 border-white/10 hover:bg-slate-700"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Down for Maintenance</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("Repaired / Fixed")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  status === "Repaired / Fixed"
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                    : "bg-slate-800 text-emerald-400 border-white/10 hover:bg-slate-700"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Repaired & Ready</span>
              </button>
            </div>
          </div>

          {/* Cost */}
          <div className="space-y-1">
            <Label className="text-slate-200 text-xs font-semibold">Repair / Maintenance Cost (EGP)</Label>
            <Input
              type="number"
              step="0.5"
              min="0"
              placeholder="e.g. 250"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="bg-slate-800 border-white/10 text-white text-xs"
              required
            />
            <p className="text-[11px] text-red-400">This amount will be subtracted from profits.</p>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-slate-200 text-xs font-semibold">Repair Details / Issue Notes</Label>
            <textarea
              rows={3}
              placeholder="e.g. Controller R2 button replaced, HDMI port repaired"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDialogOpen(false)}
              className="px-4 py-2 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Record</span>
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
