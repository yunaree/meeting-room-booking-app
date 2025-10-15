import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RoomMenu } from "./RoomMenu";
import Link from "next/link";

interface RoomCardProps {
  room: any;
  isAdmin: boolean;
  onUpdated: (updatedRoom: any) => void;
}

export function RoomCard({ room, isAdmin, onUpdated }: RoomCardProps) {
  return (
    <Card className="relative group hover:shadow-lg transition-shadow duration-300">
      {isAdmin && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition">
          <RoomMenu room={room} onUpdated={onUpdated} />
        </div>
      )}
      <Link href={`/rooms/${room.id}`} >
        <CardHeader>
            <CardTitle className="text-lg font-semibold">{room.title}</CardTitle>
            <CardDescription className="text-gray-600">
            {room.description || "No description provided"}
            </CardDescription>
        </CardHeader>
      </Link>
    </Card>
  );
}
