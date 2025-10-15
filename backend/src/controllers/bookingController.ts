import { Request, Response } from "express";
import * as bookingService from "../services/bookingService.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import prisma from "../prisma/client.js";

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, startTime, endTime, title, description } = req.body;
    console.log("req.body:", req.body);
    if (!roomId || !startTime || !endTime) {
      return res.status(400).json({ message: "roomId, startTime та endTime потрібні" });
    }

    const ok = await bookingService.isRoomAdmin(roomId, req.user!.id);
    if (!ok) return res.status(403).json({ message: "Не достатньо прав (треба бути admin кімнати)" });

    const booking = await bookingService.createBooking({
      roomId,
      createdById: req.user!.id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      title,
      description,
    });

    return res.status(201).json(booking);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const listBookings = async (req: AuthRequest, res: Response) => {
  try {
    const roomId = req.query.roomId as string | undefined;
    if (roomId) {
      const membership = await prisma.roomUser.findUnique({
        where: { roomId_userId: { roomId, userId: req.user!.id } },
      });
      if (!membership && ! (await prisma.user.findUnique({ where: { id: req.user!.id } }))?.isSystemAdmin) {
        return res.status(403).json({ message: "Не має доступу до цієї кімнати" });
      }

      const bookings = await bookingService.getBookingsForRoom(roomId);
      return res.json(bookings);
    }

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { createdById: req.user!.id },
          { participants: { some: { userId: req.user!.id } } },
        ],
      },
      include: {
        room: true,
        createdBy: { select: { id: true, name: true, email: true } },
        participants: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { startTime: "asc" },
    });

    return res.json(bookings);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const getBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id);
    if (!booking) return res.status(404).json({ message: "Бронювання не знайдено" });

    // перевірка доступу: користувач має бути учасником кімнати або system admin
    const membership = await prisma.roomUser.findUnique({
      where: { roomId_userId: { roomId: booking.roomId, userId: req.user!.id } },
    });
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!membership && !user?.isSystemAdmin) {
      return res.status(403).json({ message: "Не має доступу до цього бронювання" });
    }

    return res.json(booking);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, title, description } = req.body;

    const booking = await bookingService.getBookingById(id);
    if (!booking) return res.status(404).json({ message: "Бронювання не знайдено" });

    const isAdmin = await bookingService.isRoomAdmin(booking.roomId, req.user!.id);
    const isCreator = booking.createdById === req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });

    if (!(isAdmin || isCreator || user?.isSystemAdmin)) {
      return res.status(403).json({ message: "Не має прав для редагування бронювання" });
    }

    const updated = await bookingService.updateBooking(id, {
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      title,
      description,
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const deleteBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id);
    if (!booking) return res.status(404).json({ message: "Бронювання не знайдено" });

    const isAdmin = await bookingService.isRoomAdmin(booking.roomId, req.user!.id);
    const isCreator = booking.createdById === req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });

    if (!(isAdmin || isCreator || user?.isSystemAdmin)) {
      return res.status(403).json({ message: "Не має прав для видалення бронювання" });
    }

    await bookingService.deleteBooking(id);
    return res.json({ message: "Бронювання видалено" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const joinBookingHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // bookingId
    const booking = await bookingService.getBookingById(id);
    if (!booking) return res.status(404).json({ message: "Бронювання не знайдено" });

    // перевірка: користувач має бути учасником кімнати
    const membership = await prisma.roomUser.findUnique({
      where: { roomId_userId: { roomId: booking.roomId, userId: req.user!.id } },
    });
    if (!membership && !(await prisma.user.findUnique({ where: { id: req.user!.id } }))?.isSystemAdmin) {
      return res.status(403).json({ message: "Не має доступу до цієї кімнати" });
    }

    const participant = await bookingService.joinBooking(id, req.user!.id);
    return res.json(participant);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const leaveBookingHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // bookingId
    const result = await bookingService.leaveBooking(id, req.user!.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
