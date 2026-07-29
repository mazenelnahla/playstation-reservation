import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  KeyRound,
  Mail,
  User as UserIcon,
  Pencil,
  Coffee,
  Plus,
  DollarSign,
  Clock,
  Gamepad2,
} from "lucide-react";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Label from "./components/ui/Label";
import Dialog, {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./components/ui/Dialog";
import {
  fetchUsers,
  createUser,
  updateUserRole,
  updateUser,
  deleteUser,
  UserItem,
} from "./DataHandle/users";
import {
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  MenuItem,
} from "./DataHandle/storage";
import {
  loadVendorName,
  addOrUpdateVendorName,
  deleteVendorName,
  VendorName,
} from "./DataHandle/VendorName";
import { useLanguage } from "./context/LanguageContext";

export default function AdminPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newSnackName, setNewSnackName] = useState("");
  const [newSnackCategory, setNewSnackCategory] = useState("Beverage");
  const [newSnackPrice, setNewSnackPrice] = useState("");
  const [addingSnack, setAddingSnack] = useState(false);

  // Edit Menu Item state
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemCategory, setEditItemCategory] = useState("Beverage");
  const [editItemPrice, setEditItemPrice] = useState("");

  // Base Hourly Gaming Station Rates state (Admin Editable)
  const [hourlyRates, setHourlyRates] = useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem("hourly_station_rates");
    return saved ? JSON.parse(saved) : { "PS5 Station": 30, "PS4 Station": 20, "VIP Room": 50, "Gaming PC": 25 };
  });

  const handleSaveHourlyRate = (station: string, rate: number) => {
    const updated = { ...hourlyRates, [station]: rate };
    setHourlyRates(updated);
    localStorage.setItem("hourly_station_rates", JSON.stringify(updated));
    setSuccessMsg(`Updated ${station} hourly rate to ${rate} EGP/hr`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleRenameStationRate = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return;
    const currentRate = hourlyRates[oldName] || 30;
    const updated = { ...hourlyRates };
    delete updated[oldName];
    updated[newName.trim()] = currentRate;
    setHourlyRates(updated);
    localStorage.setItem("hourly_station_rates", JSON.stringify(updated));
    setSuccessMsg(`Renamed station "${oldName}" to "${newName.trim()}"`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleDeleteStationRate = (station: string) => {
    if (!window.confirm(`Delete station rate configuration for "${station}"?`)) return;
    const updated = { ...hourlyRates };
    delete updated[station];
    setHourlyRates(updated);
    localStorage.setItem("hourly_station_rates", JSON.stringify(updated));
    setSuccessMsg(`Removed station rate config for "${station}"`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const [newStationName, setNewStationName] = useState("");
  const [newStationRate, setNewStationRate] = useState("30");

  const handleAddStationRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStationName.trim()) return;
    const rateNum = parseFloat(newStationRate) || 30;
    const updated = { ...hourlyRates, [newStationName.trim()]: rateNum };
    setHourlyRates(updated);
    localStorage.setItem("hourly_station_rates", JSON.stringify(updated));
    setNewStationName("");
    setNewStationRate("30");
    setSuccessMsg(`Added new station "${newStationName.trim()}" at ${rateNum} EGP/hr`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Overtime Charging Rate state (Admin Editable)
  const [overtimeConfig, setOvertimeConfig] = useState<{
    mode: "standard" | "fixed" | "multiplier";
    customRatePerMin: number;
    multiplier: number;
  }>(() => {
    const saved = localStorage.getItem("overtime_charging_rate");
    return saved
      ? JSON.parse(saved)
      : { mode: "standard", customRatePerMin: 1.0, multiplier: 1.5 };
  });

  const handleSaveOvertimeConfig = (updated: typeof overtimeConfig) => {
    setOvertimeConfig(updated);
    localStorage.setItem("overtime_charging_rate", JSON.stringify(updated));
    setSuccessMsg("Updated Overtime Charging Rate settings successfully!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Create User Modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [addUserError, setAddUserError] = useState("");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    isAdmin: false,
  });

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    password: "",
    isAdmin: false,
  });
  const [updating, setUpdating] = useState(false);
  const [editUserError, setEditUserError] = useState("");

  // Delete User Confirmation
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  // Device Categories / Models (PS4, PS5, PC, etc.) state
  const [vendorList, setVendorList] = useState<VendorName[]>([]);
  const [newVendorName, setNewVendorName] = useState("");
  const firstStationType = Object.keys(hourlyRates)[0] || "PS5 Station";
  const [newVendorStationType, setNewVendorStationType] = useState(firstStationType);
  const [addingVendor, setAddingVendor] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorName | null>(null);
  const [editVendorNameInput, setEditVendorNameInput] = useState("");
  const [editVendorStationTypeInput, setEditVendorStationTypeInput] = useState(firstStationType);

  useEffect(() => {
    const defaultStation = Object.keys(hourlyRates)[0];
    if (defaultStation) {
      setNewVendorStationType(defaultStation);
      setEditVendorStationTypeInput(defaultStation);
    }
  }, [hourlyRates]);

  const currentUserId = localStorage.getItem("user_id");

  const loadUserList = async () => {
    try {
      setLoading(true);
      setError("");
      const [userData, menuData, vData] = await Promise.all([
        fetchUsers(),
        fetchMenuItems(),
        loadVendorName(),
      ]);
      setUsers(userData);
      setMenuItems(menuData);
      setVendorList(vData || []);
    } catch (err: any) {
      setError("Failed to load admin data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim()) return;
    setAddingVendor(true);
    try {
      await addOrUpdateVendorName({ name: newVendorName.trim(), stationType: newVendorStationType });
      setNewVendorName("");
      setSuccessMsg(`Added "${newVendorName.trim()}" linked to ${newVendorStationType}!`);
      const updatedVendors = await loadVendorName();
      setVendorList(updatedVendors || []);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError("Failed to add device category");
    } finally {
      setAddingVendor(false);
    }
  };

  const handleStartEditVendor = (v: VendorName) => {
    setEditingVendor(v);
    setEditVendorNameInput(v.name);
    setEditVendorStationTypeInput(v.stationType || firstStationType);
  };

  const handleSaveEditVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor || !editVendorNameInput.trim()) return;
    try {
      await addOrUpdateVendorName({ id: editingVendor.id, name: editVendorNameInput.trim(), stationType: editVendorStationTypeInput });
      setSuccessMsg(`Updated device category "${editVendorNameInput.trim()}"!`);
      setEditingVendor(null);
      const updatedVendors = await loadVendorName();
      setVendorList(updatedVendors || []);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError("Failed to update device category");
    }
  };

  const handleDeleteVendor = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" device category?`)) return;
    try {
      await deleteVendorName(id);
      setSuccessMsg(`Deleted "${name}" device category.`);
      const updatedVendors = await loadVendorName();
      setVendorList(updatedVendors || []);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError("Failed to delete device category");
    }
  };

  const handleAddSnack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnackName || !newSnackPrice) return;
    setAddingSnack(true);
    try {
      await createMenuItem({
        name: newSnackName,
        category: newSnackCategory,
        price: parseFloat(newSnackPrice) || 0,
      });
      setNewSnackName("");
      setNewSnackPrice("");
      setSuccessMsg(`Added "${newSnackName}" to Coffee Net menu!`);
      const updatedMenu = await fetchMenuItems();
      setMenuItems(updatedMenu);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError("Failed to add menu item");
    } finally {
      setAddingSnack(false);
    }
  };

  const handleStartEditSnack = (item: MenuItem) => {
    setEditingMenuItem(item);
    setEditItemName(item.name);
    setEditItemCategory(item.category);
    setEditItemPrice(String(item.price));
  };

  const handleSaveEditSnack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenuItem || !editItemName || !editItemPrice) return;
    try {
      await updateMenuItem(editingMenuItem.id, {
        name: editItemName,
        category: editItemCategory,
        price: parseFloat(editItemPrice) || 0,
      });
      setSuccessMsg(`Updated "${editItemName}" price & details!`);
      setEditingMenuItem(null);
      const updatedMenu = await fetchMenuItems();
      setMenuItems(updatedMenu);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError("Failed to update menu item");
    }
  };

  const handleDeleteSnack = async (id: number, name: string) => {
    try {
      await deleteMenuItem(id);
      setSuccessMsg(`Deleted "${name}" from menu.`);
      const updatedMenu = await fetchMenuItems();
      setMenuItems(updatedMenu);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError("Failed to delete menu item");
    }
  };

  useEffect(() => {
    loadUserList();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setAddUserError("");

    try {
      await createUser(newUser);
      setSuccessMsg(`User "${newUser.name}" created successfully!`);
      setIsAddUserOpen(false);
      setNewUser({ name: "", email: "", password: "", isAdmin: false });
      await loadUserList();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setAddUserError(err.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleRole = async (user: UserItem) => {
    try {
      const newRole = !user.isAdmin;
      await updateUserRole(user.id, newRole);
      setSuccessMsg(
        `Updated ${user.name}'s role to ${newRole ? "Admin" : "Regular User"}`
      );
      await loadUserList();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError("Failed to update user role");
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      setSuccessMsg(`User "${userToDelete.name}" deleted.`);
      setUserToDelete(null);
      await loadUserList();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  const handleStartEdit = (u: UserItem) => {
    setEditUserError("");
    setEditingUser(u);
    setEditFormData({
      name: u.name,
      email: u.email,
      password: "",
      isAdmin: u.isAdmin,
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUpdating(true);
    setEditUserError("");

    try {
      await updateUser(editingUser.id, editFormData);
      setSuccessMsg(`User "${editFormData.name}" updated successfully!`);
      setEditingUser(null);
      await loadUserList();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setEditUserError(err.message || "Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="w-full bg-[#1F2020] light:bg-white p-5 rounded-2xl shadow-lg border border-white/10 light:border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white light:text-slate-900 tracking-tight">
              {t("adminTitle")}
            </h1>
            <p className="text-sm text-slate-400 light:text-slate-600">
              {t("adminSub")}
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsAddUserOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t("addNewUser")}</span>
        </Button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-500/10 light:bg-emerald-100 border border-emerald-500/30 light:border-emerald-300 rounded-xl flex items-center gap-3 text-emerald-400 light:text-emerald-800"
        >
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Error Notification */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 light:bg-red-100 border border-red-500/30 light:border-red-300 rounded-xl flex items-center justify-between gap-3 text-red-400 light:text-red-800"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadUserList()}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 light:bg-red-200 light:hover:bg-red-300 text-red-300 light:text-red-900 font-semibold rounded-lg text-sm transition-all shrink-0"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* Users List Table Container */}
      <div className="bg-slate-800/60 light:bg-white border border-white/10 light:border-slate-300 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-white/10 light:border-slate-200 flex items-center justify-between bg-slate-900/40 light:bg-slate-100">
          <div className="flex items-center gap-2 text-white light:text-slate-900 font-bold text-base">
            <Users className="w-5 h-5 text-blue-400 light:text-blue-600" />
            <span>{t("registeredUsers")} ({users.length})</span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400 light:text-slate-500">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
            <span>Loading...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400 light:text-slate-500">
            No users registered in the system.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-slate-200 light:text-slate-800">
              <thead className="bg-slate-900/90 light:bg-slate-200/80 text-xs uppercase border-b border-white/10 light:border-slate-300">
                <tr>
                  <th className="py-3.5 px-4 text-left font-bold text-blue-400 light:text-blue-900">{t("userName")}</th>
                  <th className="py-3.5 px-4 text-left font-bold text-blue-400 light:text-blue-900">{t("emailAddress")}</th>
                  <th className="py-3.5 px-4 text-center font-bold text-blue-400 light:text-blue-900">{t("role")}</th>
                  <th className="py-3.5 px-4 text-center font-bold text-blue-400 light:text-blue-900">{t("createdAt")}</th>
                  <th className="py-3.5 px-4 text-right font-bold text-blue-400 light:text-blue-900">{t("colActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 light:divide-slate-200 text-sm">
                {users.map((u) => {
                  const isCurrent = u.id === currentUserId;
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-700/30 light:hover:bg-slate-100 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-medium text-white light:text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-600/30 light:bg-blue-100 border border-blue-500/40 light:border-blue-300 text-blue-300 light:text-blue-700 font-bold flex items-center justify-center text-xs">
                            {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <span className="font-semibold">{u.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-blue-500/20 light:bg-blue-100 text-blue-300 light:text-blue-800 border border-blue-500/30 light:border-blue-300 px-2 py-0.5 rounded-full font-bold">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 light:text-slate-700 font-mono text-xs">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {u.isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 light:bg-amber-100 text-amber-300 light:text-amber-900 border border-amber-500/30 light:border-amber-300">
                            <Shield className="w-3.5 h-3.5" /> {t("adminRole")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-700/60 light:bg-slate-200 text-slate-300 light:text-slate-800 border border-slate-600 light:border-slate-300">
                            {t("userRole")}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 light:text-slate-600 text-xs text-center font-medium">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStartEdit(u)}
                            title={t("edit")}
                            className="p-2 rounded-xl border border-blue-500/30 light:border-blue-300 text-blue-400 light:text-blue-600 hover:bg-blue-500/10 light:hover:bg-blue-50 transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleRole(u)}
                            disabled={isCurrent}
                            title={
                              isCurrent
                                ? "Cannot modify own role"
                                : u.isAdmin
                                ? t("makeUser")
                                : t("makeAdmin")
                            }
                            className={`p-2 rounded-xl border transition-all ${
                              isCurrent
                                ? "opacity-30 cursor-not-allowed border-slate-700 light:border-slate-300 text-slate-600 light:text-slate-400"
                                : u.isAdmin
                                ? "border-amber-500/30 light:border-amber-300 text-amber-400 light:text-amber-700 hover:bg-amber-500/10 light:hover:bg-amber-50"
                                : "border-slate-600 light:border-slate-300 text-slate-400 light:text-slate-700 hover:bg-slate-700 light:hover:bg-slate-200"
                            }`}
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setUserToDelete(u)}
                            disabled={isCurrent}
                            title={t("delete")}
                            className={`p-2 rounded-xl border transition-all ${
                              isCurrent
                                ? "opacity-30 cursor-not-allowed border-slate-700 light:border-slate-300 text-slate-600 light:text-slate-400"
                                : "border-red-500/30 light:border-red-300 text-red-400 light:text-red-600 hover:bg-red-500/10 light:hover:bg-red-50"
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🎮 Gaming Station Hourly Rates Settings (Admin Only) */}
      <div className="bg-slate-800/60 light:bg-white border border-white/10 light:border-slate-300 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-white/10 light:border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 light:bg-slate-100/80">
          <div className="flex items-center gap-2 text-white light:text-slate-900 font-bold text-base">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Gaming Station Rates & Hourly Pricing</span>
          </div>
          <span className="text-xs text-slate-400">
            Edit station names, hourly rates, or add new gaming stations
          </span>
        </div>

        <div className="p-4 space-y-4">
          {/* Add New Gaming Station Rate Form */}
          <form onSubmit={handleAddStationRate} className="bg-slate-900/90 light:bg-slate-100 p-4 rounded-xl border border-white/10 light:border-slate-300 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end shadow-md">
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5 block">Station Name</Label>
              <Input
                placeholder="e.g. PS5 Station 2, VIP Room B..."
                value={newStationName}
                onChange={(e) => setNewStationName(e.target.value)}
                className="h-10 text-xs bg-slate-800 light:bg-white text-white light:text-slate-900 border-white/10 focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5 block">Hourly Rate (EGP/hr)</Label>
              <Input
                type="number"
                step="5"
                placeholder="30"
                value={newStationRate}
                onChange={(e) => setNewStationRate(e.target.value)}
                className="h-10 text-xs bg-slate-800 light:bg-white text-emerald-400 font-bold border-white/10 focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <Button
                type="submit"
                className="w-full h-10 text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-extrabold flex items-center justify-center gap-1.5 rounded-xl shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Station
              </Button>
            </div>
          </form>

          {/* Station Rates List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(hourlyRates).map(([station, rate]) => (
              <div key={station} className="bg-slate-900/80 p-4 rounded-xl border border-white/10 space-y-3 shadow-md relative group">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    defaultValue={station}
                    onBlur={(e) => handleRenameStationRate(station, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="bg-transparent font-bold text-xs text-white border-b border-transparent hover:border-slate-500 focus:border-emerald-400 focus:outline-none w-full py-0.5"
                    title="Click to edit station name"
                  />
                  <button
                    onClick={() => handleDeleteStationRate(station)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                    title="Delete Station Rate"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <input
                    type="number"
                    step="5"
                    value={rate}
                    onChange={(e) => handleSaveHourlyRate(station, parseFloat(e.target.value) || 0)}
                    className="w-full h-9 bg-slate-800 border border-emerald-500/30 rounded-lg px-2.5 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-xs font-semibold text-slate-400 shrink-0">EGP/hr</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ⏱️ Overtime Charging Rate Settings (Admin Only) */}
      <div className="bg-slate-800/60 light:bg-white border border-white/10 light:border-slate-300 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-white/10 light:border-slate-200 flex items-center justify-between bg-slate-900/40 light:bg-slate-100">
          <div className="flex items-center gap-2 text-white light:text-slate-900 font-bold text-base">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Overtime Charging Rate Settings</span>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mode 1: Standard Hourly Pro-Rata */}
            <div
              onClick={() => handleSaveOvertimeConfig({ ...overtimeConfig, mode: "standard" })}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                overtimeConfig.mode === "standard"
                  ? "bg-amber-500/10 border-amber-500 text-amber-300 shadow-md"
                  : "bg-slate-900/80 border-white/10 text-slate-400 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-bold text-xs text-white truncate">Standard Hourly Pro-Rata</span>
                <input
                  type="radio"
                  name="overtimeMode"
                  checked={overtimeConfig.mode === "standard"}
                  onChange={() => {}}
                  className="w-4 h-4 accent-amber-500 cursor-pointer shrink-0"
                />
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed">
                Calculated directly from the station's standard hourly rate (<code className="text-amber-400">Rate / 60m</code>).
              </p>
            </div>

            {/* Mode 2: Fixed EGP per Minute */}
            <div
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                overtimeConfig.mode === "fixed"
                  ? "bg-amber-500/10 border-amber-500 text-amber-300 shadow-md"
                  : "bg-slate-900/80 border-white/10 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  onClick={() => handleSaveOvertimeConfig({ ...overtimeConfig, mode: "fixed" })}
                  className="font-bold text-xs text-white cursor-pointer truncate"
                >
                  Fixed EGP per Minute
                </span>
                <input
                  type="radio"
                  name="overtimeMode"
                  checked={overtimeConfig.mode === "fixed"}
                  onChange={() => handleSaveOvertimeConfig({ ...overtimeConfig, mode: "fixed" })}
                  className="w-4 h-4 accent-amber-500 cursor-pointer shrink-0"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={overtimeConfig.customRatePerMin}
                  onChange={(e) =>
                    handleSaveOvertimeConfig({
                      ...overtimeConfig,
                      customRatePerMin: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="!w-24 h-9 bg-slate-800 light:bg-white border border-amber-500/30 rounded-lg px-2.5 text-xs font-bold text-amber-400 light:text-amber-700 focus:outline-none focus:border-amber-400"
                />
                <span className="text-xs font-semibold text-slate-300 light:text-slate-700 shrink-0">EGP / min</span>
              </div>
            </div>

            {/* Mode 3: Overtime Multiplier */}
            <div
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                overtimeConfig.mode === "multiplier"
                  ? "bg-amber-500/10 border-amber-500 text-amber-300 shadow-md"
                  : "bg-slate-900/80 border-white/10 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  onClick={() => handleSaveOvertimeConfig({ ...overtimeConfig, mode: "multiplier" })}
                  className="font-bold text-xs text-white cursor-pointer truncate"
                >
                  Overtime Multiplier Rate
                </span>
                <input
                  type="radio"
                  name="overtimeMode"
                  checked={overtimeConfig.mode === "multiplier"}
                  onChange={() => handleSaveOvertimeConfig({ ...overtimeConfig, mode: "multiplier" })}
                  className="w-4 h-4 accent-amber-500 cursor-pointer shrink-0"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={overtimeConfig.multiplier}
                  onChange={(e) =>
                    handleSaveOvertimeConfig({
                      ...overtimeConfig,
                      multiplier: parseFloat(e.target.value) || 1,
                    })
                  }
                  className="!w-24 h-9 bg-slate-800 light:bg-white border border-amber-500/30 rounded-lg px-2.5 text-xs font-bold text-amber-400 light:text-amber-700 focus:outline-none focus:border-amber-400"
                />
                <span className="text-xs font-semibold text-slate-300 light:text-slate-700 shrink-0">x Hourly Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coffee Net Drinks & Snacks Price Management (Admin Only) */}
      <div className="bg-slate-800/60 light:bg-white border border-white/10 light:border-slate-300 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-white/10 light:border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 light:bg-slate-100/80">
          <div className="flex items-center gap-2 text-white light:text-slate-900 font-bold text-base">
            <Coffee className="w-5 h-5 text-amber-400" />
            <span>Coffee Net Drinks & Snacks Prices</span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Add New Snack/Drink Price Form */}
          <form onSubmit={handleAddSnack} className="bg-slate-900/90 light:bg-slate-100 p-4 rounded-xl border border-white/10 light:border-slate-300 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end shadow-md">
            <div>
              <Label className="text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5 block">Item Name</Label>
              <Input
                placeholder="e.g. Espresso"
                value={newSnackName}
                onChange={(e) => setNewSnackName(e.target.value)}
                className="h-10 text-xs bg-slate-800 light:bg-white text-white light:text-slate-900 border-white/10 light:border-slate-300 focus:border-amber-500"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5 block">Category</Label>
              <select
                value={newSnackCategory}
                onChange={(e) => setNewSnackCategory(e.target.value)}
                className="w-full h-10 text-xs bg-slate-800 light:bg-white text-white light:text-slate-900 border border-white/10 light:border-slate-300 rounded-xl px-3 outline-none focus:border-amber-500"
              >
                <option value="Beverage" className="bg-slate-900 text-white">Beverage ☕</option>
                <option value="Snack" className="bg-slate-900 text-white">Snack 🥨</option>
                <option value="Other" className="bg-slate-900 text-white">Other 🛒</option>
              </select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5 block">Price (EGP)</Label>
              <Input
                type="number"
                step="0.5"
                placeholder="25"
                value={newSnackPrice}
                onChange={(e) => setNewSnackPrice(e.target.value)}
                className="h-10 text-xs bg-slate-800 light:bg-white text-white light:text-slate-900 border-white/10 light:border-slate-300 font-bold text-amber-400 light:text-amber-600 focus:border-amber-500"
                required
              />
            </div>
            <div>
              <Button
                type="submit"
                disabled={addingSnack}
                className="w-full h-10 text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold flex items-center justify-center gap-1.5 rounded-xl shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                Add to Menu
              </Button>
            </div>
          </form>

          {/* Menu Table */}
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-xs text-left text-slate-200">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-900/40">
                {menuItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">
                      No menu items added yet. Use the form above to add items.
                    </td>
                  </tr>
                ) : (
                  menuItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white">{item.name}</td>
                      <td className="p-3 text-slate-400">{item.category}</td>
                      <td className="p-3 font-bold text-amber-400">{item.price} EGP</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStartEditSnack(item)}
                            className="p-1.5 rounded-lg text-blue-400 hover:text-white hover:bg-blue-600/30 border border-blue-500/30 transition-colors flex items-center gap-1"
                            title="Edit Item Price or Name"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSnack(item.id, item.name)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-600/30 border border-red-500/30 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 🎮 Device Models & Categories (PS4, PS5, PC) Management (Admin Only) */}
      <div className="bg-slate-800/60 light:bg-white border border-white/10 light:border-slate-300 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-white/10 light:border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 light:bg-slate-100/80">
          <div className="flex items-center gap-2 text-white light:text-slate-900 font-bold text-base">
            <Gamepad2 className="w-5 h-5 text-blue-400" />
            <span>Device Models & Categories (PS4, PS5, PC, etc.)</span>
          </div>
          <span className="text-xs text-slate-400">
            Available across Customer Check-In, Maintenance & Repair Page
          </span>
        </div>

        <div className="p-4 space-y-4">
          {/* Add New Device Category Form */}
          <form onSubmit={handleAddVendor} className="bg-slate-900/90 light:bg-slate-100 p-4 rounded-xl border border-white/10 light:border-slate-300 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end shadow-md">
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5 block">Device Model / Device Name</Label>
              <Input
                placeholder="e.g. PS5 #1, PS4 #2, Gaming PC #3..."
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
                className="h-10 text-xs bg-slate-800 light:bg-white text-white light:text-slate-900 border-white/10 light:border-slate-300 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5 block">Linked Station Type / Room</Label>
              <select
                value={newVendorStationType}
                onChange={(e) => setNewVendorStationType(e.target.value)}
                className="w-full h-10 text-xs bg-slate-800 light:bg-white text-white light:text-slate-900 border border-white/10 light:border-slate-300 rounded-xl px-3 outline-none focus:border-blue-500 font-medium"
              >
                {Object.keys(hourlyRates).map((st) => (
                  <option key={st} value={st} className="bg-slate-900 text-white">
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Button
                type="submit"
                disabled={addingVendor}
                className="w-full h-10 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-extrabold flex items-center justify-center gap-1.5 rounded-xl shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Device
              </Button>
            </div>
          </form>

          {/* Categories Table */}
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-xs text-left text-slate-200">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[11px]">
                <tr>
                  <th className="p-3">Device Name</th>
                  <th className="p-3">Linked Station Type / Room</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-900/40">
                {vendorList.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-500">
                      No devices registered yet. Use the form above to add a device.
                    </td>
                  </tr>
                ) : (
                  vendorList.map((v) => (
                    <tr key={v.id || v.name} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {v.name}
                      </td>
                      <td className="p-3 text-blue-400 font-bold">
                        {v.stationType || firstStationType}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStartEditVendor(v)}
                            className="p-1.5 rounded-lg text-blue-400 hover:text-white hover:bg-blue-600/30 border border-blue-500/30 transition-colors flex items-center gap-1"
                            title="Edit Device"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteVendor(v.id, v.name)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-600/30 border border-red-500/30 transition-colors"
                            title="Delete Device"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Device Category Dialog */}
      {editingVendor && (
        <Dialog open={!!editingVendor} onOpenChange={(op) => !op && setEditingVendor(null)}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="bg-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 text-slate-100">
              <DialogHeader>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                    ✏️ Edit Device & Station Link
                  </DialogTitle>
                  <button onClick={() => setEditingVendor(null)} className="text-slate-400 hover:text-white">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </DialogHeader>

              <form onSubmit={handleSaveEditVendor} className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-300">Device Name</Label>
                  <Input
                    value={editVendorNameInput}
                    onChange={(e) => setEditVendorNameInput(e.target.value)}
                    className="h-10 bg-slate-800 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-300">Linked Station Type / Room</Label>
                  <select
                    value={editVendorStationTypeInput}
                    onChange={(e) => setEditVendorStationTypeInput(e.target.value)}
                    className="w-full h-10 bg-slate-800 border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {Object.keys(hourlyRates).map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="destructive" onClick={() => setEditingVendor(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="success" className="bg-blue-600 hover:bg-blue-700">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Dialog>
      )}

      {/* Edit Snack Price Dialog */}
      {editingMenuItem && (
        <Dialog open={!!editingMenuItem} onOpenChange={(op) => !op && setEditingMenuItem(null)}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="bg-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 text-slate-100">
              <DialogHeader>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                    ✏️ Edit Item Price & Name
                  </DialogTitle>
                  <button onClick={() => setEditingMenuItem(null)} className="text-slate-400 hover:text-white">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </DialogHeader>

              <form onSubmit={handleSaveEditSnack} className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-300">Item Name</Label>
                  <Input
                    value={editItemName}
                    onChange={(e) => setEditItemName(e.target.value)}
                    className="h-10 bg-slate-800 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-300">Category</Label>
                  <select
                    value={editItemCategory}
                    onChange={(e) => setEditItemCategory(e.target.value)}
                    className="w-full h-10 bg-slate-800 border border-white/10 rounded-xl px-3 text-sm text-white"
                  >
                    <option value="Beverage">Beverage ☕</option>
                    <option value="Snack">Snack 🥨</option>
                    <option value="Other">Other 🛒</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-slate-300">Price (EGP)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={editItemPrice}
                    onChange={(e) => setEditItemPrice(e.target.value)}
                    className="h-10 bg-slate-800 text-sm font-bold text-amber-400"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="destructive" onClick={() => setEditingMenuItem(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="success" className="bg-blue-600 hover:bg-blue-700">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Dialog>
      )}

      {/* Add New User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 light:bg-white border border-white/20 light:border-slate-300 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 text-slate-100 light:text-slate-900"
          >
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/30 light:bg-blue-100 border border-blue-400/30 light:border-blue-300 rounded-full flex items-center justify-center text-blue-400 light:text-blue-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle>
                    {t("addNewUser")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("adminSub")}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {addUserError && (
                <div className="p-3 bg-red-500/10 light:bg-red-100 border border-red-500/40 light:border-red-300 rounded-lg flex items-center gap-2 text-xs text-red-300 light:text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{addUserError}</span>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs text-slate-300 light:text-slate-700">{t("fullName")}</Label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    required
                    type="text"
                    placeholder={t("fullName")}
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    className="pl-9 bg-slate-800 light:bg-slate-50 border-slate-700 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300 light:text-slate-700">{t("emailAddress")}</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    required
                    type="email"
                    placeholder="user@example.com"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="pl-9 bg-slate-800 light:bg-slate-50 border-slate-700 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300 light:text-slate-700">{t("newPassword")}</Label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="pl-9 bg-slate-800 light:bg-slate-50 border-slate-700 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 bg-slate-800/80 light:bg-slate-100 rounded-lg border border-slate-700 light:border-slate-300 cursor-pointer hover:bg-slate-800 light:hover:bg-slate-200">
                  <input
                    type="checkbox"
                    checked={newUser.isAdmin}
                    onChange={(e) =>
                      setNewUser({ ...newUser, isAdmin: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded border-slate-600 focus:ring-blue-500 bg-slate-700"
                  />
                  <div>
                    <div className="text-sm font-medium text-white light:text-slate-900">
                      {t("makeAdmin")}
                    </div>
                    <div className="text-xs text-slate-400 light:text-slate-600">
                      {t("adminSub")}
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 light:border-slate-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddUserOpen(false)}
                  className="text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-blue-600 hover:bg-blue-500 text-white min-w-[100px] flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    t("addNewUser")
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 light:bg-white border border-white/20 light:border-slate-300 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 text-slate-100 light:text-slate-900"
          >
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/30 light:bg-blue-100 border border-blue-400/30 light:border-blue-300 rounded-full flex items-center justify-center text-blue-400 light:text-blue-600">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle>{t("editUser")}</DialogTitle>
                  <DialogDescription>
                    {editingUser?.name}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              {editUserError && (
                <div className="p-3 bg-red-500/10 light:bg-red-100 border border-red-500/40 light:border-red-300 rounded-lg flex items-center gap-2 text-xs text-red-300 light:text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{editUserError}</span>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs text-slate-300 light:text-slate-700">{t("fullName")}</Label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    required
                    type="text"
                    placeholder={t("fullName")}
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="pl-9 bg-slate-800 light:bg-slate-50 border-slate-700 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300 light:text-slate-700">{t("emailAddress")}</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    required
                    type="email"
                    placeholder="user@example.com"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, email: e.target.value })
                    }
                    className="pl-9 bg-slate-800 light:bg-slate-50 border-slate-700 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300 light:text-slate-700">{t("newPassword")}</Label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="password"
                    placeholder={t("passwordLeaveBlank")}
                    value={editFormData.password}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, password: e.target.value })
                    }
                    className="pl-9 bg-slate-800 light:bg-slate-50 border-slate-700 light:border-slate-300 text-white light:text-slate-900 placeholder-slate-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 bg-slate-800/80 light:bg-slate-100 rounded-lg border border-slate-700 light:border-slate-300 cursor-pointer hover:bg-slate-800 light:hover:bg-slate-200">
                  <input
                    type="checkbox"
                    checked={editFormData.isAdmin}
                    disabled={editingUser?.id === currentUserId}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, isAdmin: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded border-slate-600 focus:ring-blue-500 bg-slate-700"
                  />
                  <div>
                    <div className="text-sm font-medium text-white light:text-slate-900">
                      {t("makeAdmin")}
                    </div>
                    <div className="text-xs text-slate-400 light:text-slate-600">
                      {t("adminSub")}
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 light:border-slate-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingUser(null)}
                  className="text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={updating}
                  className="bg-blue-600 hover:bg-blue-500 text-white min-w-[100px] flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    t("saveChanges")
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </Dialog>

      {/* Confirm Delete User Dialog */}
      <Dialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 light:bg-white border border-white/20 light:border-slate-300 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4 text-slate-100 light:text-slate-900"
          >
            <div className="w-12 h-12 bg-red-500/20 light:bg-red-100 text-red-400 light:text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-500/30 light:border-red-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white light:text-slate-900">{t("confirmDeleteUser")}</h3>
              <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
                <strong className="text-slate-200 light:text-slate-900">{userToDelete?.name}</strong>
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setUserToDelete(null)}
                className="text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900"
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-500 text-white px-5"
              >
                {t("delete")}
              </Button>
            </div>
          </motion.div>
        </div>
      </Dialog>
    </div>
  );
}
