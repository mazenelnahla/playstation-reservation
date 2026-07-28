import React, { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Label from "../ui/Label";
import Textarea from "../ui/Textarea";
import SelectField from "../ui/SelectField";
import { BanIcon, Save, Gamepad2, User, Phone, DollarSign, Calendar, Clock, FileText, Monitor } from "lucide-react";
import { DataRecord } from "../../DataHandle/storage";
import { useLanguage } from "../../context/LanguageContext";

type RecordItem = DataRecord;

interface EditRecordDialogProps {
  editing: RecordItem | null;
  VendorName?: { name: string }[];
  users?: { name: string }[];
  DEVICE_TYPES?: string[];
  onClose: () => void;
  onSave: (updated: RecordItem) => void;
}

const CATEGORY_OPTIONS = [
  "PlayStation 5",
  "PlayStation 4",
  "VIP Room",
  "VR Zone",
  "PC Gaming",
  "General Lounge",
];

export default function EditRecordDialog({
  editing,
  users = [],
  DEVICE_TYPES = CATEGORY_OPTIONS,
  onClose,
  onSave,
}: EditRecordDialogProps) {
  const { t } = useLanguage();
  if (!editing) return null;

  const [customerName, setCustomerName] = useState(editing.CustomerName || "");
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState(editing.CustomerPhoneNumber || "");
  const [vendorName, setVendorName] = useState(editing.VendorName || "");
  const [deviceType, setDeviceType] = useState(editing.Device_Type || CATEGORY_OPTIONS[0]);
  const [modelName, setModelName] = useState(editing.ModelName || "");
  const [issue, setIssue] = useState(editing.issue || "");
  const [maintinancePrice, setMaintinancePrice] = useState(editing.MaintinancePrice || "");
  const [doneBy, setDoneBy] = useState(editing.DoneBy || (users[0]?.name || "Staff"));
  const [dateIn, setDateIn] = useState(editing.Date_in || "");
  const [dateOut, setDateOut] = useState(editing.Date_out || "");
  const [notes, setNotes] = useState(editing.Notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: RecordItem = {
      ...editing,
      CustomerName: customerName,
      CustomerPhoneNumber: customerPhoneNumber,
      VendorName: vendorName,
      Device_Type: deviceType,
      ModelName: modelName,
      issue: issue,
      MaintinancePrice: maintinancePrice,
      DoneBy: doneBy,
      Date_in: dateIn,
      Date_out: dateOut,
      Notes: notes,
    };
    onSave(updated);
  };

  return (
    <form className="space-y-5 text-slate-100" onSubmit={handleSubmit}>
      {/* SECTION 1: CUSTOMER & STATION INFO */}
      <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2.5">
          <Gamepad2 className="w-4 h-4 text-emerald-400" />
          <span>Session & Customer Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Customer Name */}
          <div className="grid gap-1">
            <Label htmlFor="edit_CustomerName" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Customer / Player Name</span>
            </Label>
            <Input
              id="edit_CustomerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. John Doe"
              className="h-10 text-xs bg-slate-900 border-white/10 text-white rounded-xl focus:border-emerald-400"
            />
          </div>

          {/* Customer Phone */}
          <div className="grid gap-1">
            <Label htmlFor="edit_CustomerPhoneNumber" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Phone Number</span>
            </Label>
            <Input
              id="edit_CustomerPhoneNumber"
              value={customerPhoneNumber}
              onChange={(e) => setCustomerPhoneNumber(e.target.value)}
              placeholder="e.g. 01000000000"
              className="h-10 text-xs bg-slate-900 border-white/10 text-white rounded-xl focus:border-emerald-400"
            />
          </div>

          {/* Station / Room Name */}
          <div className="grid gap-1">
            <Label htmlFor="edit_VendorName" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-purple-400" />
              <span>Station / Room Name</span>
            </Label>
            <Input
              id="edit_VendorName"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="e.g. PS5-01 / VIP Room 3"
              className="h-10 text-xs bg-slate-900 border-white/10 text-white rounded-xl focus:border-emerald-400"
            />
          </div>

          {/* Category Dropdown */}
          <div className="grid gap-1">
            <Label htmlFor="edit_Device_Type" className="text-xs font-semibold text-slate-300">
              Station Category
            </Label>
            <select
              id="edit_Device_Type"
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              className="h-10 text-xs bg-slate-900 border border-white/10 text-white rounded-xl px-3 outline-none focus:border-emerald-400"
            >
              {(DEVICE_TYPES.length > 0 ? DEVICE_TYPES : CATEGORY_OPTIONS).map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Model / Sub-type */}
          <div className="grid gap-1">
            <Label htmlFor="edit_ModelName" className="text-xs font-semibold text-slate-300">
              Sub-type / Setup (Optional)
            </Label>
            <Input
              id="edit_ModelName"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="e.g. 4K OLED / Dual Controllers"
              className="h-10 text-xs bg-slate-900 border-white/10 text-white rounded-xl focus:border-emerald-400"
            />
          </div>

          {/* Game Title / Activity */}
          <div className="grid gap-1">
            <Label htmlFor="edit_issue" className="text-xs font-semibold text-slate-300">
              Game Title / Activity
            </Label>
            <Input
              id="edit_issue"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="e.g. EA FC 25 / Tekken 8"
              className="h-10 text-xs bg-slate-900 border-white/10 text-white rounded-xl focus:border-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: TIMING, PRICING & ASSIGNED STAFF */}
      <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2.5">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>Billing, Timing & Staff</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Cost / Price */}
          <div className="grid gap-1">
            <Label htmlFor="edit_MaintinancePrice" className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Total Price / Cost (EGP)</span>
            </Label>
            <Input
              id="edit_MaintinancePrice"
              value={maintinancePrice}
              onChange={(e) => setMaintinancePrice(e.target.value)}
              placeholder="e.g. 150"
              className="h-10 text-xs bg-slate-900 border-emerald-500/30 text-emerald-400 font-extrabold rounded-xl focus:border-emerald-400"
            />
          </div>

          {/* Staff Assigned */}
          <div className="grid gap-1">
            <Label htmlFor="edit_DoneBy" className="text-xs font-semibold text-slate-300">
              Staff Member / Cashier
            </Label>
            <select
              id="edit_DoneBy"
              value={doneBy}
              onChange={(e) => setDoneBy(e.target.value)}
              className="h-10 text-xs bg-slate-900 border border-white/10 text-white rounded-xl px-3 outline-none focus:border-blue-400"
            >
              {users.length > 0 ? (
                users.map((u) => (
                  <option key={u.name} value={u.name} className="bg-slate-900 text-white">
                    {u.name}
                  </option>
                ))
              ) : (
                <option value="Staff" className="bg-slate-900 text-white">Staff</option>
              )}
            </select>
          </div>

          {/* Start Date */}
          <div className="grid gap-1">
            <Label htmlFor="edit_Date_in" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Start Date</span>
            </Label>
            <Input
              id="edit_Date_in"
              type="date"
              value={dateIn}
              onChange={(e) => setDateIn(e.target.value)}
              className="h-10 text-xs bg-slate-900 border-white/10 text-white rounded-xl focus:border-blue-400"
            />
          </div>

          {/* End Date (Checkout) */}
          <div className="grid gap-1">
            <Label htmlFor="edit_Date_out" className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>End Date (Checkout)</span>
            </Label>
            <Input
              id="edit_Date_out"
              type="date"
              value={dateOut}
              onChange={(e) => setDateOut(e.target.value)}
              className="h-10 text-xs bg-slate-900 border-white/10 text-white rounded-xl focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: NOTES & LEFT-BEHIND ITEMS */}
      <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
        <Label htmlFor="edit_Notes" className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Session Notes, Snacks & Missing/Left Belongings</span>
        </Label>
        <Textarea
          id="edit_Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Record any snacks, game additions, left-behind belongings, controller notes, etc..."
          className="w-full bg-slate-900 border-white/10 text-slate-100 text-xs rounded-xl p-3 resize-none focus:border-amber-400/50"
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          size="sm"
          variant="destructive"
          type="button"
          onClick={onClose}
          className="h-10 px-5 rounded-xl text-xs font-semibold"
        >
          <BanIcon className="w-4 h-4 mr-1.5" />
          {t("cancel")}
        </Button>

        <Button
          size="sm"
          variant="success"
          type="submit"
          className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30"
        >
          <Save className="w-4 h-4 mr-1.5" />
          {t("save")}
        </Button>
      </div>
    </form>
  );
}
