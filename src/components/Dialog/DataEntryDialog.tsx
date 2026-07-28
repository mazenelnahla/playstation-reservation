import React, { useState, useEffect, useMemo } from "react";
import Button from "../ui/Button";
import Field from "../ui/Field";
import SelectField from "../ui/SelectField";
import Dialog, {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import { Save, PlusCircle, X, AlertTriangle } from "lucide-react";
import {
  createRecord,
  load,
  fetchMaintenanceLogs,
  MaintenanceLog,
  DataRecord,
} from "../../DataHandle/storage";
import { loadVendorName, VendorName } from "../../DataHandle/VendorName";
import { useLanguage } from "../../context/LanguageContext";

interface DataEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}


export default function DataEntryDialog({
  open,
  onOpenChange,
  onSuccess,
}: DataEntryDialogProps) {
  const { t } = useLanguage();
  const [formKey, setFormKey] = useState(0);
  const [vendorNames, setVendorNames] = useState<VendorName[]>([]);
  const [downDevices, setDownDevices] = useState<Set<string>>(new Set());
  const [selectedVendor, setSelectedVendor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedStation, setSelectedStation] = useState("PS5 Station");
  const [bookedHours, setBookedHours] = useState("1");
  const [errorMsg, setErrorMsg] = useState("");

  // Read admin configured rates or fallback defaults
  const [hourlyRates, setHourlyRates] = useState<{ [key: string]: number }>({
    "PS5 Station": 30,
    "PS4 Station": 20,
    "VIP Room": 50,
    "Gaming PC": 25,
  });

  const loggedInEmployee = localStorage.getItem("username") || "Shift Staff";

  const [inUseDevices, setInUseDevices] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setErrorMsg("");
      Promise.all([loadVendorName(), fetchMaintenanceLogs(), load()])
        .then(([vNames, mLogs, records]) => {
          setVendorNames(vNames || []);
          if (vNames && vNames.length > 0) {
            setSelectedVendor(vNames[0].name);
          }

          // Devices down for maintenance
          const downSet = new Set(
            (mLogs || [])
              .filter((m) => m.status === "Under Maintenance")
              .map((m) => m.deviceName)
          );
          setDownDevices(downSet);

          // Devices currently in active sessions
          const activeSet = new Set(
            (records || [])
              .filter((r: DataRecord) => !r.Date_out || r.Date_out.trim() === "")
              .map((r: DataRecord) => r.VendorName)
          );
          setInUseDevices(activeSet);
        })
        .catch(() => {
          setVendorNames([]);
          setDownDevices(new Set());
          setInUseDevices(new Set());
        });

      const savedRates = localStorage.getItem("hourly_station_rates");
      if (savedRates) {
        try {
          setHourlyRates(JSON.parse(savedRates));
        } catch (e) {}
      }
    }
  }, [open]);

  // Sync device model selection when station type changes to pick first available device linked to selectedStation
  useEffect(() => {
    if (vendorNames.length > 0) {
      // Find devices linked to the selected station type (or matching station name)
      const matchingStationVendors = vendorNames.filter(
        (v) => (v.stationType || "").trim() === selectedStation.trim() || !v.stationType
      );
      const available = matchingStationVendors.filter(
        (v) => !inUseDevices.has(v.name) && !downDevices.has(v.name)
      );
      const candidates = available.length > 0 ? available : matchingStationVendors.length > 0 ? matchingStationVendors : vendorNames;
      const nextVendor = candidates[0].name;
      if (nextVendor !== selectedVendor) {
        setSelectedVendor(nextVendor);
      }
    }
  }, [selectedStation, vendorNames, selectedVendor, inUseDevices, downDevices]);

  const currentRate = hourlyRates[selectedStation] || 30;
  const calculatedPrice = parseFloat(bookedHours) * currentRate;

  // Dynamically derive station types from Admin configured rates & categories
  const stationTypes = useMemo(() => {
    const rateKeys = Object.keys(hourlyRates);
    if (rateKeys.length > 0) return rateKeys;
    return ["PS5 Station", "PS4 Station", "VIP Room", "Gaming PC"];
  }, [hourlyRates]);

  useEffect(() => {
    if (stationTypes.length > 0) {
      // Find the first station type that has available (non-busy & non-down) devices
      const activeType = stationTypes.find((st) => {
        const linked = vendorNames.filter((v) => (v.stationType || "").trim() === st.trim());
        return linked.length === 0 || linked.some((v) => !inUseDevices.has(v.name) && !downDevices.has(v.name));
      }) || stationTypes[0];

      if (selectedStation !== activeType && !stationTypes.includes(selectedStation)) {
        setSelectedStation(activeType);
      }
    }
  }, [stationTypes, selectedStation, vendorNames, inUseDevices, downDevices]);

  async function addItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    const targetVendor = selectedVendor || String(new FormData(e.currentTarget).get("VendorName") || "Standard");

    if (downDevices.has(targetVendor)) {
      setErrorMsg(`⚠️ Station "${targetVendor}" is currently DOWN FOR MAINTENANCE and cannot be assigned.`);
      return;
    }

    if (inUseDevices.has(targetVendor)) {
      setErrorMsg(`⚠️ Station "${targetVendor}" is CURRENTLY IN USE by another session. Please select an available station.`);
      return;
    }

    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    
    // Automatically record current ISO time if not specified
    const dateInIso = new Date().toISOString();

    const recordData = {
      Date_in: String(form.get("Date_in") || dateInIso),
      CustomerName: String(form.get("CustomerName") || "Guest Customer"),
      CustomerPhoneNumber: String(form.get("CustomerPhoneNumber") || ""),
      Device_Type: selectedStation,
      VendorName: targetVendor,
      ModelName: bookedHours, // ModelName stores registered hours
      issue: String(form.get("issue") || "Gaming Session"),
      MaintinancePrice: String(calculatedPrice),
      DoneBy: loggedInEmployee, // Automatic employee shift log
      Date_out: "",
      Notes: String(form.get("Notes") || ""),
    };

    try {
      await createRecord(recordData);
      setFormKey((k) => k + 1);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("[DataEntryDialog addItem] failed", err);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
        <div
          className="bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl w-[96vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6 pb-28 md:pb-6 text-slate-100 my-auto"
          role="dialog"
          aria-modal="true"
        >
          <DialogHeader>
            <div className="flex flex-row items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  🎮 Register New Gaming Session
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Select station, booked hours, customer info. Rate: <strong className="text-emerald-400">{currentRate} EGP/hr</strong> | Staff: <strong className="text-blue-400">{loggedInEmployee}</strong>
                </DialogDescription>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          <form key={formKey} onSubmit={addItem} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field
                id="CustomerName"
                name="CustomerName"
                label="Customer Name"
                placeholder="e.g. Ahmed"
                required
              />
              <Field
                id="CustomerPhoneNumber"
                name="CustomerPhoneNumber"
                label="Customer Phone"
                placeholder="010..."
              />
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Station Type / Room</label>
                <select
                  name="Device_Type"
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full h-10 bg-slate-800 border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {stationTypes.map((st: string) => {
                    const linkedDevices = vendorNames.filter(
                      (v) => (v.stationType || "").trim() === st.trim()
                    );
                    // Check if all devices linked to this station type are in use or down
                    const hasAvailable = linkedDevices.some(
                      (v) => !inUseDevices.has(v.name) && !downDevices.has(v.name)
                    );
                    const isStationDisabled = linkedDevices.length > 0 && !hasAvailable;

                    return (
                      <option
                        key={st}
                        value={st}
                        disabled={isStationDisabled}
                        className={isStationDisabled ? "text-slate-500 bg-slate-900" : ""}
                      >
                        {st} ({hourlyRates[st] || 30} EGP/hr){" "}
                        {isStationDisabled ? "🎮 [All Devices in Use / Unavailable]" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Device Model / Category</label>
                <select
                  name="VendorName"
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="w-full h-10 bg-slate-800 border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {(() => {
                    const filteredVendors = vendorNames.filter(
                      (v) => (v.stationType || "").trim() === selectedStation.trim() || !v.stationType
                    );
                    const listToDisplay = filteredVendors.length > 0 ? filteredVendors : vendorNames;

                    return listToDisplay.map((v) => {
                      const isDown = downDevices.has(v.name);
                      const isInUse = inUseDevices.has(v.name);
                      const isDisabled = isDown || isInUse;
                      return (
                        <option
                          key={v.id}
                          value={v.name}
                          disabled={isDisabled}
                          className={isDisabled ? "text-slate-500 bg-slate-900" : ""}
                        >
                          {v.name}{" "}
                          {isDown
                            ? "🛠️ [Down for Maintenance]"
                            : isInUse
                            ? "🎮 [Currently in Use]"
                            : ""}
                        </option>
                      );
                    });
                  })()}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Booked Duration & Calculated Price</label>
                <select
                  name="ModelName"
                  value={bookedHours}
                  onChange={(e) => setBookedHours(e.target.value)}
                  className="w-full h-10 bg-slate-800 border border-emerald-500/40 font-bold rounded-xl px-3 text-sm text-emerald-400 focus:outline-none focus:border-emerald-500"
                >
                  <option value="1">1 Hour ({currentRate * 1} EGP)</option>
                  <option value="2">2 Hours ({currentRate * 2} EGP)</option>
                  <option value="3">3 Hours ({currentRate * 3} EGP)</option>
                  <option value="4">4 Hours ({currentRate * 4} EGP)</option>
                  <option value="5">5 Hours ({currentRate * 5} EGP)</option>
                  <option value="0.5">0.5 Hour ({currentRate * 0.5} EGP)</option>
                </select>
              </div>
              <Field
                id="DoneBy"
                name="DoneBy"
                label="Employee on Shift"
                value={loggedInEmployee}
                readOnly
                className="bg-slate-800/80 text-blue-400 font-bold cursor-not-allowed"
              />
            </div>

            <div className="bg-slate-800/40 p-3 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                id="issue"
                name="issue"
                label="Gaming Session Notes / Controllers"
                placeholder="e.g. 2 Wireless Controllers"
              />
              <Field
                id="Notes"
                name="Notes"
                label="Additional Notes"
                placeholder="Special requests"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="destructive"
                onClick={() => onOpenChange(false)}
                className="h-10 px-4 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                disabled={submitting || inUseDevices.has(selectedVendor) || downDevices.has(selectedVendor)}
                className="h-10 px-6 text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Start Session
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}

