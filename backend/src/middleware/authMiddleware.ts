import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import { IUserPayload } from "../types/user.js";

dotenv.config();

export interface AuthRequest extends Request {
  user?: IUserPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Токен відсутній або некоректний" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IUserPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Недійсний токен" });
  }
};
