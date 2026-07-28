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

function formatCompactDateTime(dateStr: string | undefined) {
  if (!dateStr || dateStr.trim() === "") return { date: "—", time: "" };
  const str = dateStr.trim();

  // If string contains ISO timestamp format "2026-07-28T16:16:25" or space
  if (str.includes("T") || str.includes(" ")) {
    const parts = str.split(/[T ]/);
    const datePart = parts[0];
    const timePart = parts[1] ? parts[1].substring(0, 5) : "";
    return {
      date: datePart,
      time: timePart ? formatTime12h(timePart) : "",
    };
  }

  return { date: str, time: "" };
}

interface PrintTableProps {
  filtered: RecordItem[];
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  PAGE_SIZE: number;
  setOut: (record: RecordItem | null) => void;
  setEditing: (record: RecordItem | null) => void;
  handleDeleteRecord: (s: RecordItem) => void;
}

export default function PrintTable({
  filtered,
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
  const [showMissingOut, setShowMissingOut] = useState(false);

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
      // if record has no Date_out, exclude when range is set
      if (!r.Date_out || r.Date_out.toString().trim() === "") return false;
      const rec = new Date(r.Date_out);
      // normalize times by zeroing time portion
      const recTime = new Date(
        rec.getFullYear(),
        rec.getMonth(),
        rec.getDate(),
      ).getTime();
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

      <div
        className="overflow-x-auto rounded-2xl border border-white/10 light:border-slate-300 shadow-xl print:border-0 print:overflow-visible bg-slate-900/90 light:bg-white"
        id="print-area"
        ref={printRef}
        style={{
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
      >
        {/* Compact print header */}
        <div className="mb-2 hidden print:flex print:justify-between print:items-center p-2">
          <div className="text-base font-bold text-slate-900">
            Session & Gaming Records History ({displayList.length} items)
          </div>
          <div className="text-xs text-slate-700">
            Total Revenue:{" "}
            <span className="font-bold text-emerald-700">
              EGP {totalProfitFormatted}
            </span>
            {" — "} {format(new Date(), "yyyy-MM-dd")} —{" "}
            {formatTime12h(format(new Date(), "HH:mm"))}
          </div>
        </div>

        <table className="w-full text-xs md:text-sm print-table text-slate-200 light:text-slate-900 border-collapse">
          <thead className="bg-slate-950 light:bg-slate-100 text-slate-300 light:text-slate-800 text-center font-bold">
            {/* Column headers */}
            <tr className="border-b border-white/10 light:border-slate-300">
              <th className="px-3 py-3 font-extrabold uppercase text-[11px] tracking-wider text-emerald-400 light:text-emerald-800">#</th>
              <th className="px-3 py-3 font-extrabold uppercase text-[11px] tracking-wider text-slate-300 light:text-slate-800">{t("colDateIn")}</th>
              <th className="px-3 py-3 font-extrabold uppercase text-[11px] tracking-wider text-slate-300 light:text-slate-800">{t("colCustomerName")}</th>
              <th className="px-3 py-3 font-extrabold uppercase text-[11px] tracking-wider text-slate-300 light:text-slate-800">{t("colCustomerPhone")}</th>
              <th className="px-3 py-3 font-extrabold uppercase text-[11px] tracking-wider text-slate-300 light:text-slate-800">{t("colDeviceType")}</th>
              <th className="px-3 py-3 font-extrabold uppercase text-[11px] tracking-wider text-slate-300 light:text-slate-800">{t("colVendor")}</th>
              <th className="px-3 py-3 font-extrabold uppercase text-[11px] tracking-wider text-slate-300 light:text-slate-800">{t("colModel")}</th>
              <th className="px-3 py-3 font-extrabold uppercase text-[11px] tracking-wider text-slate-300 light:text-slate-800">{t("colIssue")}</th>
              <th className="px-3 py-3 font-extrabold uppercase text-[11px] tracking-wider text-slate-300 light:text-slate-800">{t("colTechnician")}</th>
              <th className="px-3 py-3 font-extrabold uppercase text-[11px] tracking-wider text-emerald-400 light:text-emerald-800">{t("colCost")}</th>
              <th className="px-3 py-3 font-extrabold uppercase text-[11px] tracking-wider text-slate-300 light:text-slate-800">{t("colDateOut")}</th>
              <th className="px-3 py-3 font-extrabold uppercase text-[11px] tracking-wider text-slate-300 light:text-slate-800">{t("colNotes")}</th>
              <th className="px-3 py-3 font-extrabold uppercase text-[11px] tracking-wider text-slate-300 light:text-slate-800 no-print">{t("colActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 light:divide-slate-200">
            {displayList.length === 0 && (
              <tr>
                <td
                  colSpan={20}
                  className="px-4 py-8 text-center text-slate-400 light:text-slate-500 font-medium"
                >
                  No session records found matching current query or filters.
                </td>
              </tr>
            )}
            <AnimatePresence>
              {displayList.map((r, idx) => {
                const displayIndex = idx + 1; // UI-only index (1-based)
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
                        ? "bg-amber-950/40 light:bg-amber-100/90 text-white light:text-slate-900 border-l-4 border-l-amber-500"
                        : "hover:bg-white/5 light:hover:bg-slate-100 bg-slate-900/40 light:bg-white text-slate-200 light:text-slate-900"
                    } ${isVisible ? "" : "hidden print:table-row"}`}
                  >
                    <td className="px-3 py-3 font-bold text-center text-emerald-400 light:text-emerald-700">{displayIndex}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {(() => {
                        const { date, time } = formatCompactDateTime(r.Date_in);
                        return (
                          <div className="flex flex-col text-xs">
                            <span className="font-semibold text-slate-200 light:text-slate-900">{date}</span>
                            {time && <span className="text-[11px] font-mono text-emerald-400 light:text-emerald-700">{time}</span>}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-3 font-semibold text-white light:text-slate-900">{r.CustomerName || "—"}</td>
                    <td className="px-3 py-3 relative group">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-slate-300 light:text-slate-700">{r.CustomerPhoneNumber || "—"}</span>
                        {r.CustomerPhoneNumber && (
                          <button
                            onClick={() =>
                              copyToClipboard(r.CustomerPhoneNumber, r.id)
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-slate-700 light:hover:bg-slate-200 no-print text-slate-400 hover:text-white"
                            title="Copy Phone Number"
                            type="button"
                          >
                            {copiedId === r.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-800 border border-white/10 light:border-slate-300">
                        {r.Device_Type || "Room / Station"}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-300 light:text-slate-700">{r.VendorName || "—"}</td>
                    <td className="px-3 py-3 font-medium text-slate-300 light:text-slate-700">{r.ModelName || "—"}</td>
                    <td className="px-3 py-3 max-w-[12rem] break-words text-slate-300 light:text-slate-700">{r.issue || "—"}</td>
                    <td className="px-3 py-3 font-semibold text-blue-400 light:text-blue-600">{r.DoneBy || "—"}</td>
                    <td className="px-3 py-3 font-extrabold text-emerald-400 light:text-emerald-700 text-right whitespace-nowrap">
                      {r.MaintinancePrice ? `EGP ${r.MaintinancePrice}` : "—"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {isMissingDateOut ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Active Session
                        </span>
                      ) : (
                        (() => {
                          const { date, time } = formatCompactDateTime(r.Date_out);
                          return (
                            <div className="flex flex-col text-xs">
                              <span className="font-semibold text-slate-200 light:text-slate-900">{date}</span>
                              {time && <span className="text-[11px] font-mono text-blue-400 light:text-blue-700">{time}</span>}
                            </div>
                          );
                        })()
                      )}
                    </td>
                    <td
                      className="px-3 py-3 break-words max-w-[14rem] text-slate-400 light:text-slate-600 text-xs"
                      title={typeof r.Notes === "string" ? r.Notes : undefined}
                    >
                      {r.Notes || "—"}
                    </td>
                    <td className="px-3 py-3 no-print whitespace-nowrap">
                      <div className="flex items-center gap-1.5 justify-center">
                        <Button
                          size="sm"
                          className="h-8 px-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg"
                          onClick={() => setOut(r)}
                          title={t("checkout")}
                        >
                          <LogOutIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-white/10"
                          onClick={() => setEditing(r)}
                          title={t("edit")}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 px-2 bg-red-600/80 hover:bg-red-600 rounded-lg"
                          onClick={() => {
                            handleDeleteRecord(r);
                          }}
                          title={t("delete")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
        <div className="flex items-center justify-between mt-4 no-print bg-slate-900/80 light:bg-slate-100 p-3 rounded-xl border border-white/10 light:border-slate-300">
          <Button
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-40"
          >
            Previous
          </Button>
          <span className="text-xs font-semibold text-slate-300 light:text-slate-800">
            Page <span className="text-white light:text-slate-900 font-bold">{page + 1}</span> of {Math.ceil(displayList.length / PAGE_SIZE)}
          </span>
          <Button
            size="sm"
            disabled={(page + 1) * PAGE_SIZE >= displayList.length}
            onClick={() => setPage((p) => p + 1)}
            className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-40"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
