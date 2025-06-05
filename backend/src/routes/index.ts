import express from "express";
import bookingRoutes from "./booking.routes";

const router = express.Router();

router.use("/bookings", bookingRoutes);

export default router;
