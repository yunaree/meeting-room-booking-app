"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { addUserToRoom, apiRequest, deleteBooking, getCurrentUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toast } from "sonner";
import { AlertTriangleIcon, Ban, ChevronDown, ChevronUp, Trash } from "lucide-react";
import { Booking } from "@/types/booking";

export default function RoomPage() {
  const { id } = useParams();
  const [room, setRoom] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);

  async function loadRoom() {
    const data = await apiRequest(`/rooms/${id}`, { method: "GET" });
    setRoom(data);
  }

  async function loadBookings() {
    const data = await apiRequest<Booking[]>(`/bookings?roomId=${id}`, { method: "GET" });
    setBookings(data);
  }

  async function loadUser() {
    const data = getCurrentUser();
    setUser(data);
  }

async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    try {
        await apiRequest<any>(`/bookings/`, {
            method: "POST",
            body: JSON.stringify({ roomId: id, title, description, startTime, endTime}),
        });
        toast.success("Бронювання створено!");
        loadBookings();
        setError("");
        setTitle("");
        setDescription("");
        setStartTime("");
        setEndTime("");
    } catch (err: any) {
        const msg = (err?.message || "").toLowerCase();
        if (msg.includes("зайнят") || msg.includes("conflict")) {
            setError("Цей час вже заброньований. Виберіть інший часовий проміжок.");
        } else if (msg.includes("не достатньо прав")) {
            setError("Тільки адміністратор кімнати може створювати бронювання.");
        } else {
            setError("Не вдалося створити бронювання.");
        }
    }
    }

  async function handleDeleteBooking (bookingId: string){
    try {
      await deleteBooking(bookingId);
      loadBookings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    loadUser();
    loadRoom();
    loadBookings();
  }, [id]);

  async function handleAddMember() {
    try {
      await addUserToRoom(id as string, email, "USER");
      setEmail("");
      loadRoom();
      alert("User added to the room");
    } catch (err: any) {
      // alert(err.message || "Failed to add user");
    }
  }

  if (!room) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
        <Card className="border-0 shadow-none">
        <CardHeader
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setShowBookingForm(!showBookingForm)}
        >
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            Create a Booking
          </CardTitle>
          {showBookingForm ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </CardHeader>
        {showBookingForm && (
          <CardContent>
            <form onSubmit={handleBooking} className="space-y-3 mt-2">
                {error && <p className="flex items-center align-center gap-3"><AlertTriangleIcon/>{error}</p>}
              <div>
                <Label className="pb-3">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Team Meeting"
                />
              </div>
              <div>
                <Label className="pb-3">Start Time</Label>
                <Input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label className="pb-3">End Time</Label>
                <Input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              <div>
                <Label className="pb-3">Description</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <Button type="submit" className="w-full" onClick={handleBooking}>Book Room</Button>
            </form>
          </CardContent>
        )}
      </Card>

      <Card className="border-0 shadow-none">
          <CardHeader
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setShowAddMemberForm(!showAddMemberForm)}
          >
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              Add Member by Email
            </CardTitle>
            {showAddMemberForm ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </CardHeader>
          {showAddMemberForm && (
            <CardContent>
              <form onSubmit={handleAddMember} className="space-y-3 mt-2 flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter user email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-28">Add Member</Button>
              </form>
            </CardContent>
          )}
        </Card>

      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{room.title}</CardTitle>
          <p className="text-gray-600">{room.description}</p>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-3">Current Bookings</h3>
          {bookings.length === 0 && <p>No bookings yet.</p>}
          <ul className="space-y-2">
            {bookings.map((b) => (
              <li key={b.id} className="border p-3 rounded-lg">
                <p className="font-medium">{b.title || "Untitled"}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(b.startTime), "PPpp")} — {format(new Date(b.endTime), "PPpp")}
                </p>
                {b.userId === user.id && 
                <span
                    className="text-xs flex align-center gap-1 items-center text-blue-600 hover:underline"
                    onClick={() => handleDeleteBooking(b.id)} 
                >
                    <Ban className="w-3"/> Cancel booking
                </span>
                }

              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
