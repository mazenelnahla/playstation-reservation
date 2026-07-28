import React from "react";
import Dialog, {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/Dialog";
import { DataRecord } from "../../DataHandle/storage";
import { BanIcon, AlertTriangle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

type RecordItem = DataRecord;

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setConfirmDelete: (s: RecordItem | null) => void;
  handleDeleteRecord: (s: RecordItem) => void;
  confirmDeleteRecordAction: () => void;
  setItems: React.Dispatch<React.SetStateAction<RecordItem[]>>;
  confirmDelete: RecordItem | null;
  Button: React.ComponentType<any>;
  Trash2: React.ComponentType<any>;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onOpenChange,
  confirmDelete,
  setConfirmDelete,
  handleDeleteRecord,
  confirmDeleteRecordAction,
  setItems,
  Button,
  Trash2,
}) => {
  const { t } = useLanguage();

  return (
    <Dialog
      open={open || !!confirmDelete}
      onOpenChange={(openState) => !openState && setConfirmDelete(null)}
    >
      <div className="text-center space-y-4 py-2">
        <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <DialogTitle>{t("deleteConfirmTitle")}</DialogTitle>
          <DialogDescription>
            {t("deleteConfirmDesc")}
          </DialogDescription>
        </div>
        {confirmDelete && (
          <div className="flex items-center justify-center gap-3 pt-3">
            <Button
              size="sm"
              onClick={() => setConfirmDelete(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <BanIcon className="w-4 h-4" />
              {t("cancel")}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={confirmDeleteRecordAction}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl border border-red-500 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t("delete")}
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default DeleteDialog;
