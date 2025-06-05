import express, { Router } from "express";
import {
  createBookingHandler,
  confirmBookingHandler,
  getBookingDetailsHandler,
  getUserBookingsHandler,
  getBookingStatsHandler,
} from "../controllers/booking.controller";

const router: Router = express.Router();

// Create a new bookin with payment
router.post("/", createBookingHandler);

// Confirm booking after payment
router.post("/confirm", confirmBookingHandler);

// Get booking details
router.get("/:bookingId", getBookingDetailsHandler);

// Get all bookings for a specific user
router.get("/user/:userId", getUserBookingsHandler);

// Get booking statistics
router.get("/stats/overview", getBookingStatsHandler);

export default router;
