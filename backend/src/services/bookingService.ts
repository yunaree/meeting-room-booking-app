import prisma from "../prisma/client.js";

/**
 * Простий overlap check:
 * existing.startTime < newEnd && existing.endTime > newStart
 * Ми шукаємо будь-яке бронювання для тієї ж кімнати, яке перетинається.
 */
export const hasBookingConflict = async (
  roomId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<boolean> => {
  const where: any = {
    roomId,
    AND: [
      { startTime: { lt: endTime } },
      { endTime: { gt: startTime } },
    ],
  };
  if (excludeBookingId) where.id = { not: excludeBookingId };

  const conflict = await prisma.booking.findFirst({ where });
  return Boolean(conflict);
};

export const createBooking = async (opts: {
  roomId: string;
  createdById: string;
  startTime: Date;
  endTime: Date;
  title?: string | null;
  description?: string | null;
}) => {
  const { roomId, startTime, endTime, createdById, title, description } = opts;

  if (startTime >= endTime) throw new Error("startTime має бути менше за endTime");

  const conflict = await hasBookingConflict(roomId, startTime, endTime);
  if (conflict) throw new Error("Час вже зайнятий для цієї кімнати");

  const booking = await prisma.booking.create({
    data: {
      roomId,
      createdById,
      startTime,
      endTime,
      title,
      description,
    },
    include: {
      participants: { include: { user: { select: { id: true, name: true, email: true } } } },
      room: true,
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  return booking;
};

export const getBookingsForRoom = async (roomId: string) => {
  return prisma.booking.findMany({
    where: { roomId },
    include: {
      participants: { include: { user: { select: { id: true, name: true, email: true } } } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { startTime: "asc" },
  });
};

export const getBookingById = async (id: string) => {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      participants: { include: { user: { select: { id: true, name: true, email: true } } } },
      createdBy: { select: { id: true, name: true, email: true } },
      room: true,
    },
  });
};

export const updateBooking = async (id: string, opts: {
  startTime?: Date;
  endTime?: Date;
  title?: string | null;
  description?: string | null;
}) => {
  const existing = await prisma.booking.findUnique({ where: { id } });
  if (!existing) throw new Error("Бронювання не знайдено");

  const newStart = opts.startTime ?? existing.startTime;
  const newEnd = opts.endTime ?? existing.endTime;
  if (newStart >= newEnd) throw new Error("startTime має бути менше за endTime");

  // Перевірка конфлікту, виключаючи саме це бронювання
  const conflict = await hasBookingConflict(existing.roomId, newStart, newEnd, id);
  if (conflict) throw new Error("Час уже зайнятий для цієї кімнати");

  return prisma.booking.update({
    where: { id },
    data: {
      startTime: newStart,
      endTime: newEnd,
      title: opts.title,
      description: opts.description,
    },
    include: {
      participants: { include: { user: { select: { id: true, name: true, email: true } } } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
};

export const deleteBooking = async (id: string) => {
  return prisma.booking.delete({ where: { id } });
};

export const joinBooking = async (bookingId: string, userId: string) => {
  const exist = await prisma.usersBookings.findUnique({
    where: { bookingId_userId: { bookingId, userId } },
  });
  if (exist) throw new Error("Ви вже долучені до цього бронювання");

  return prisma.usersBookings.create({
    data: { bookingId, userId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
};

export const leaveBooking = async (bookingId: string, userId: string) => {
  const exist = await prisma.usersBookings.findUnique({
    where: { bookingId_userId: { bookingId, userId } },
  });
  if (!exist) throw new Error("Ви не є учасником цього бронювання");

  return prisma.usersBookings.delete({
    where: { bookingId_userId: { bookingId, userId } },
  });
};

/** Перевірка чи має користувач роль ADMIN у кімнаті або isSystemAdmin */
export const isRoomAdmin = async (roomId: string, userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.isSystemAdmin) return true;

  const membership = await prisma.roomUser.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
  return membership?.role === "ADMIN";
};
