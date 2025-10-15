"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, getRooms } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RoomCard } from "@/components/rooms/RoomCard";
import { RoomForm } from "@/components/rooms/RoomForm";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await getRooms();
        setRooms(data);
        const user = await getCurrentUser();
        console.log("User data:", user);
        console.log(token)
        setIsAdmin(user.isSystemAdmin === true);

      } catch (err: any) {
        console.error("Failed to fetch rooms:", err);
        if (err.message?.includes("401") || err.message?.includes("unauthorized")) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        } else {
          setError(err.message || "Failed to load rooms");
        }
      } finally {
        setLoading(false);
      }
    }

    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    loadRooms();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading rooms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">
            Meeting Rooms
          </h1>

          {isAdmin && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Button>
          )}
        </div>

        {rooms.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No rooms available</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isAdmin={isAdmin}
                onUpdated={(updatedRoom) =>
                    setRooms((prev) =>
                    prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r))
                    )
                }
                />

            ))}
          </div>
        )}

        {showForm && (
          <RoomForm
            onClose={() => setShowForm(false)}
            onSuccess={(newRoom) => setRooms([...rooms, newRoom])}
          />
        )}
      </div>
    </div>
  );
}
