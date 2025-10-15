export interface Booking {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  roomId: string;
  userId: string;
}