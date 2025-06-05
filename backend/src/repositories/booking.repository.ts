import { db } from "@/sequilizedir/models";
import User, { IUser } from "@/sequilizedir/models/user.model";
import { Op } from "sequelize";
// Create a new booking
export const createBooking = async (
  bookingData: Partial<IUser>
): Promise<User> => {
  return await db.User.create(bookingData);
};

// Fid booking by ID
export const findBookingById = async (id: number): Promise<Booking | null> => {
  return await db.User.findByPk(id);
};

// Find booking by Stripe payment ID
export const findBookingByStripePaymentId = async (
  stripePaymentId: string
): Promise<User | null> => {
  return await db.User.findOne({
    where: { stripePaymentId },
  });
};

// Update booking status
export const updateBookingStatus = async (
  id: number,
  status: BookingAttributes["status"]
): Promise<[number, Booking[]]> => {
  return await db.User.update({ status }, { where: { id }, returning: true });
};

// Update payment status
export const updatePaymentStatus = async (
  id: number,
  paymentStatus: BookingAttributes["paymentStatus"]
): Promise<[number, Booking[]]> => {
  return await Booking.update(
    { paymentStatus },
    { where: { id }, returning: true }
  );
};

// Get all bookings for a user
export const getUserBookings = async (userId: number): Promise<Booking[]> => {
  return await db.User.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
  });
};

// Get all bookings for a room
export const getRoomBookings = async (roomId: number): Promise<Booking[]> => {
  return await db.User.findAll({
    where: { roomId },
    order: [["createdAt", "DESC"]],
  });
};

// Check room availability for given dates
export const checkRoomAvailability = async (
  roomId: number,
  checkInDate: Date,
  checkOutDate: Date
): Promise<boolean> => {
  const conflictingBookings = await db.User.count({
    where: {
      roomId,
      status: "confirmed",
      [Op.or]: [
        {
          checkInDate: {
            [Op.between]: [checkInDate, checkOutDate],
          },
        },
        {
          checkOutDate: {
            [Op.between]: [checkInDate, checkOutDate],
          },
        },
        {
          [Op.and]: [
            { checkInDate: { [Op.lte]: checkInDate } },
            { checkOutDate: { [Op.gte]: checkOutDate } },
          ],
        },
      ],
    },
  });

  return conflictingBookings === 0;
};

// Get all active bookings
export const getActiveBookings = async (): Promise<Booking[]> => {
  return await Booking.findAll({
    where: {
      status: "confirmed",
      checkOutDate: {
        [Op.gte]: new Date(),
      },
    },
    order: [["checkInDate", "ASC"]],
  });
};

// Get booking statistics
export const getBookingStats = async (): Promise<{
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}> => {
  const [
    totalBookings,
    confirmedBookings,
    pendingBookings,
    cancelledBookings,
    totalRevenue,
  ] = await Promise.all([
    Booking.count(),
    Booking.count({ where: { status: "confirmed" } }),
    Booking.count({ where: { status: "pending" } }),
    Booking.count({ where: { status: "cancelled" } }),
    Booking.sum("totalAmount", {
      where: { status: "confirmed", paymentStatus: "completed" },
    }),
  ]);

  return {
    totalBookings,
    confirmedBookings,
    pendingBookings,
    cancelledBookings,
    totalRevenue: totalRevenue || 0,
  };
};
