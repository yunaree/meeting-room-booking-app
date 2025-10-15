import prisma from "../prisma/client.js";

export const createRoom = async (title: string, description: string | null, userId: string) => {
  const room = await prisma.room.create({
    data: {
      title,
      description,
      members: {
        create: {
          userId,
          role: "ADMIN",
        },
      },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  return room;
};

export const getAllRooms = async (userId: string) => {
  // Показуємо лише ті кімнати, де користувач є учасником
  return prisma.room.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getRoomById = async (id: string) => {
  return prisma.room.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      bookings: true,
    },
  });
};

export const updateRoom = async (id: string, title?: string, description?: string) => {
  return prisma.room.update({
    where: { id },
    data: { title, description },
  });
};

export const deleteRoom = async (id: string) => {
  return prisma.room.delete({ where: { id } });
};

export const addUserToRoom = async (roomId: string, email: string, role: "ADMIN" | "USER") => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Користувача не знайдено");

  const existing = await prisma.roomUser.findUnique({
    where: { roomId_userId: { roomId, userId: user.id } },
  });
  if (existing) throw new Error("Користувач уже доданий до кімнати");

  return prisma.roomUser.create({
    data: { roomId, userId: user.id, role },
  });
};
