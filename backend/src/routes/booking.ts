import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import * as bookingController from "../controllers/bookingController.js";

const router = express.Router();

router.use(authMiddleware);

// створити бронювання (admin кімнати)
router.post("/", bookingController.createBooking);

// отримати список: ?roomId=...
router.get("/", bookingController.listBookings);

// отримати одне
router.get("/:id", bookingController.getBooking);

// оновити
router.put("/:id", bookingController.updateBooking);

// видалити
router.delete("/:id", bookingController.deleteBooking);

// приєднатися / вийти
router.post("/:id/join", bookingController.joinBookingHandler);
router.delete("/:id/leave", bookingController.leaveBookingHandler);

export default router;
