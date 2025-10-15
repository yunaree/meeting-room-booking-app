import { Request, Response } from "express";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  addUserToRoom,
} from "../services/roomService.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: "Назва обов’язкова" });

    const room = await createRoom(title, description, req.user!.id);
    res.status(201).json(room);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const rooms = await getAllRooms(req.user!.id);
    res.json(rooms);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const room = await getRoomById(req.params.id);
    if (!room) return res.status(404).json({ message: "Кімнату не знайдено" });
    res.json(room);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const updated = await updateRoom(id, title, description);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    await deleteRoom(req.params.id);
    res.json({ message: "Кімнату видалено" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const addUser = async (req: Request, res: Response) => {
  try {
    const { roomId, email, role } = req.body;
    const result = await addUserToRoom(roomId, email, role);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
