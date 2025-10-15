"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteRoom } from "@/lib/api";
import { EditRoomForm } from "./EditRoomForm";

export function RoomMenu({ room, onUpdated }: { room: any; onUpdated: (updated: any) => void }) {
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this room?")) {
      await deleteRoom(room.id);
      location.reload();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1 rounded hover:bg-gray-100">
            <MoreVertical className="w-3 text-gray-600" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEdit(true)}>
            <Pencil className="w-4 h-4 mr-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600"
          >
            <Trash className="w-4 h-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showEdit && (
        <EditRoomForm
          room={room}
          onClose={() => setShowEdit(false)}
          onUpdated={onUpdated}
        />
      )}
    </>
  );
}
