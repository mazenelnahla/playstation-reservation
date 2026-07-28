import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Label from "../ui/Label";
import Dialog, { DialogHeader, DialogTitle, DialogDescription } from "../ui/Dialog";
import { Coffee, Plus, Minus, Trash2, X, ShoppingBag } from "lucide-react";
import {
  fetchMenuItems,
  createMenuItem,
  deleteMenuItem,
  fetchSessionOrders,
  addSessionOrder,
  updateSessionOrderQuantity,
  deleteSessionOrder,
  MenuItem,
  SessionOrder,
  DataRecord,
} from "../../DataHandle/storage";

interface AddSnackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: DataRecord | null;
  onOrdersUpdated: () => void;
}

export default function AddSnackDialog({
  open,
  onOpenChange,
  session,
  onOrdersUpdated,
}: AddSnackDialogProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<SessionOrder[]>([]);
  const [loading, setLoading] = useState(false);

  // New Menu Item creation state
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Beverage");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [showAddMenu, setShowAddMenu] = useState(false);

  const loadData = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [menu, rawOrders] = await Promise.all([
        fetchMenuItems(),
        fetchSessionOrders(session.id),
      ]);
      setMenuItems(menu);

      // Combine duplicate order rows into quantity-based entries
      const combinedMap = new Map<string, SessionOrder>();
      for (const order of rawOrders) {
        const key = order.itemName.trim().toLowerCase();
        if (combinedMap.has(key)) {
          const existing = combinedMap.get(key)!;
          existing.quantity += order.quantity;
        } else {
          combinedMap.set(key, { ...order });
        }
      }
      setOrders(Array.from(combinedMap.values()));
    } catch (err) {
      console.error("Failed to load snacks/drinks data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && session) {
      loadData();
    }
  }, [open, session]);

  const handleAddOrder = async (item: MenuItem) => {
    if (!session) return;
    try {
      const existingOrder = orders.find(
        (o) => o.itemName.trim().toLowerCase() === item.name.trim().toLowerCase()
      );
      if (existingOrder) {
        await updateSessionOrderQuantity(existingOrder.id, existingOrder.quantity + 1);
      } else {
        await addSessionOrder({
          recordId: session.id,
          itemName: item.name,
          quantity: 1,
          price: item.price,
        });
      }
      await loadData();
      onOrdersUpdated();
    } catch (err) {
      console.error("Failed to add order item:", err);
    }
  };

  const handleUpdateOrderQuantity = async (orderId: number, newQty: number) => {
    try {
      if (newQty <= 0) {
        await deleteSessionOrder(orderId);
      } else {
        await updateSessionOrderQuantity(orderId, newQty);
      }
      await loadData();
      onOrdersUpdated();
    } catch (err) {
      console.error("Failed to update order quantity:", err);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    try {
      await deleteSessionOrder(orderId);
      await loadData();
      onOrdersUpdated();
    } catch (err) {
      console.error("Failed to remove order item:", err);
    }
  };

  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    try {
      await createMenuItem({
        name: newItemName,
        category: newItemCategory,
        price: parseFloat(newItemPrice) || 0,
      });
      setNewItemName("");
      setNewItemPrice("");
      setShowAddMenu(false);
      await loadData();
    } catch (err) {
      console.error("Failed to create menu item:", err);
    }
  };

  const handleDeleteMenuItem = async (id: number) => {
    try {
      await deleteMenuItem(id);
      await loadData();
    } catch (err) {
      console.error("Failed to delete menu item:", err);
    }
  };

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const ordersTotal = orders.reduce((acc, o) => acc + o.price * o.quantity, 0);

  if (!open || !session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="bg-slate-900 light:bg-white border border-white/20 light:border-slate-300 rounded-2xl shadow-2xl w-[96vw] max-w-4xl max-h-[92vh] flex flex-col p-4 md:p-6 text-slate-100 light:text-slate-900">
          <DialogHeader>
            <div className="flex items-center justify-between border-b border-white/10 light:border-slate-200 pb-4 mb-2 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 light:bg-amber-100 border border-amber-500/30 text-amber-400 light:text-amber-700">
                  <Coffee className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white light:text-slate-900">
                    Drinks & Snacks Bar (Coffee Net)
                  </DialogTitle>
                  <DialogDescription className="text-sm text-slate-400 light:text-slate-600">
                    Station: <strong className="text-emerald-400 light:text-emerald-700">{session.Device_Type} ({session.VendorName})</strong> | Customer: <strong className="text-white light:text-slate-900">{session.CustomerName}</strong>
                  </DialogDescription>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-lg text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-slate-800 light:hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-1 flex-1 py-2">
            {/* Quick Menu Selection */}
            <div className="space-y-4 bg-slate-800/60 light:bg-slate-100 p-4 rounded-xl border border-white/10 light:border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-200 light:text-slate-900 flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-amber-400 light:text-amber-600" />
                    Available Drinks & Snacks
                  </h4>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setShowAddMenu(!showAddMenu)}
                      className="text-xs text-blue-400 light:text-blue-700 hover:text-blue-300 font-semibold flex items-center gap-1 bg-blue-500/10 light:bg-blue-100 px-2 py-1 rounded-lg border border-blue-500/20 light:border-blue-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {showAddMenu ? "Close Form" : "Add New Item"}
                    </button>
                  )}
                </div>

                {isAdmin && showAddMenu && (
                  <form onSubmit={handleCreateMenuItem} className="space-y-3 bg-slate-900/90 light:bg-white p-3 rounded-lg border border-blue-500/40 light:border-blue-300 mb-3 shadow-md">
                    <div>
                      <Label className="text-xs font-semibold text-slate-300 light:text-slate-700">Item Name</Label>
                      <Input
                        placeholder="e.g. Espresso / Pepsi / Chips"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="h-8 text-xs bg-slate-800 light:bg-slate-50 border-white/10 light:border-slate-300 text-white light:text-slate-900"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs font-semibold text-slate-300 light:text-slate-700">Category</Label>
                        <select
                          value={newItemCategory}
                          onChange={(e) => setNewItemCategory(e.target.value)}
                          className="w-full h-8 text-xs bg-slate-800 light:bg-slate-50 border border-white/10 light:border-slate-300 rounded-md px-2 text-white light:text-slate-900 outline-none"
                        >
                          <option value="Beverage" className="bg-slate-900 light:bg-white text-white light:text-slate-900">Beverage ☕</option>
                          <option value="Snack" className="bg-slate-900 light:bg-white text-white light:text-slate-900">Snack 🥨</option>
                          <option value="Other" className="bg-slate-900 light:bg-white text-white light:text-slate-900">Other 🛒</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-300 light:text-slate-700">Price (EGP)</Label>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="25"
                          value={newItemPrice}
                          onChange={(e) => setNewItemPrice(e.target.value)}
                          className="h-8 text-xs bg-slate-800 light:bg-slate-50 border-white/10 light:border-slate-300 font-bold text-amber-400 light:text-amber-700"
                          required
                        />
                      </div>
                    </div>
                    <Button size="sm" type="submit" className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold">
                      Save to Catalog
                    </Button>
                  </form>
                )}

                {/* Menu items grid */}
                <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
                  {menuItems.length === 0 ? (
                    <p className="text-xs text-slate-500 light:text-slate-500 text-center py-6">No catalog menu items available yet.</p>
                  ) : (
                    menuItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 light:bg-white border border-white/5 light:border-slate-200 hover:border-amber-500/50 transition-all group"
                      >
                        <div>
                          <div className="text-xs font-bold text-white light:text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-amber-400 light:text-amber-700 font-semibold">{item.price} EGP</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAddOrder(item)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 light:bg-amber-100 hover:bg-amber-500 text-amber-300 light:text-amber-800 hover:text-black font-extrabold text-xs transition-colors flex items-center gap-1 border border-amber-500/30 light:border-amber-300"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add to Session
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteMenuItem(item.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 light:hover:bg-slate-200 transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Current Session Receipt Orders */}
            <div className="space-y-4 bg-slate-800/50 light:bg-slate-100 p-4 rounded-xl border border-white/10 light:border-slate-200 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-200 light:text-slate-900 flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-400 light:text-emerald-600" />
                    Session Added Items
                  </span>
                  <span className="text-xs font-semibold bg-emerald-500/20 light:bg-emerald-100 text-emerald-300 light:text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-500/30 light:border-emerald-300">
                    {orders.length} items
                  </span>
                </h4>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {orders.length === 0 ? (
                    <p className="text-xs text-slate-500 light:text-slate-500 text-center py-8">No snacks or drinks ordered for this session yet.</p>
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 light:bg-white border border-white/5 light:border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center gap-1 bg-slate-800 light:bg-slate-100 p-0.5 rounded-md border border-white/10 light:border-slate-300">
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderQuantity(order.id, order.quantity - 1)}
                              className="w-5 h-5 rounded hover:bg-slate-700 light:hover:bg-slate-200 text-slate-300 light:text-slate-700 hover:text-white light:hover:text-slate-900 flex items-center justify-center transition-colors"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="min-w-[20px] font-bold text-emerald-400 light:text-emerald-700 text-center text-xs px-0.5">
                              {order.quantity}x
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderQuantity(order.id, order.quantity + 1)}
                              className="w-5 h-5 rounded hover:bg-slate-700 light:hover:bg-slate-200 text-slate-300 light:text-slate-700 hover:text-white light:hover:text-slate-900 flex items-center justify-center transition-colors"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-medium text-slate-200 light:text-slate-900">{order.itemName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-emerald-400 light:text-emerald-700">{order.price * order.quantity} EGP</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Total Summary */}
              <div className="border-t border-white/10 light:border-slate-200 pt-3 mt-3">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-slate-300 light:text-slate-700">Snacks & Drinks Total:</span>
                  <span className="text-amber-400 light:text-amber-700 text-base">{ordersTotal} EGP</span>
                </div>
                <Button
                  onClick={() => onOpenChange(false)}
                  className="w-full mt-3 h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                >
                  Done & Close Bar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
