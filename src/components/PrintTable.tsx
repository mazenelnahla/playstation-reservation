import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Button from "./ui/Button";
import Input from "./ui/Input";
import {
  Pencil,
  Trash2,
  Copy,
  Check,
  Gamepad2,
  LogOutIcon,
} from "lucide-react";
import { DataRecord } from "../DataHandle/storage";
import { useLanguage } from "../context/LanguageContext";
/* ====== Types ====== */
type RecordItem = DataRecord;

function formatTime12h(time: string) {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${h}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

interface PrintTableProps {
  filtered: RecordItem[];
  DEVICE_TYPES: string[];
  VendorName?: { id: number; name: string }[];
  colFilters: Partial<Record<keyof RecordItem, string>>;
  setColFilter: (col: keyof RecordItem, value: string) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  PAGE_SIZE: number;
  setOut: (record: RecordItem | null) => void;
  setEditing: (record: RecordItem | null) => void;
  handleDeleteRecord: (s: RecordItem) => void;
}

export default function PrintTable({
  filtered,
  VendorName = [],
  colFilters,
  setColFilter,
  DEVICE_TYPES,
  page,
  setPage,
  PAGE_SIZE,
  setOut,
  setEditing,
  handleDeleteRecord,
}: PrintTableProps) {
  const { t } = useLanguage();
  const printRef = useRef<HTMLDivElement | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showMissingOut, setShowMissingOut] = useState(false);

  // new: date-out range filter state
  const [dateOutFrom, setDateOutFrom] = useState<string>("");
  const [dateOutTo, setDateOutTo] = useState<string>("");

  const copyToClipboard = async (text: string, recordId: number) => {
    try {
      // Use modern clipboard API in secure contexts (HTTPS, localhost)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts (HTTP)
        const textArea = document.createElement("textarea");
        textArea.value = text;
        // Make the textarea out of sight
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedId(recordId);
      setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // You might want to show a user-facing error message here
    }
  };

  // compute displayList applying quick filter and optional Date_out range
  const displayList = filtered
    // apply showMissingOut first if active
    .filter((r) =>
      showMissingOut
        ? !r.Date_out || r.Date_out.toString().trim() === ""
        : true,
    )
    // apply Date_out range if either boundary is set
    .filter((r) => {
      if (!dateOutFrom && !dateOutTo) return true;
      // if record has no Date_out, exclude when range is set
      if (!r.Date_out || r.Date_out.toString().trim() === "") return false;
      const rec = new Date(r.Date_out);
      // normalize times by zeroing time portion
      const recTime = new Date(
        rec.getFullYear(),
        rec.getMonth(),
        rec.getDate(),
      ).getTime();
      if (dateOutFrom) {
        const from = new Date(dateOutFrom);
        const fromTime = new Date(
          from.getFullYear(),
          from.getMonth(),
          from.getDate(),
        ).getTime();
        if (recTime < fromTime) return false;
      }
      if (dateOutTo) {
        const to = new Date(dateOutTo);
        const toTime = new Date(
          to.getFullYear(),
          to.getMonth(),
          to.getDate(),
        ).getTime();
        if (recTime > toTime) return false;
      }
      return true;
    });

  // new: sum MaintinancePrice safely (handles string or number)
  const totalProfit = displayList.reduce((acc, r) => {
    const v = (r as any).MaintinancePrice;
    let num = 0;
    if (typeof v === "number") num = v;
    else if (typeof v === "string") {
      const cleaned = v.replace(/[^0-9.-]+/g, "");
      const parsed = parseFloat(cleaned);
      num = isFinite(parsed) ? parsed : 0;
    }
    return acc + (isFinite(num) ? num : 0);
  }, 0);

  const totalProfitFormatted = totalProfit.toFixed(2);

  return (
    <div>
      {/* Sleek Table Header Toolbar (no-print) */}
      <div className="mb-4 no-print flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={() => {
            setShowMissingOut((s) => {
              setPage(0);
              return !s;
            });
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs sm:text-sm font-semibold shadow-sm ${
            showMissingOut
              ? "bg-amber-500 text-white border-amber-400 shadow-amber-500/20"
              : "bg-slate-800/80 light:bg-slate-100 text-slate-200 light:text-slate-800 border-white/10 light:border-slate-300 hover:bg-slate-700/80"
          }`}
          title="Show active sessions currently in progress (Date Out empty)"
          type="button"
        >
          <Gamepad2 className="h-4 w-4" aria-hidden />
          <span>{t("underMaintenance")}</span>
          {showMissingOut && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
        </button>

        <div className="text-xs font-semibold text-slate-400">
          {t("showingRecords")} <span className="text-slate-100 light:text-slate-900 font-bold">{displayList.length}</span> {t("records")}
        </div>
      </div>

      <div
        className="overflow-auto rounded-2xl border border-slate-200 print:border-0 print:overflow-visible"
        id="print-area"
        ref={printRef}
        style={{
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
      >
        {/* Compact print header */}
        <div className="mb-1 hidden print:flex print:justify-between print:items-center">
          <div className="text-base font-semibold ">
            Report - Items: {displayList.length}
          </div>
          <div className="text-xs text-slate-600 ">
            Total Profit:{" "}
            <span className="font-semibold text-indigo-600">
              {totalProfitFormatted}
            </span>
            {" — "} {format(new Date(), "yyyy-MM-dd")} —{" "}
            {formatTime12h(format(new Date(), "HH:mm"))}
          </div>
        </div>

        <table className="w-full text-xs md:text-sm print-table text-black">
          <thead className="bg-slate-50 print:bg-white text-center">
            {/* Column headers */}
            <tr>
              <th className="px-3 py-2">{t("colId")}</th>
              <th className="px-3 py-2">{t("colDateIn")}</th>
              <th className="px-3 py-2">{t("colCustomerName")}</th>
              <th className="px-3 py-2">{t("colCustomerPhone")}</th>
              <th className="px-3 py-2">{t("colDeviceType")}</th>
              <th className="px-3 py-2">{t("colVendor")}</th>
              <th className="px-3 py-2">{t("colModel")}</th>
              <th className="px-3 py-2">{t("colIssue")}</th>
              <th className="px-3 py-2">{t("colTechnician")}</th>
              <th className="px-3 py-2">{t("colCost")}</th>
              <th className="px-3 py-2">{t("colDateOut")}</th>
              <th className="px-3 py-2">{t("colNotes")}</th>
              <th className="px-3 py-2 no-print">{t("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {displayList.length === 0 && (
              <tr>
                <td
                  colSpan={20}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  No search results
                </td>
              </tr>
            )}
            <AnimatePresence>
              {displayList.map((r, idx) => {
                const displayIndex = idx + 1; // UI-only index (1-based) — not linked to DB
                // Only show current page in screen, show all in print
                const isVisible =
                  idx >= page * PAGE_SIZE && idx < (page + 1) * PAGE_SIZE;
                const isMissingDateOut =
                  !r.Date_out || r.Date_out.toString().trim() === "";
                return (
                  <motion.tr
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      WebkitPrintColorAdjust: "exact",
                      printColorAdjust: "exact",
                    }}
                    className={`${
                      isMissingDateOut
                        ? "bg-red-100 print:bg-red-100"
                        : "odd:bg-white even:bg-slate-50"
                    } ${isVisible ? "" : "hidden print:table-row"}`}
                  >
                    <td className="px-3 py-2">{displayIndex}</td>
                    <td className="px-3 py-2">{r.Date_in}</td>
                    <td className="px-3 py-2">{r.CustomerName}</td>
                    <td className="px-3 py-2 relative group">
                      <div className="flex items-center justify-between">
                        <span className="flex-1">{r.CustomerPhoneNumber}</span>
                        <button
                          onClick={() =>
                            copyToClipboard(r.CustomerPhoneNumber, r.id)
                          }
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2 p-1 rounded hover:bg-slate-200 no-print"
                          title="Copy Customer Phone Number"
                          type="button"
                        >
                          {copiedId === r.id ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-slate-600" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">{r.Device_Type}</td>
                    <td className="px-3 py-2">{r.VendorName}</td>
                    <td className="px-3 py-2">{r.ModelName}</td>
                    <td className="px-3 py-2">{r.issue}</td>
                    <td className="px-3 py-2">{r.DoneBy}</td>
                    <td className="px-3 py-2">{r.MaintinancePrice}</td>
                    <td className="px-3 py-2">{r.Date_out}</td>
                    <td
                      className="px-3 py-2 break-words whitespace-normal max-w-[20rem] print:max-w-[12rem]"
                      title={typeof r.Notes === "string" ? r.Notes : undefined}
                    >
                      {r.Notes}
                    </td>
                    <td className="px-3 py-2 no-print">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="btn-warning"
                          onClick={() => setOut(r)}
                          title={t("checkout")}
                        >
                          <LogOutIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setEditing(r)}
                          title={t("edit")}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            handleDeleteRecord(r);
                          }}
                          title={t("delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {/* Pagination controls outside table, not printed */}
      {displayList.length > PAGE_SIZE && (
        <div className=" flex justify-center gap-2 mt-4 no-print">
          <Button
            size="sm"
            disabled={(page + 1) * PAGE_SIZE >= displayList.length}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
          <span className="self-center text-xs">
            Page {page + 1} of {Math.ceil(displayList.length / PAGE_SIZE)}
          </span>
          <Button
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
        </div>
      )}
    </div>
  );
}
