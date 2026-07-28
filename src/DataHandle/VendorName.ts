const API_URL = '/api';

export type VendorName = {
  id: number;
  name: string;
  stationType?: string;
};

let cache: any = null;

export async function loadVendorName<T = VendorName[]>(
  fallback: T = [] as unknown as T
): Promise<T> {
  try {
    const res = await fetch(`${API_URL}/vendors`);
    const names = await res.json();
    cache = names;
    return names as T;
  } catch (err) {
    console.warn('[VendorName.load] API fetch failed:', err);
    return fallback;
  }
}

export async function addOrUpdateVendorName(
  item: Partial<VendorName> & { name: string }
): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to save');
    cache = null;
  } catch (err) {
    console.error('[VendorName.addOrUpdate] Failed:', err);
    throw err;
  }
}

export async function deleteVendorName(id: number): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/vendors/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete');
    cache = null;
  } catch (err) {
    console.error('[VendorName.delete] Failed:', err);
    throw err;
  }
}

export function clearCache(): void {
  cache = null;
}
