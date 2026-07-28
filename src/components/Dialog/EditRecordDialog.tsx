import React from "react";
import Button from "../ui/Button";
import Label from "../ui/Label";
import Textarea from "../ui/Textarea";
import { BanIcon, Save } from "lucide-react";
import { DataRecord } from "../../DataHandle/storage";
import { useLanguage } from "../../context/LanguageContext";

type RecordItem = DataRecord;

interface EditRecordDialogProps {
  editing: any;
  VendorName?: { name: string }[];
  users?: { name: string }[];
  DEVICE_TYPES: string[];
  onClose: () => void;
  onSave: (updated: RecordItem) => void;
  Field: React.FC<any>;
  SelectField: React.FC<any>;
}

const EditRecordDialog: React.FC<EditRecordDialogProps> = ({
  editing,
  VendorName = [],
  users = [],
  DEVICE_TYPES,
  onClose,
  onSave,
  Field,
  SelectField,
}) => {
  const { t } = useLanguage();
  if (!editing) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updated: RecordItem = {
      ...editing,
      CustomerName: String(formData.get("CustomerName") || ""),
      CustomerPhoneNumber: String(formData.get("CustomerPhoneNumber") || ""),
      VendorName: String(formData.get("VendorName") || ""),
      Device_Type: String(formData.get("Device_Type") || ""),
      Date_in: String(formData.get("Date_in") || ""),
      Date_out: String(formData.get("Date_out") || ""),
      MaintinancePrice: String(formData.get("MaintinancePrice") || ""),
      DoneBy: String(formData.get("DoneBy") || ""),
      Notes: String(formData.get("Notes") || ""),
    };
    onSave(updated);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* SESSION DETAILS SECTION */}
      <div className="border border-white/10 bg-slate-800/50 rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 border-b border-white/10 pb-2">
          🎮 Edit Session Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field
            id="CustomerName"
            name="CustomerName"
            label="Player / Customer Name"
            info="Customer Name"
            defaultValue={editing.CustomerName}
          />
          <Field
            id="CustomerPhoneNumber"
            name="CustomerPhoneNumber"
            label="Phone Number"
            info="Customer Phone"
            defaultValue={editing.CustomerPhoneNumber}
          />
          <Field
            id="VendorName"
            name="VendorName"
            label="Station / Room Name"
            info="Station / Room"
            defaultValue={editing.VendorName}
          />
          <SelectField
            id="Device_Type"
            name="Device_Type"
            label="Station Category"
            info="Station Category"
            options={DEVICE_TYPES.length > 0 ? DEVICE_TYPES : ["PlayStation 5", "PlayStation 4", "VIP Room", "VR Zone", "PC Gaming"]}
            defaultValue={editing.Device_Type}
          />
          <SelectField
            id="DoneBy"
            name="DoneBy"
            label="Assigned Staff"
            info="Assigned Staff"
            options={users.map((u) => u.name)}
            defaultValue={editing.DoneBy}
          />
          <Field
            id="MaintinancePrice"
            name="MaintinancePrice"
            label="Total Price / Cost (EGP)"
            info="Total Cost"
            defaultValue={editing.MaintinancePrice}
          />
          <Field
            id="Date_in"
            name="Date_in"
            label="Start Date"
            info="Start Date"
            type="date"
            defaultValue={editing.Date_in}
          />
          <Field
            id="Date_out"
            name="Date_out"
            label="End Date (Checkout)"
            info="End Date"
            type="date"
            defaultValue={editing.Date_out}
          />
        </div>

        {/* NOTES SECTION */}
        <div className="pt-2 border-t border-white/10">
          <Label htmlFor="Notes" className="text-slate-300 text-xs font-semibold">
            Session Notes & Missing Items
          </Label>
          <Textarea
            id="Notes"
            name="Notes"
            rows={3}
            defaultValue={editing.Notes}
            placeholder="Record any snacks, game additions, or session notes..."
            className="mt-1 bg-slate-900 border-white/10 text-slate-100 text-xs"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onClose} size="sm">
          <BanIcon className="w-4 h-4 mr-1" />
          {t("cancel")}
        </Button>
        <Button variant="success" type="submit" size="sm">
          <Save className="w-4 h-4 mr-1" />
          {t("save")}
        </Button>
      </div>
    </form>
  );
};

export default EditRecordDialog;
