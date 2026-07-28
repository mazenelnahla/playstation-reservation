import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isValid } from "date-fns";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  Clock,
  CalendarRange,
  Receipt,
} from "lucide-react";
import { load, DataRecord, fetchMaintenanceLogs, MaintenanceLog } from "./DataHandle/storage";
import { useLanguage } from "./context/LanguageContext";
import DetailedSessionReceipt from "./components/Dialog/DetailedSessionReceipt";

type RecordItem = DataRecord;

export default function Profits() {
  const { t } = useLanguage();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [dateField, setDateField] = useState<"Date_out" | "Date_in">("Date_out");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Session receipt viewer dialog state
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedReceiptSession, setSelectedReceiptSession] = useState<RecordItem | null>(null);

  useEffect(() => {
    Promise.all([load(), fetchMaintenanceLogs()])
      .then(([data, mLogs]) => {
        setRecords(data || []);
        setMaintenanceLogs(mLogs || []);
      })
      .catch((err) => {
        console.error("Failed to load records in Profits page:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Helper to parse price reliably
  const parsePrice = (priceStr: string | number | undefined): number => {
    if (priceStr == null) return 0;
    if (typeof priceStr === "number") return priceStr;
    const cleaned = String(priceStr).replace(/[^0-9.-]+/g, "");
    const val = parseFloat(cleaned);
    return isNaN(val) ? 0 : val;
  };

  // Helper to extract YYYY-MM-DD from record date string
  const getRecordDateString = (record: RecordItem): string => {
    const raw = dateField === "Date_out" ? record.Date_out : record.Date_in;
    if (!raw) return "";
    const trimmed = raw.trim();
    if (trimmed.match(/^\d{4}-\d{2}-\d{2}/)) {
      return trimmed.substring(0, 10);
    }
    const d = new Date(trimmed);
    if (isValid(d)) {
      return d.toISOString().substring(0, 10);
    }
    return trimmed;
  };

  // Helper to extract YYYY-MM from record date string
  const getRecordMonthString = (record: RecordItem): string => {
    const dateStr = getRecordDateString(record);
    if (dateStr && dateStr.length >= 7) {
      return dateStr.substring(0, 7);
    }
    return "";
  };

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  // Filtered records for selected month
  const monthRecords = useMemo(() => {
    return records.filter((r) => getRecordMonthString(r) === selectedMonth);
  }, [records, selectedMonth, dateField]);

  // Today's records & profit
  const todayRecords = useMemo(() => {
    return records.filter((r) => getRecordDateString(r) === todayStr);
  }, [records, todayStr, dateField]);

  const todayProfit = useMemo(() => {
    return todayRecords.reduce((acc, r) => acc + parsePrice(r.MaintinancePrice), 0);
  }, [todayRecords]);

  // Monthly profit total
  const monthProfit = useMemo(() => {
    return monthRecords.reduce((acc, r) => acc + parsePrice(r.MaintinancePrice), 0);
  }, [monthRecords]);

  // All-time total profit
  const totalProfitAllTime = useMemo(() => {
    return records.reduce((acc, r) => acc + parsePrice(r.MaintinancePrice), 0);
  }, [records]);

  // Maintenance Expenses
  const todayMaintenanceExpense = useMemo(() => {
    return maintenanceLogs
      .filter((m) => m.createdAt && m.createdAt.substring(0, 10) === todayStr)
      .reduce((acc, m) => acc + (m.cost || 0), 0);
  }, [maintenanceLogs, todayStr]);

  const monthMaintenanceExpense = useMemo(() => {
    return maintenanceLogs
      .filter((m) => m.createdAt && m.createdAt.substring(0, 7) === selectedMonth)
      .reduce((acc, m) => acc + (m.cost || 0), 0);
  }, [maintenanceLogs, selectedMonth]);

  const totalMaintenanceExpenseAllTime = useMemo(() => {
    return maintenanceLogs.reduce((acc, m) => acc + (m.cost || 0), 0);
  }, [maintenanceLogs]);

  const netTodayProfit = todayProfit - todayMaintenanceExpense;
  const netMonthProfit = monthProfit - monthMaintenanceExpense;
  const netTotalProfitAllTime = totalProfitAllTime - totalMaintenanceExpenseAllTime;

  // Available months list for dropdown
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    monthsSet.add(selectedMonth);
    const nowMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    monthsSet.add(nowMonth);

    records.forEach((r) => {
      const m = getRecordMonthString(r);
      if (m && m.length === 7) {
        monthsSet.add(m);
      }
    });

    return Array.from(monthsSet).sort().reverse();
  }, [records, selectedMonth, dateField]);

  // Group monthly records by Day for history list
  const dailyHistory = useMemo(() => {
    const map = new Map<string, { date: string; total: number; count: number; items: RecordItem[] }>();

    monthRecords.forEach((r) => {
      const day = getRecordDateString(r);
      if (!day) return;
      const price = parsePrice(r.MaintinancePrice);
      if (!map.has(day)) {
        map.set(day, { date: day, total: 0, count: 0, items: [] });
      }
      const entry = map.get(day)!;
      entry.total += price;
      entry.count += 1;
      entry.items.push(r);
    });

    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [monthRecords, dateField]);

  // Technician breakdown for selected month
  const techBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number }>();

    monthRecords.forEach((r) => {
      const tech = r.DoneBy?.trim() || "Unassigned";
      const price = parsePrice(r.MaintinancePrice);
      if (!map.has(tech)) {
        map.set(tech, { name: tech, total: 0, count: 0 });
      }
      const entry = map.get(tech)!;
      entry.total += price;
      entry.count += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [monthRecords]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white light:text-slate-900 tracking-tight">{t("profitsTitle")}</h1>
              <p className="text-xs text-slate-400 light:text-slate-500">
                {t("profitsSub")}
              </p>
            </div>
          </div>
        </div>

        {/* Date basis & Month picker controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Basis Toggle */}
          <div className="bg-slate-800/80 p-1 rounded-xl border border-white/10 flex text-xs font-semibold">
            <button
              onClick={() => setDateField("Date_out")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateField === "Date_out"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              By Date Out
            </button>
            <button
              onClick={() => setDateField("Date_in")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateField === "Date_in"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              By Date In
            </button>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-white/10">
            <CalendarRange className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white text-sm font-semibold border-none outline-none cursor-pointer focus:ring-0"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-white">
                  {m === selectedMonth ? `Month: ${m}` : m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Today's Net Profit */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 p-6 shadow-xl"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="w-24 h-24 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Today's Net Profit
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {todayStr}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight my-2">
            EGP {netTodayProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-white/5">
            <div className="flex justify-between">
              <span>Gross Revenue:</span>
              <span className="font-semibold text-slate-200">EGP {todayProfit.toFixed(2)}</span>
            </div>
            {todayMaintenanceExpense > 0 && (
              <div className="flex justify-between text-red-400">
                <span>Equipment Repairs:</span>
                <span className="font-semibold">- EGP {todayMaintenanceExpense.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-emerald-300 font-bold">
              <span>Completed Sessions:</span>
              <span>{todayRecords.length} sessions</span>
            </div>
          </div>
        </motion.div>

        {/* Selected Month Net Profit */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-900 border border-blue-500/30 p-6 shadow-xl"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Calendar className="w-24 h-24 text-blue-400" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5" /> Total Month Net Profit
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {selectedMonth}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight my-2">
            EGP {netMonthProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-white/5">
            <div className="flex justify-between">
              <span>Gross Revenue:</span>
              <span className="font-semibold text-slate-200">EGP {monthProfit.toFixed(2)}</span>
            </div>
            {monthMaintenanceExpense > 0 && (
              <div className="flex justify-between text-red-400">
                <span>Equipment Repairs:</span>
                <span className="font-semibold">- EGP {monthMaintenanceExpense.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-blue-300 font-bold">
              <span>Completed Sessions:</span>
              <span>{monthRecords.length} sessions</span>
            </div>
          </div>
        </motion.div>

        {/* All-Time Net Profit */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/30 p-6 shadow-xl"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Award className="w-24 h-24 text-purple-400" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> All-Time Net Profit
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Overall
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight my-2">
            EGP {netTotalProfitAllTime.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-white/5">
            <div className="flex justify-between">
              <span>Gross Revenue:</span>
              <span className="font-semibold text-slate-200">EGP {totalProfitAllTime.toFixed(2)}</span>
            </div>
            {totalMaintenanceExpenseAllTime > 0 && (
              <div className="flex justify-between text-red-400">
                <span>Equipment Repairs:</span>
                <span className="font-semibold">- EGP {totalMaintenanceExpenseAllTime.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-purple-300 font-bold">
              <span>Total Logged Sessions:</span>
              <span>{records.length} sessions</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid: Daily History Log & Technician Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Daily Profit History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  Daily Profit History ({selectedMonth})
                </h2>
                <p className="text-xs text-slate-400">
                  Preserved profit records for each day of the selected month
                </p>
              </div>
              <div className="text-xs font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-lg border border-white/5">
                {dailyHistory.length} active days
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400">Loading profit history...</div>
            ) : dailyHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No profit records found for {selectedMonth}.
              </div>
            ) : (
              <div className="space-y-3">
                {dailyHistory.map((dayGroup) => {
                  const isToday = dayGroup.date === todayStr;
                  const isExpanded = expandedDay === dayGroup.date;

                  return (
                    <div
                      key={dayGroup.date}
                      className={`border rounded-xl transition-all overflow-hidden ${
                        isToday
                          ? "border-emerald-500/40 bg-emerald-950/20"
                          : "border-white/10 bg-slate-800/40 hover:bg-slate-800/70"
                      }`}
                    >
                      {/* Day Header Row */}
                      <div
                        onClick={() => setExpandedDay(isExpanded ? null : dayGroup.date)}
                        className="p-4 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isToday
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-slate-700/60 text-slate-300 border border-white/5"
                            }`}
                          >
                            {dayGroup.date.substring(8, 10)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">
                                {dayGroup.date}
                              </span>
                              {isToday && (
                                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500 text-slate-950 rounded-full">
                                  Today
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400">
                              {dayGroup.count} session{dayGroup.count === 1 ? "" : "s"} completed
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-base font-extrabold text-emerald-400">
                              EGP {dayGroup.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700"
                          >
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Repair Details Table */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-white/10 bg-slate-900/60 px-4 py-3"
                          >
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs text-left text-slate-300">
                                <thead>
                                  <tr className="border-b border-white/10 text-slate-400 font-semibold">
                                    <th className="py-2 px-2">Customer</th>
                                    <th className="py-2 px-2">Device & Model</th>
                                    <th className="py-2 px-2">Notes</th>
                                    <th className="py-2 px-2">Technician</th>
                                    <th className="py-2 px-2 text-right">Price / Profit</th>
                                    <th className="py-2 px-2 text-center">Receipt</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                  {dayGroup.items.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                      <td className="py-2 px-2 font-medium text-white">
                                        {item.CustomerName || "—"}
                                      </td>
                                      <td className="py-2 px-2 text-slate-300">
                                        {item.VendorName || ""} {item.ModelName || ""} ({item.Device_Type || "—"})
                                      </td>
                                      <td className="py-2 px-2 text-slate-400 max-w-[150px] truncate">
                                        {item.issue || item.Notes || "—"}
                                      </td>
                                      <td className="py-2 px-2 text-blue-400 font-medium">
                                        {item.DoneBy || "—"}
                                      </td>
                                      <td className="py-2 px-2 text-right font-bold text-emerald-400">
                                        EGP {parsePrice(item.MaintinancePrice).toFixed(2)}
                                      </td>
                                      <td className="py-2 px-2 text-center">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedReceiptSession(item);
                                            setReceiptOpen(true);
                                          }}
                                          className="px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1 transition-colors"
                                          title="View / Print Receipt History"
                                        >
                                          <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                                          <span>Receipt</span>
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Technician Profit Breakdown */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="pb-4 border-b border-white/10 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Technician Profit ({selectedMonth})
              </h2>
              <p className="text-xs text-slate-400">
                Revenue contribution per technician
              </p>
            </div>

            {techBreakdown.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No technician data for this month.
              </div>
            ) : (
              <div className="space-y-3">
                {techBreakdown.map((tech, idx) => {
                  const percent = monthProfit > 0 ? (tech.total / monthProfit) * 100 : 0;

                  return (
                    <div
                      key={tech.name}
                      className="p-3.5 rounded-xl bg-slate-800/40 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold flex items-center justify-center border border-blue-500/30">
                            #{idx + 1}
                          </span>
                          <span className="text-sm font-semibold text-white">{tech.name}</span>
                        </div>
                        <span className="text-sm font-extrabold text-emerald-400">
                          EGP {tech.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden my-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{tech.count} session{tech.count === 1 ? "" : "s"}</span>
                        <span>{percent.toFixed(1)}% of month total</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <DetailedSessionReceipt
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        session={selectedReceiptSession}
        onCheckout={() => setReceiptOpen(false)}
      />
    </div>
  );
}
