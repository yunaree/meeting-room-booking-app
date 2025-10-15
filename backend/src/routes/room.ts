import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { create, getAll, getOne, update, remove, addUser } from "../controllers/roomController.js";

const router = express.Router();

router.get("/", authMiddleware, getAll);
router.get("/:id", authMiddleware, getOne);
router.post("/", authMiddleware, create);
router.put("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, remove);
router.post("/add-user", authMiddleware, addUser);

export default router;