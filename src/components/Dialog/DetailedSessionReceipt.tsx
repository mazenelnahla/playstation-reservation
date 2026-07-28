import React, { useEffect, useState } from "react";
import Button from "../ui/Button";
import Dialog, { DialogHeader, DialogTitle, DialogDescription } from "../ui/Dialog";
import { Gamepad2, Clock, AlertTriangle, Coffee, X, Check, UserCheck, Printer } from "lucide-react";
import { DataRecord, fetchSessionOrders, SessionOrder } from "../../DataHandle/storage";
import AddSnackDialog from "./AddSnackDialog";

interface DetailedSessionReceiptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: DataRecord | null;
  onCheckout: (updated: DataRecord) => void;
}

export default function DetailedSessionReceipt({
  open,
  onOpenChange,
  session,
  onCheckout,
}: DetailedSessionReceiptProps) {
  const [orders, setOrders] = useState<SessionOrder[]>([]);
  const [snackDialogOpen, setSnackDialogOpen] = useState(false);

  const loadOrders = async () => {
    if (!session) return;
    try {
      const list = await fetchSessionOrders(session.id);
      setOrders(list);
    } catch (err) {
      console.error("Failed to load session orders:", err);
    }
  };

  useEffect(() => {
    if (open && session) {
      loadOrders();
    }
  }, [open, session]);

  if (!open || !session) return null;

  // Calculate times, booked hours, overtime delay
  const startTime = session.Date_in ? new Date(session.Date_in) : new Date();
  const bookedHours = parseFloat(session.ModelName) || 1; // ModelName stores booked hours
  const expectedEndMs = startTime.getTime() + bookedHours * 60 * 60 * 1000;
  const endMs = session.Date_out ? new Date(session.Date_out).getTime() : Date.now();
  const isOverdue = endMs > expectedEndMs;
  const overdueMinutes = isOverdue ? Math.floor((endMs - expectedEndMs) / (1000 * 60)) : 0;
  
  // Base hourly price calculation using Admin configured rates
  let hourlyRate = 30; // fallback default
  const savedRates = localStorage.getItem("hourly_station_rates");
  if (savedRates) {
    try {
      const rates = JSON.parse(savedRates);
      if (session.Device_Type && rates[session.Device_Type]) {
        hourlyRate = rates[session.Device_Type];
      }
    } catch (e) {}
  }
  const baseSessionPrice = bookedHours * hourlyRate;
  
  // Overtime charging rate calculation from Admin settings
  let overtimeRateMode = "standard";
  let customRatePerMin = 1.0;
  let overtimeMultiplier = 1.5;

  const savedOvertimeCfg = localStorage.getItem("overtime_charging_rate");
  if (savedOvertimeCfg) {
    try {
      const cfg = JSON.parse(savedOvertimeCfg);
      if (cfg.mode) overtimeRateMode = cfg.mode;
      if (cfg.customRatePerMin !== undefined) customRatePerMin = parseFloat(cfg.customRatePerMin) || 1.0;
      if (cfg.multiplier !== undefined) overtimeMultiplier = parseFloat(cfg.multiplier) || 1.5;
    } catch (e) {}
  }

  let delayPenaltyFee = 0;
  if (isOverdue) {
    if (overtimeRateMode === "fixed") {
      delayPenaltyFee = Math.ceil(overdueMinutes * customRatePerMin);
    } else if (overtimeRateMode === "multiplier") {
      delayPenaltyFee = Math.ceil(overdueMinutes * ((hourlyRate * overtimeMultiplier) / 60));
    } else {
      delayPenaltyFee = Math.ceil(overdueMinutes * (hourlyRate / 60));
    }
  }

  // Snacks and Drinks Total
  const snacksTotal = orders.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Grand Total Calculation
  const grandTotal = baseSessionPrice + delayPenaltyFee + snacksTotal;

  // Staff on duty
  const loggedInEmployee = localStorage.getItem("username") || session.DoneBy || "Shift Staff";

  const handleConfirmCheckout = () => {
    const nowIso = new Date().toISOString();
    const updated: DataRecord = {
      ...session,
      Date_out: nowIso,
      DoneBy: loggedInEmployee,
      MaintinancePrice: String(grandTotal),
      Notes: overdueMinutes > 0 ? `Overdue by ${overdueMinutes} mins. Penalty: ${delayPenaltyFee} EGP. ${session.Notes || ""}` : session.Notes,
    };
    onCheckout(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div id="print-area" className="bg-slate-900 light:bg-white border border-emerald-500/30 light:border-slate-300 rounded-2xl shadow-2xl w-[96vw] max-w-xl max-h-[92vh] overflow-y-auto p-4 md:p-6 text-slate-100 light:text-slate-900 print:bg-white print:text-black print:border-0 print:shadow-none print:w-full print:max-w-none print:p-0">
            <DialogHeader>
              <div className="flex items-center justify-between border-b border-white/10 light:border-slate-200 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/20 light:bg-emerald-100 border border-emerald-500/30 text-emerald-400 light:text-emerald-700 no-print">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white light:text-slate-900 print:text-black flex items-center gap-2">
                      Station Receipt & Checkout
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400 light:text-slate-600 print:text-slate-700">
                      Station: <strong className="text-emerald-400 light:text-emerald-700 print:text-black">{session.Device_Type} - {session.VendorName}</strong>
                    </DialogDescription>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-lg text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-slate-800 light:hover:bg-slate-100 transition-colors no-print"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {/* Customer & Staff Info */}
              <div className="grid grid-cols-2 gap-3 bg-slate-800/60 light:bg-slate-100 p-3 rounded-xl border border-white/5 light:border-slate-200 text-xs print:bg-slate-50 print:border-slate-300 print:text-black">
                <div>
                  <span className="text-slate-400 light:text-slate-600 print:text-slate-600 block">Customer Name:</span>
                  <strong className="text-white light:text-slate-900 print:text-black text-sm">{session.CustomerName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 light:text-slate-600 print:text-slate-600 block">Phone Number:</span>
                  <strong className="text-slate-300 light:text-slate-800 print:text-black">{session.CustomerPhoneNumber || "N/A"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 light:text-slate-600 print:text-slate-600 block">Start Time:</span>
                  <strong className="text-slate-300 light:text-slate-800 print:text-black">{new Date(session.Date_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                </div>
                <div>
                  <span className="text-slate-400 light:text-slate-600 print:text-slate-600 block">Registered Employee (Shift):</span>
                  <strong className="text-blue-400 light:text-blue-700 print:text-black flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 no-print" />
                    {loggedInEmployee}
                  </strong>
                </div>
              </div>

              {/* Session Time & Overtime Delay Status */}
              <div className="bg-slate-800/80 light:bg-slate-100 p-4 rounded-xl border border-white/10 light:border-slate-200 space-y-2 print:bg-slate-50 print:border-slate-300 print:text-black">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 light:text-slate-600 print:text-slate-600 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-400 light:text-blue-600 no-print" />
                    Booked Duration:
                  </span>
                  <span className="font-bold text-white light:text-slate-900 print:text-black">{bookedHours} Hour(s) ({baseSessionPrice} EGP)</span>
                </div>

                {isOverdue && (
                  <div className="flex items-center justify-between text-xs bg-red-500/20 light:bg-red-50 p-2.5 rounded-lg border border-red-500/40 light:border-red-200 text-red-300 light:text-red-800 print:bg-red-50 print:text-red-800 print:border-red-300">
                    <span className="flex items-center gap-1 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-red-400 light:text-red-600 animate-pulse no-print" />
                      Overdue Delay ({overdueMinutes} mins overstay):
                    </span>
                    <strong className="text-red-400 light:text-red-700 print:text-red-800 font-bold">+ {delayPenaltyFee} EGP</strong>
                  </div>
                )}
              </div>

              {/* Snacks & Drinks Breakdown */}
              <div className="bg-slate-800/80 light:bg-slate-100 p-4 rounded-xl border border-white/10 light:border-slate-200 space-y-3 print:bg-slate-50 print:border-slate-300 print:text-black">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 light:text-amber-700 print:text-black flex items-center gap-1.5 uppercase tracking-wider">
                    <Coffee className="w-4 h-4 no-print" />
                    Ordered Snacks & Drinks
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSnackDialogOpen(true)}
                    className="text-xs font-semibold text-amber-300 light:text-amber-800 hover:text-amber-200 bg-amber-500/20 light:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-500/30 light:border-amber-300 flex items-center gap-1 no-print"
                  >
                    + Add / Edit Snacks
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-slate-500 light:text-slate-500 italic text-center py-2">No snacks or beverages added to receipt.</p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 print:max-h-none print:overflow-visible">
                    {orders.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs text-slate-300 light:text-slate-800 print:text-black bg-slate-900/60 light:bg-white p-2 rounded border border-white/5 light:border-slate-200">
                        <span>{item.quantity}x {item.itemName}</span>
                        <strong className="text-amber-300 light:text-amber-700 print:text-black">{item.price * item.quantity} EGP</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Financial Grand Total */}
              <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 light:from-emerald-50 light:to-emerald-100/50 print:from-slate-100 print:to-slate-100 p-4 rounded-xl border border-emerald-500/40 light:border-emerald-300 print:border-slate-400 text-emerald-300 light:text-emerald-900 print:text-black space-y-2">
                <div className="flex justify-between text-xs text-slate-300 light:text-slate-700 print:text-slate-700">
                  <span>Base Gaming Session:</span>
                  <span>{baseSessionPrice} EGP</span>
                </div>
                {delayPenaltyFee > 0 && (
                  <div className="flex justify-between text-xs text-red-300 light:text-red-700 print:text-red-700">
                    <span>Overtime Penalty Fee:</span>
                    <span>+{delayPenaltyFee} EGP</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-amber-300 light:text-amber-800 print:text-slate-700">
                  <span>Drinks & Snacks Total:</span>
                  <span>+{snacksTotal} EGP</span>
                </div>
                <div className="border-t border-emerald-500/30 light:border-emerald-300 print:border-slate-400 pt-2 flex justify-between items-center text-lg font-extrabold text-white light:text-slate-900 print:text-black">
                  <span>Grand Total Bill:</span>
                  <span className="text-2xl text-emerald-400 light:text-emerald-700 print:text-black">{grandTotal} EGP</span>
                </div>
              </div>

              {/* Receipt Action Buttons */}
              <div className="flex items-center gap-3 pt-2 no-print">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="w-1/4 h-10 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handlePrint}
                  className="w-1/3 h-10 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmCheckout}
                  className="flex-1 h-10 text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  <Check className="w-4 h-4" />
                  Confirm Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      <AddSnackDialog
        open={snackDialogOpen}
        onOpenChange={setSnackDialogOpen}
        session={session}
        onOrdersUpdated={loadOrders}
      />
    </>
  );
}
