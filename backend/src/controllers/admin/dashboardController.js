import { Booking } from "../../models/Booking.js";
import { Payment } from "../../models/Payment.js";
import { User } from "../../models/User.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getDashboardMetrics = asyncHandler(async (req, res) => {
  const [
    totalBookings,
    totalRevenueAgg,
    activeServiceProviders,
    pendingApprovals,
    pendingPayouts,
    adminProfitAgg,
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
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
      status: "pending",
    }),
    Payment.aggregate([
      {
        $group: {
          _id: null,
          totalProfit: { $sum: "$adminProfit" },
        },
      },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalBookings,
      totalRevenue: totalRevenueAgg[0]?.totalRevenue || 0,
      totalAdminProfit: adminProfitAgg[0]?.totalProfit || 0,
      activeServiceProviders,
      pendingApprovals,
      pendingPayouts,
    },
  });
});

