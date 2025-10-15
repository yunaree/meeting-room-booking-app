import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RoomMenu } from "./RoomMenu";

export function RoomCard({ room, isAdmin }: { room: any; isAdmin: boolean }) {
  return (
    <Card className="relative group hover:shadow-lg transition-shadow duration-300">
      {isAdmin && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition">
          <RoomMenu room={room} />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{room.name}</CardTitle>
        <CardDescription>{room.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
