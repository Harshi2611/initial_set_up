import { Request, Response } from "express";
import { stripe } from "../config/stripe";
import {
  createBooking,
  findBookingById,
  findBookingByStripePaymentId,
  updateBookingStatus,
  updatePaymentStatus,
  getUserBookings,
  checkRoomAvailability,
  getBookingStats,
} from "../repositories/booking.repository";
//
export const createBookingHandler = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalAmount,
      paymentMethodId,
    } = req.body;

    // Check room availability
    const isAvailable = await checkRoomAvailability(
      roomId,
      new Date(checkInDate),
      new Date(checkOutDate)
    );

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        error: "Room is not available for the selected dates",
      });
    }

    // Create a customer in Stripe
    const customer = await stripe.customers.create({
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: "inr",
      customer: customer.id,
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.FRONTEND_URL}/booking/confirmation`,
    });

    // Create booking record
    const booking = await createBooking({
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalAmount,
      stripePaymentId: paymentIntent.id,
      stripeCustomerId: customer.id,
      paymentStatus:
        paymentIntent.status === "succeeded" ? "completed" : "pending",
      status: paymentIntent.status === "succeeded" ? "confirmed" : "pending",
    });

    res.status(201).json({
      success: true,
      data: {
        booking,
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const confirmBookingHandler = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      const booking = await findBookingByStripePaymentId(paymentIntentId);

      if (booking) {
        await updateBookingStatus(booking.id, "confirmed");
        await updatePaymentStatus(booking.id, "completed");

        const updatedBooking = await findBookingById(booking.id);
        res.status(200).json({
          success: true,
          data: updatedBooking,
        });
      } else {
        throw new Error("Booking not found");
      }
    } else {
      throw new Error("Payment not successful");
    }
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const getBookingDetailsHandler = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const booking = await findBookingById(Number(bookingId));

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const getUserBookingsHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const bookings = await getUserBookings(Number(userId));

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const getBookingStatsHandler = async (req: Request, res: Response) => {
  try {
    const stats = await getBookingStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
