import React, { useRef, useState, useEffect } from "react";
import Dialog, {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/Dialog";
import { Smartphone, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

type VendorNames = { id: number; name: string };

interface VendorNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  VendorName: VendorNames[];
  setVendorName: React.Dispatch<React.SetStateAction<VendorNames[]>>;
  editingVendorNames: VendorNames | null;
  setEditingVendorNames: (s: VendorNames | null) => void;
  confirmDeleteVendorNames: VendorNames | null;
  setConfirmDeleteVendorNames: (s: VendorNames | null) => void;
  addVendorNamesItem: (e: React.FormEvent<HTMLFormElement>) => void;
  handleEditVendorNames: (s: VendorNames) => void;
  handleDeleteVendorNames: (s: VendorNames) => void;
  confirmDeleteVendorNamesAction: () => void;
  Field?: React.ComponentType<any>;
  Button?: React.ComponentType<any>;
  PlusIcon?: React.ComponentType<any>;
  Pencil?: React.ComponentType<any>;
  Trash2?: React.ComponentType<any>;
  BanIcon?: React.ComponentType<any>;
  AnimatePresence?: React.ComponentType<any>;
  motion?: any;
}

const VendorNameDialog: React.FC<VendorNameDialogProps> = ({
  open,
  onOpenChange,
  VendorName,
  editingVendorNames,
  setEditingVendorNames,
  confirmDeleteVendorNames,
  setConfirmDeleteVendorNames,
  addVendorNamesItem,
  handleEditVendorNames,
  handleDeleteVendorNames,
  confirmDeleteVendorNamesAction,
}) => {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    if (editingVendorNames) {
      setNameInput(editingVendorNames.name);
    } else {
      setNameInput("");
    }
  }, [editingVendorNames]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    addVendorNamesItem(e);
    setNameInput("");
  };

  const handleCancelEdit = () => {
    setEditingVendorNames(null);
    setNameInput("");
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(openState) => !openState && onOpenChange(false)}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-white/20 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 text-slate-100">
          {/* Header */}
          <DialogHeader>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle>
                    <span className="text-xl font-bold text-white">{t("addVendor")}</span>
                  </DialogTitle>
                  <DialogDescription>
                    <span className="text-xs text-slate-400">{t("addVendorDesc")}</span>
                  </DialogDescription>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1 ">
              <label className="text-xs font-semibold text-slate-300">
                {editingVendorNames ? t("edit") : t("addPhoneType")}
              </label>
              <div className="flex gap-2">
                <input
                  name="Name"
                  type="text"
                  required
                  placeholder="Samsung, Apple, Xiaomi..."
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all "
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-md flex-shrink-0"
                >
                  {editingVendorNames ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t("save")}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{t("save")}</span>
                    </>
                  )}
                </button>
                {editingVendorNames && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition-all flex-shrink-0"
                  >
                    {t("cancel")}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* List header & count */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/10">
            <span className="bg-slate-800 px-2.5 py-1 rounded-full text-slate-300 font-medium">
              {t("showingRecords")}: {VendorName.length}
            </span>
          </div>

          {/* List Table */}
          <div className="bg-slate-800/60 border border-white/10 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
            {VendorName.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                0
              </div>
            ) : (
              <table className="w-full  text-sm">
                <thead className="bg-slate-900/80 text-xs text-slate-400 border-b border-white/10 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4 ">{t("colVendor")}</th>
                    <th className="py-2.5 px-4 text-left">{t("colActions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {VendorName.map((s) => (
                    <tr key={s.id || s.name} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-white ">{s.name}</td>
                      <td className="py-2.5 px-4 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditVendorNames(s)}
                            className="p-1.5 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all"
                            title={t("edit")}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVendorNames(s)}
                            className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                            title={t("delete")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition-all"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteVendorNames && (
        <Dialog open={!!confirmDeleteVendorNames} onOpenChange={(openState) => !openState && setConfirmDeleteVendorNames(null)}>
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-white/20 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4 text-slate-100">
              <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{t("deleteConfirmTitle")}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  <strong className="text-slate-200">{confirmDeleteVendorNames.name}</strong>
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteVendorNames(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition-all"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteVendorNamesAction}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-all"
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </Dialog>
  );
};

export default VendorNameDialog;
