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
    totalRevenueAgg,
    activeServiceProviders,
    pendingApprovals,
    pendingPayouts,
  ] = await Promise.all([
    Payment.aggregate([
      {
        $match: {
          paymentType: { $in: ["advance", "remaining"] },
          status: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]),
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

  // Calculate admin profit as 11% of total revenue
  const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;
  const calculatedAdminProfit = Math.round(totalRevenue * 0.11);

  res.json({
    success: true,
    data: {
      totalBookings: totalBookingsAll,
      totalRevenue,
      totalAdminProfit: calculatedAdminProfit,
      activeServiceProviders,
      pendingApprovals,
      pendingPayouts,
    },
  });
});
