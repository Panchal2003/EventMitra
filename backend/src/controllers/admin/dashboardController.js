import { Booking } from "../../models/Booking.js";
import { Payment } from "../../models/Payment.js";
import { User } from "../../models/User.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getDashboardMetrics = asyncHandler(async (req, res) => {
  // Only count bookings that have paid advance
  const totalBookingsAll = await Booking.countDocuments({ 
    paymentStatus: { $ne: "advance_pending" } 
  });
  const [
    activeServiceProviders,
    pendingApprovals,
    pendingPayouts,
  ] = await Promise.all([
    User.countDocuments({
      role: "serviceProvider",
      providerStatus: "approved",
    }),
    User.countDocuments({
      role: "serviceProvider",
      providerStatus: "pending",
    }),
    Payment.countDocuments({
      paymentType: "provider_payout",
      status: "pending",
    }),
  ]);

  // Get total revenue from paid bookings (using booking totalAmount)
  const paidBookings = await Booking.find({
    paymentStatus: { $in: ["advance_paid", "full_paid"] },
  }).select("totalAmount");

  const totalRevenue = paidBookings.reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);
  const calculatedAdminProfit = Math.round(totalRevenue * 0.11);
  const providerRevenue = Math.round(totalRevenue * 0.89);

  res.json({
    success: true,
    data: {
      totalBookings: totalBookingsAll,
      totalRevenue,
      totalAdminProfit: calculatedAdminProfit,
      providerRevenue,
      activeServiceProviders,
      pendingApprovals,
      pendingPayouts,
    },
  });
});
