import { Request, Response } from "express";
import { registerUser, loginUser, getCurrentUser } from "../services/authService.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Заповніть усі поля" });

    const user = await registerUser(name, email, password);
    res.status(201).json({ message: "Реєстрація успішна", user });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    res.json({ message: "Успішний вхід", ...data });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const user = await getCurrentUser(req.user!.id);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};
