import React from "react";
import Button from "../ui/Button";
import { BanIcon, Save } from "lucide-react";
import { DataRecord } from "../../DataHandle/storage";
import { useLanguage } from "../../context/LanguageContext";

type RecordItem = DataRecord;

interface OutRecordDialogProps {
  Out: RecordItem | null; // <-- typed
  VendorName?: { name: string }[];
  users?: { name: string }[];
  onClose: () => void;
  onSave: (updated: RecordItem) => void; // <-- call with updated record
  Field: React.FC<any>;
  SelectField: React.FC<any>;
}

const OutRecordDialog: React.FC<OutRecordDialogProps> = ({
  Out,
  VendorName = [],
  users = [],
  onClose,
  onSave,
  Field,
  SelectField,
}) => {
  const { t } = useLanguage();
  if (!Out) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updated: RecordItem = {
      ...Out,
      Date_out: String(formData.get("Date_out") || ""),
      DoneBy: String(formData.get("DoneBy") || ""),
      MaintinancePrice: String(formData.get("MaintinancePrice") || ""),
    };
    onSave(updated);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="border border-white/10 bg-slate-800/50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">
          {t("checkOutDetails")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field
            id="Date_out"
            name="Date_out"
            label={t("colDateOut")}
            type="date"
            defaultValue={Out.Date_out}
          />
          <SelectField
            id="DoneBy"
            name="DoneBy"
            label={t("colTechnician")}
            options={users.map((u) => u.name)}
            defaultValue={Out.DoneBy}
          />
          <Field
            id="MaintinancePrice"
            name="MaintinancePrice"
            info={t("colCost")}
            label={t("colCost")}
            defaultValue={Out.MaintinancePrice}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button size="sm" variant="destructive" type="button" onClick={onClose}>
          <BanIcon className="h-4 w-4 ml-2" />
          {t("cancel")}
        </Button>
        <Button size="sm" variant="success" type="submit">
          <Save className="h-4 w-4 ml-2" />
          {t("save")}
        </Button>
      </div>
    </form>
  );
};

export default OutRecordDialog;
