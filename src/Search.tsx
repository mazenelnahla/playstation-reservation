import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Label from "./components/ui/Label";
import Field from "./components/ui/Field";
import SelectField from "./components/ui/SelectField";
import DeleteDialog from "./components/Dialog/DeleteDialog";
import {
  Card,
  CardContent,
} from "./components/ui/Card";
import Dialog, {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./components/ui/Dialog";
import EditRecordDialog from "./components/Dialog/EditRecordDialog";
import OutRecordDialog from "./components/Dialog/OutRecordDialog";
import PrintTable from "./components/PrintTable";
import { fetchUsers, UserItem } from "./DataHandle/users";
import { useLanguage } from "./context/LanguageContext";
import {
  BanIcon,
  Pencil,
  PlusIcon,
  Printer,
  Trash2,
  X,
  SearchIcon,
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
  RotateCcw,
  Gamepad2,
} from "lucide-react";


import {
  load,
  createRecord,
  updateRecord,
  deleteRecord,
  DataRecord,
} from "./DataHandle/storage";
import {
  loadVendorName,
  addOrUpdateVendorName,
  deleteVendorName,
  VendorName,
} from "./DataHandle/VendorName";

/* ====== Lists ====== */
type VendorNameItem = VendorName;

const DEVICE_TYPES = ["Mobile", "Tablet", "Other"];

/* ====== Types ====== */
type RecordItem = DataRecord;

import DataEntryDialog from "./components/Dialog/DataEntryDialog";

/* ====== Search helpers ====== */
const FIELD_ORDER: (keyof RecordItem)[] = [
  "id",
  "Date_in",
  "CustomerName",
  "CustomerPhoneNumber",
  "Device_Type",
  "VendorName",
  "ModelName",
  "issue",
  "MaintinancePrice",
  "Date_out",
  "DoneBy",
  "Notes",
];

function normalize(val: unknown): string {
  if (val == null) return "";
  if (typeof val === "number") return String(val);
  if (typeof val === "string") return val;
  if (val instanceof Date) return val.toISOString();
  return JSON.stringify(val);
}
function includesAllFields(item: RecordItem, q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const blob = FIELD_ORDER.map((k) => normalize(item[k]))
    .join(" | ")
    .toLowerCase();
  return blob.includes(needle);
}

function withinDateRange(dateStr: string, from: string, to: string) {
  if (!from && !to) return true;
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  if (from) {
    const f = new Date(from);
    if (isNaN(f.getTime())) return false;
    if (d < f) return false;
  }
  if (to) {
    const t = new Date(to);
    if (isNaN(t.getTime())) return false;
    // include whole "to" day
    t.setHours(23, 59, 59, 999);
    if (d > t) return false;
  }
  return true;
}

/* ====== App ====== */
export default function SearchPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [items, setItems] = useState<RecordItem[]>([]);
  const [query, setQuery] = useState("");
  // Out should be a single record or null
  const [Out, setOut] = useState<RecordItem | null>(null);
  // editing should be a single record or null
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<RecordItem | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [dateOutFrom, setDateOutFrom] = useState<string>("");
  const [dateOutTo, setDateOutTo] = useState<string>("");
  const [showDateSearch, setShowDateSearch] = useState(false);

  // System users list for Technicians
  const [users, setUsers] = useState<UserItem[]>([]);

  // VendorName state
  const [VendorName, setVendorName] = useState<VendorNameItem[]>([]);
  const [addVendorNameOpen, setAddVendorNameOpen] = useState(false);
  const [editingVendorNames, setEditingVendorNames] =
    useState<VendorNameItem | null>(null);
  const [confirmDeleteVendorNames, setConfirmDeleteVendorNames] =
    useState<VendorNameItem | null>(null);

  const [dataEntryOpen, setDataEntryOpen] = useState(false);

  // Load from IndexedDB
  useEffect(() => {
    load()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const refreshRecords = async () => {
    try {
      const updated = await load();
      setItems(updated);
    } catch (err) {
      console.warn("[refreshRecords] failed", err);
    }
  };

  function handleDeleteRecord(s: RecordItem) {
    setConfirmDelete(s);
  }

  async function confirmDeleteRecordAction() {
    if (!confirmDelete) return;
    try {
      await deleteRecord(confirmDelete.id);
      const updated = await load();
      setItems(updated);
      setConfirmDelete(null);
    } catch (err) {
      console.warn("[confirmDeleteRecordAction] failed", err);
    }
  }

  // Pagination state
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  // Per-column filter state
  const [colFilters, setColFilters] = useState<
    Partial<Record<keyof RecordItem, string>>
  >({});

  // Helper to update a column filter
  function setColFilter(col: keyof RecordItem, value: string) {
    setColFilters((prev) => ({ ...prev, [col]: value }));
  }

  // Filtered records with per-column filters & date ranges
  const filtered = useMemo(() => {
    let arr = (items ?? [])
      .filter(
        (r) =>
          includesAllFields(r, query) &&
          withinDateRange(r.Date_in, fromDate, toDate) &&
          withinDateRange(r.Date_out, dateOutFrom, dateOutTo),
      )
      .filter((r) =>
        Object.entries(colFilters).every(([k, v]) => {
          if (!v) return true;
          const val = normalize(r[k as keyof RecordItem]).toLowerCase();
          return val.includes(v.toLowerCase());
        }),
      )
      .slice();
    arr.sort((a, b) => {
      const da = new Date(a.Date_in).getTime();
      const db = new Date(b.Date_in).getTime();
      return db - da;
    });
    return arr;
  }, [items, query, fromDate, toDate, dateOutFrom, dateOutTo, colFilters]);

  useEffect(() => {
    loadVendorName()
      .then(setVendorName)
      .catch(() => setVendorName([]));
  }, []);

  // Add VendorNames using IndexedDB
  async function addVendorNamesItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const VendorNamesform = new FormData(e.currentTarget);
    const name = String(VendorNamesform.get("Name") || "");

    try {
      if (editingVendorNames) {
        await addOrUpdateVendorName({ id: editingVendorNames.id, name });
      } else {
        await addOrUpdateVendorName({ name } as VendorName);
      }
      const updated = await loadVendorName();
      setVendorName(updated);
      setEditingVendorNames(null);
      const form = e.currentTarget as HTMLFormElement;
      if (form) form.reset();
    } catch (err) {
      console.error("[addVendorNamesItem] failed", err);
    }
  }

  function handleEditVendorNames(s: VendorNameItem) {
    setEditingVendorNames(s);
  }

  function handleDeleteVendorNames(s: VendorNameItem) {
    setConfirmDeleteVendorNames(s);
  }

  async function confirmDeleteVendorNamesAction() {
    if (!confirmDeleteVendorNames) return;
    try {
      await deleteVendorName(confirmDeleteVendorNames.id);
      const updated = await loadVendorName();
      setVendorName(updated);
      setConfirmDeleteVendorNames(null);
    } catch (err) {
      console.error("[confirmDeleteVendorNamesAction] failed", err);
    }
  }

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  /* --- Save edit --- */
  async function saveEdit(updated: RecordItem) {
    try {
      await updateRecord(updated.id, updated);
      const updatedItems = await load();
      setItems(updatedItems);
      setEditing(null);
    } catch (err) {
      console.warn("[saveEdit] failed", err);
    }
  }

  async function saveOut(updated: RecordItem) {
    try {
      await updateRecord(updated.id, updated);
      const updatedItems = await load();
      setItems(updatedItems);
      setOut(null);
    } catch (err) {
      console.warn("[saveOut] failed", err);
    }
  }

  function onPrint() {
    window.print();
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto space-y-6 print:container-full">
        {/* Search & Table */}
        <Card>
          <div className="card-header no-print py-4 px-4 sm:px-6">
            <div className="flex flex-col gap-4">
              {/* Top Bar: Search Input, Advanced Search Toggle Button, Add, Print */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 grow">
                  {/* General Search Input */}
                  <div className="grid gap-1 grow sm:grow-0">
                    <Label htmlFor="search" className="text-xs font-semibold">
                      {t("searchAnyField")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="search"
                        className="w-full sm:w-72 md:w-80 h-10 text-sm pl-9"
                        placeholder={t("searchPlaceholder")}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                      <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Advanced Search Date Range Dropdown Box Button */}
                  <div className="grid gap-1">
                    <Label className="text-xs font-semibold opacity-0 hidden sm:block">
                      Filter
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowDateSearch(!showDateSearch)}
                      className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                        fromDate || toDate || dateOutFrom || dateOutTo
                          ? "bg-blue-600 text-white border-blue-500 shadow-blue-500/20"
                          : "bg-slate-800/80 light:bg-slate-100 hover:bg-slate-700/80 light:hover:bg-slate-200 text-slate-200 light:text-slate-800 border-white/10 light:border-slate-300"
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <span>{t("advancedSearch")}</span>
                      {(fromDate || toDate || dateOutFrom || dateOutTo) && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                      {showDateSearch ? (
                        <ChevronUp className="w-4 h-4 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Add Device & Print Buttons */}
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    size="sm"
                    className="h-10 px-4 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg font-semibold text-xs sm:text-sm transition-all"
                    onClick={() => setDataEntryOpen(true)}
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>{t("addJob")}</span>
                  </Button>
                  <Button
                    size="sm"
                    className="h-10 px-4 flex items-center justify-center gap-2 bg-slate-800 light:bg-slate-200 hover:bg-slate-700 light:hover:bg-slate-300 text-slate-200 light:text-slate-800 rounded-xl border border-white/10 light:border-slate-300 transition-colors text-xs sm:text-sm font-semibold"
                    onClick={onPrint}
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("printReport")}</span>
                  </Button>
                </div>
              </div>

              {/* Advanced Search Dropdown Box Panel */}
              <AnimatePresence>
                {showDateSearch && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-white/10 light:border-slate-200 pt-4 mt-1"
                  >
                    <div className="bg-slate-800/60 light:bg-slate-100/90 border border-white/10 light:border-slate-300 rounded-2xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-white light:text-slate-900">
                          <Filter className="w-4 h-4 text-emerald-400" />
                          <span>{t("advancedSearch")}</span>
                        </div>
                        {(fromDate || toDate || dateOutFrom || dateOutTo) && (
                          <button
                            type="button"
                            onClick={() => {
                              setFromDate("");
                              setToDate("");
                              setDateOutFrom("");
                              setDateOutTo("");
                            }}
                            className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20"
                          >
                            <RotateCcw className="w-3 h-3" />
                            {t("resetAllFilters")}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Section 1: Date In Range */}
                        <div className="space-y-2 bg-slate-900/40 light:bg-white p-3 rounded-xl border border-white/5 light:border-slate-200">
                          <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                            📥 {t("dateInFrom")} / {t("dateInTo")}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="grid gap-1">
                              <Label htmlFor="fromDate" className="text-xs font-medium text-slate-300 light:text-slate-700">
                                {t("dateInFrom")}
                              </Label>
                              <Input
                                id="fromDate"
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="h-9 text-xs w-full bg-slate-900 light:bg-white border-white/10 light:border-slate-300"
                              />
                            </div>
                            <div className="grid gap-1">
                              <Label htmlFor="toDate" className="text-xs font-medium text-slate-300 light:text-slate-700">
                                {t("dateInTo")}
                              </Label>
                              <Input
                                id="toDate"
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="h-9 text-xs w-full bg-slate-900 light:bg-white border-white/10 light:border-slate-300"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Date Out Range */}
                        <div className="space-y-2 bg-slate-900/40 light:bg-white p-3 rounded-xl border border-white/5 light:border-slate-200">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                            📦 {t("dateOutFrom")} / {t("dateOutTo")}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="grid gap-1">
                              <Label htmlFor="dateOutFrom" className="text-xs font-medium text-slate-300 light:text-slate-700">
                                {t("dateOutFrom")}
                              </Label>
                              <Input
                                id="dateOutFrom"
                                type="date"
                                value={dateOutFrom}
                                onChange={(e) => setDateOutFrom(e.target.value)}
                                className="h-9 text-xs w-full bg-slate-900 light:bg-white border-white/10 light:border-slate-300"
                              />
                            </div>
                            <div className="grid gap-1">
                              <Label htmlFor="dateOutTo" className="text-xs font-medium text-slate-300 light:text-slate-700">
                                {t("dateOutTo")}
                              </Label>
                              <Input
                                id="dateOutTo"
                                type="date"
                                value={dateOutTo}
                                onChange={(e) => setDateOutTo(e.target.value)}
                                className="h-9 text-xs w-full bg-slate-900 light:bg-white border-white/10 light:border-slate-300"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Presets Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 light:border-slate-200">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-slate-400 font-medium mr-1">Quick Presets:</span>
                          <button
                            type="button"
                            onClick={() => {
                              const today = new Date().toISOString().substring(0, 10);
                              setFromDate(today);
                              setToDate(today);
                            }}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-700/60 light:bg-slate-200 hover:bg-slate-700 text-slate-200 light:text-slate-800 transition-colors"
                          >
                            Today (In)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const today = new Date().toISOString().substring(0, 10);
                              setDateOutFrom(today);
                              setDateOutTo(today);
                            }}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-700/60 light:bg-slate-200 hover:bg-slate-700 text-slate-200 light:text-slate-800 transition-colors"
                          >
                            Today (Out)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const now = new Date();
                              const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0, 10);
                              const today = now.toISOString().substring(0, 10);
                              setFromDate(firstDay);
                              setToDate(today);
                            }}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-700/60 light:bg-slate-200 hover:bg-slate-700 text-slate-200 light:text-slate-800 transition-colors"
                          >
                            This Month (In)
                          </button>
                        </div>

                        {(fromDate || toDate || dateOutFrom || dateOutTo) && (
                          <button
                            type="button"
                            onClick={() => {
                              setFromDate("");
                              setToDate("");
                              setDateOutFrom("");
                              setDateOutTo("");
                            }}
                            className="text-xs font-semibold text-slate-400 hover:text-white underline"
                          >
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <CardContent className="px-4 pb-4 pt-2">
            <PrintTable
              VendorName={VendorName.sort((a, b) =>
                a.name.localeCompare(b.name),
              )}
              DEVICE_TYPES={DEVICE_TYPES}
              filtered={filtered}
              colFilters={colFilters}
              setColFilter={setColFilter}
              page={page}
              setPage={setPage}
              PAGE_SIZE={PAGE_SIZE}
              setEditing={setEditing}
              setOut={setOut}
              handleDeleteRecord={handleDeleteRecord}
            />
          </CardContent>
        </Card>
      </div>

      {/* ====== Edit Dialog (split sections, centered, wide) ====== */}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="bg-slate-900 border border-white/20 rounded-2xl shadow-2xl w-[96vw] max-w-5xl max-h-[92vh] overflow-y-auto p-4 md:p-6 text-slate-100"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-record-title"
          >
            <DialogHeader>
              <div className="flex flex-row items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <DialogTitle><span className="text-white text-xl font-bold">{t("editRecord")}</span></DialogTitle>
                  <DialogDescription>
                    <span className="text-slate-400 text-xs">{t("editRecordDesc")}</span>
                  </DialogDescription>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </DialogHeader>
            {editing && (
              <EditRecordDialog
                editing={editing}
                VendorName={VendorName.sort((a, b) =>
                  a.name.localeCompare(b.name),
                )}
                users={users}
                DEVICE_TYPES={DEVICE_TYPES}
                onClose={() => setEditing(null)}
                onSave={saveEdit}
                Field={Field}
                SelectField={SelectField}
              />
            )}
          </div>
        </div>
      </Dialog>

      {/* Delete confirm */}
      <DeleteDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        setItems={setItems}
        handleDeleteRecord={handleDeleteRecord}
        confirmDeleteRecordAction={confirmDeleteRecordAction}
        setConfirmDelete={setConfirmDelete}
        confirmDelete={confirmDelete}
        Button={Button}
        Trash2={Trash2}
      ></DeleteDialog>

      {/* ====== out Dialog (split sections, centered, wide) ====== */}
      <Dialog open={!!Out} onOpenChange={(open) => !open && setOut(null)}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="bg-slate-900 border border-white/20 rounded-2xl shadow-2xl w-[96vw] max-w-2xl max-h-[92vh] overflow-y-auto p-4 md:p-6 text-slate-100"
            role="dialog"
            aria-modal="true"
            aria-labelledby="out-record-title"
          >
            <DialogHeader>
              <div className="flex flex-row items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <DialogTitle><span className="text-white text-xl font-bold">{t("checkOutDetails")}</span></DialogTitle>
                  <DialogDescription>
                    <span className="text-slate-400 text-xs">{t("checkOutDetailsDesc")}</span>
                  </DialogDescription>
                </div>
                <button
                  type="button"
                  onClick={() => setOut(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </DialogHeader>
            {Out && (
              <OutRecordDialog
                Out={Out}
                VendorName={VendorName.sort((a, b) =>
                  a.name.localeCompare(b.name),
                )}
                users={users}
                onClose={() => setOut(null)}
                onSave={saveOut}
                Field={Field}
                SelectField={SelectField}
              />
            )}
          </div>
        </div>
      </Dialog>

      <DataEntryDialog
        open={dataEntryOpen}
        onOpenChange={setDataEntryOpen}
        onSuccess={refreshRecords}
      />
    </>
  );
}
