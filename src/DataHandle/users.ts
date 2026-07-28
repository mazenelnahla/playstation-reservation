export interface UserItem {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = "/api/users";

export async function fetchUsers(): Promise<UserItem[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  return res.json();
}

export async function createUser(data: {
  email: string;
  name: string;
  password: string;
  isAdmin: boolean;
}): Promise<UserItem> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create user");
  }
  return res.json();
}

export async function updateUserRole(id: string, isAdmin: boolean): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isAdmin }),
  });
  if (!res.ok) {
    throw new Error("Failed to update user role");
  }
}

export async function updateUser(
  id: string,
  data: {
    name: string;
    email: string;
    isAdmin: boolean;
    password?: string;
  }
): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update user");
  }
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete user");
  }
}
