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
      Date_in: String(formData.get("Date_in") || ""),
      CustomerName: String(formData.get("CustomerName") || ""),
      CustomerPhoneNumber: String(formData.get("CustomerPhoneNumber") || ""),
      Device_Type: String(formData.get("Device_Type") || ""),
      VendorName: String(formData.get("VendorName") || ""),
      ModelName: String(formData.get("ModelName") || ""),
      issue: String(formData.get("issue") || ""),
      MaintinancePrice: String(formData.get("MaintinancePrice") || ""),
      DoneBy: String(formData.get("DoneBy") || ""), // added
      Date_out: String(formData.get("Date_out") || ""),
      Notes: String(formData.get("Notes") || ""),
    };
    onSave(updated);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* IN SECTION */}
      <div className="border border-white/10 bg-slate-800/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">
          {t("deviceCheckIn")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field
            id="Date_in"
            name="Date_in"
            info={t("colDateIn")}
            label={t("colDateIn")}
            type="date"
            defaultValue={editing.Date_in}
          />
          <Field
            id="CustomerName"
            name="CustomerName"
            info={t("colCustomerName")}
            label={t("colCustomerName")}
            defaultValue={editing.CustomerName}
          />
          <Field
            id="CustomerPhoneNumber"
            name="CustomerPhoneNumber"
            label={t("colCustomerPhone")}
            info={t("colCustomerPhone")}
            defaultValue={editing.CustomerPhoneNumber}
          />
          <SelectField
            id="Device_Type"
            name="Device_Type"
            label={t("colDeviceType")}
            info={t("colDeviceType")}
            options={DEVICE_TYPES}
            defaultValue={editing.Device_Type}
          />
          <SelectField
            id="VendorName"
            name="VendorName"
            label={t("colVendor")}
            info={t("colVendor")}
            options={VendorName.map((s) => s.name)}
            defaultValue={editing.VendorName}
          />
          <Field
            id="ModelName"
            name="ModelName"
            info={t("colModel")}
            label={t("colModel")}
            defaultValue={editing.ModelName}
          />
          <Field
            id="issue"
            name="issue"
            info={t("colIssue")}
            label={t("colIssue")}
            defaultValue={editing.issue}
          />
          <Field
            id="MaintinancePrice"
            name="MaintinancePrice"
            info={t("colCost")}
            label={t("colCost")}
            defaultValue={editing.MaintinancePrice}
          />
          <SelectField
            id="DoneBy"
            name="DoneBy"
            label={t("colTechnician")}
            info={t("colTechnician")}
            options={users.map((u) => u.name)}
            defaultValue={editing.DoneBy}
          />
          <Field
            id="Date_out"
            name="Date_out"
            info={t("colDateOut")}
            label={t("colDateOut")}
            type="date"
            defaultValue={editing.Date_out}
          />
        </div>

        {/* NOTES SECTION */}
        <div className="mt-4">
          <Label htmlFor="Notes" className="text-slate-300">
            {t("colNotes")}
          </Label>
          <Textarea
            id="Notes"
            name="Notes"
            defaultValue={editing.Notes}
            placeholder={t("colNotes")}
            className="mt-1 bg-slate-900 border-slate-700 text-slate-100"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onClose}>
          <BanIcon className="w-4 h-4 mr-1" />
          {t("cancel")}
        </Button>
        <Button variant="success" type="submit">
          <Save className="w-4 h-4 mr-1" />
          {t("save")}
        </Button>
      </div>
    </form>
  );
};

export default EditRecordDialog;
