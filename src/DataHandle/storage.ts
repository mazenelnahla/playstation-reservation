const API_URL = '/api';

export type DataRecord = {
  id: number;
  Date_in: string;
  CustomerName: string;
  CustomerPhoneNumber: string;
  Device_Type: string;
  VendorName: string;
  ModelName: string;
  issue: string;
  MaintinancePrice: string;
  Date_out: string;
  DoneBy: string;
  Notes: string;
};

let cache: any = null;

export async function load<T = DataRecord[]>(fallback: T = [] as unknown as T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}/records`);
    const records = await res.json();
    cache = records;
    return records as T;
  } catch (err) {
    console.warn("[storage.load] API fetch failed:", err);
    return fallback;
  }
}

export async function createRecord(record: Omit<DataRecord, 'id'>): Promise<DataRecord> {
  try {
    const res = await fetch(`${API_URL}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    const newRecord = await res.json();
    cache = null;
    return newRecord;
  } catch (err) {
    console.error("[storage.createRecord] Failed:", err);
    throw err;
  }
}

export async function updateRecord(id: number, data: Partial<DataRecord>): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    cache = null;
    return res.ok;
  } catch (err) {
    console.error("[storage.updateRecord] Failed:", err);
    throw err;
  }
}

export async function deleteRecord(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/records/${id}`, { method: 'DELETE' });
    cache = null;
    return res.ok;
  } catch (err) {
    console.error("[storage.deleteRecord] Failed:", err);
    throw err;
  }
}

export type MenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
};

export type SessionOrder = {
  id: number;
  recordId: number;
  itemName: string;
  quantity: number;
  price: number;
  createdAt: string;
};

export type DailyReset = {
  id: number;
  resetAt: string;
  totalProfit: number;
  sessionCount: number;
  resetBy: string;
};

export type MaintenanceLog = {
  id: number;
  deviceName: string;
  cost: number;
  description?: string;
  status: 'Under Maintenance' | 'Repaired / Fixed';
  createdAt: string;
};

export async function fetchMenuItems(): Promise<MenuItem[]> {
  try {
    const res = await fetch(`${API_URL}/menu`);
    return await res.json();
  } catch (err) {
    console.error("[storage.fetchMenuItems] Failed:", err);
    return [];
  }
}

export async function createMenuItem(data: { name: string; category?: string; price: number }): Promise<MenuItem> {
  const res = await fetch(`${API_URL}/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function updateMenuItem(id: number, data: { name: string; category?: string; price: number }): Promise<boolean> {
  const res = await fetch(`${API_URL}/menu/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.ok;
}

export async function deleteMenuItem(id: number): Promise<boolean> {
  const res = await fetch(`${API_URL}/menu/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function fetchSessionOrders(recordId: number): Promise<SessionOrder[]> {
  try {
    const res = await fetch(`${API_URL}/orders/${recordId}`);
    return await res.json();
  } catch (err) {
    console.error("[storage.fetchSessionOrders] Failed:", err);
    return [];
  }
}

export async function addSessionOrder(data: { recordId: number; itemName: string; quantity: number; price: number }): Promise<SessionOrder> {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function updateSessionOrderQuantity(id: number, quantity: number): Promise<boolean> {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
  return res.ok;
}

export async function deleteSessionOrder(id: number): Promise<boolean> {
  const res = await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function fetchDailyResets(): Promise<DailyReset[]> {
  try {
    const res = await fetch(`${API_URL}/resets`);
    return await res.json();
  } catch (err) {
    console.error("[storage.fetchDailyResets] Failed:", err);
    return [];
  }
}

export async function createDailyReset(data: { totalProfit: number; sessionCount: number; resetBy: string }): Promise<DailyReset> {
  const res = await fetch(`${API_URL}/resets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function fetchMaintenanceLogs(): Promise<MaintenanceLog[]> {
  try {
    const res = await fetch(`${API_URL}/maintenance`);
    return await res.json();
  } catch (err) {
    console.error("[storage.fetchMaintenanceLogs] Failed:", err);
    return [];
  }
}

export async function createMaintenanceLog(data: {
  deviceName: string;
  cost: number;
  description?: string;
  status?: string;
}): Promise<MaintenanceLog> {
  const res = await fetch(`${API_URL}/maintenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function updateMaintenanceLog(
  id: number,
  data: { deviceName: string; cost: number; description?: string; status: string }
): Promise<boolean> {
  const res = await fetch(`${API_URL}/maintenance/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.ok;
}

export async function deleteMaintenanceLog(id: number): Promise<boolean> {
  const res = await fetch(`${API_URL}/maintenance/${id}`, { method: 'DELETE' });
  return res.ok;
}
