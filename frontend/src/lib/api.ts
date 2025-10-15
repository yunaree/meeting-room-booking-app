import { Room } from "@/types/room";
import { User } from "@/types/user";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`HTTP ${res.status}`);
    }
    throw new Error(data.message || "Request failed");
  }

  return res.json();
}

//
// 🧩 Методи для роботи з кімнатами
//

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/auth/me", { method: "GET" });
}

export async function getRooms(): Promise<Room[]> {
  return apiRequest<Room[]>("/rooms", { method: "GET" });
}

export async function createRoom(data: { title: string; description: string }) {
  console.log(JSON.stringify(data))
  return apiRequest("/rooms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateRoom(id: string, data: { name: string; description: string }) {
  return apiRequest(`/rooms/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteRoom(id: string) {
  return apiRequest(`/rooms/${id}`, {
    method: "DELETE",
  });
}

export async function deleteBooking(id: string) {
  return apiRequest(`/bookings/${id}`, {
    method: "DELETE",
  });
}

export async function addUserToRoom(roomId: string, email: string, role: string) {
  return apiRequest(`/rooms/add-user`, {
    method: "POST",
    body: JSON.stringify({ roomId, email, role }),
  });
}
