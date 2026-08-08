const API_URL = '/api';

export type Station = {
  id: number;
  name: string;
  stationType?: string;
};

export type VendorName = Station;

let cache: any = null;

export async function loadStations<T = Station[]>(
  fallback: T = [] as unknown as T
): Promise<T> {
  try {
    const res = await fetch(`${API_URL}/stations`);
    const names = await res.json();
    cache = names;
    return names as T;
  } catch (err) {
    console.warn('[Station.load] API fetch failed:', err);
    return fallback;
  }
}

export async function loadVendorName<T = Station[]>(
  fallback: T = [] as unknown as T
): Promise<T> {
  return loadStations<T>(fallback);
}

export async function addOrUpdateStation(
  item: Partial<Station> & { name: string }
): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/stations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to save');
    cache = null;
  } catch (err) {
    console.error('[Station.addOrUpdate] Failed:', err);
    throw err;
  }
}

export async function addOrUpdateVendorName(
  item: Partial<Station> & { name: string }
): Promise<void> {
  return addOrUpdateStation(item);
}

export async function deleteStation(id: number): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/stations/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete');
    cache = null;
  } catch (err) {
    console.error('[Station.delete] Failed:', err);
    throw err;
  }
}

export async function deleteVendorName(id: number): Promise<void> {
  return deleteStation(id);
}

export function clearCache(): void {
  cache = null;
}
