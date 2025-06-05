import { Op } from "sequelize";
import Booking, { BookingAttributes } from "../models/booking.model";

export class BookingRepository {
  // Create a new booking
  async create(bookingData: Partial<BookingAttributes>): Promise<Booking> {
    return await Booking.create(bookingData);
  }

  // Find booking by ID
  async findById(id: number): Promise<Booking | null> {
    return await Booking.findByPk(id);
  }

  // Find booking by Stripe payment ID
  async findByStripePaymentId(
    stripePaymentId: string
  ): Promise<Booking | null> {
    return await Booking.findOne({
      where: { stripePaymentId },
    });
  }

  // Update booking status
  async updateStatus(
    id: number,
    status: BookingAttributes["status"]
  ): Promise<[number, Booking[]]> {
    return await Booking.update({ status }, { where: { id }, returning: true });
  }

  // Update payment status
  async updatePaymentStatus(
    id: number,
    paymentStatus: BookingAttributes["paymentStatus"]
  ): Promise<[number, Booking[]]> {
    return await Booking.update(
      { paymentStatus },
      { where: { id }, returning: true }
    );
  }

  // Get all bookings for a user
  async getUserBookings(userId: number): Promise<Booking[]> {
    return await Booking.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  }

  // Get all bookings for a room
  async getRoomBookings(roomId: number): Promise<Booking[]> {
    return await Booking.findAll({
      where: { roomId },
      order: [["createdAt", "DESC"]],
    });
  }

  // Check room availability for given dates
  async checkRoomAvailability(
    roomId: number,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<boolean> {
    const conflictingBookings = await Booking.count({
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
  }

  // Get all active bookings
  async getActiveBookings(): Promise<Booking[]> {
    return await Booking.findAll({
      where: {
        status: "confirmed",
        checkOutDate: {
          [Op.gte]: new Date(),
        },
      },
      order: [["checkInDate", "ASC"]],
    });
  }

  // Get booking statistics
  async getBookingStats(): Promise<{
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
  }> {
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
  }
}

export default new BookingRepository();
