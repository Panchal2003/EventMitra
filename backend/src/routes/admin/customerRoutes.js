import { Router } from "express";
import { User } from "../../models/User.js";
import { Booking } from "../../models/Booking.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const customerRoutes = Router();

// Get all customers with their booking stats
customerRoutes.get("/", asyncHandler(async (req, res) => {
  const customers = await User.find({ role: "customer" })
    .select("-password")
    .sort({ createdAt: -1 });

  // Get booking stats for each customer
  const customersWithStats = await Promise.all(
    customers.map(async (customer) => {
      const bookingStats = await Booking.aggregate([
        { $match: { customer: customer._id, paymentStatus: { $ne: "advance_pending" } } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const statsMap = bookingStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      const totalSpent = await Booking.aggregate([
        { $match: { customer: customer._id, status: "completed", paymentStatus: { $ne: "advance_pending" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);

      return {
        ...customer.toObject(),
        totalBookings: Object.values(statsMap).reduce((a, b) => a + b, 0),
        completedBookings: statsMap.completed || 0,
        pendingBookings: (statsMap.pending || 0) + (statsMap.provider_assigned || 0),
        totalSpent: totalSpent[0]?.total || 0,
      };
    })
  );

  res.json({
    success: true,
    data: customersWithStats,
  });
}));

// Get single customer details with all bookings
customerRoutes.get("/:customerId", asyncHandler(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.customerId, role: "customer" })
    .select("-password");

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  const bookings = await Booking.find({ 
    customer: customer._id,
    paymentStatus: { $ne: "advance_pending" }
  })
    .populate({
      path: "service",
      select: "name category startingPrice",
      populate: { path: "category", select: "name" },
    })
    .populate({
      path: "provider",
      select: "name businessName",
    })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      customer,
      bookings,
    },
  });
}));
