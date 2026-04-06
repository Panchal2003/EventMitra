import { Payment } from "../../models/Payment.js";
import { User } from "../../models/User.js";
import { AppError } from "../../utils/appError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getProviders = asyncHandler(async (req, res) => {
  const providers = await User.find({ role: "serviceProvider" })
    .select("-password")
    .populate("serviceCategory", "name")
    .sort({ createdAt: -1 })
    .lean();

  const payments = await Payment.aggregate([
    {
      $match: {
        provider: { $in: providers.map((provider) => provider._id) },
      },
    },
    {
      $group: {
        _id: "$provider",
        totalRevenue: { $sum: "$amount" },
      },
    },
  ]);

  const paymentMap = payments.reduce((accumulator, payment) => {
    accumulator[payment._id.toString()] = payment.totalRevenue;
    return accumulator;
  }, {});

  const enrichedProviders = providers.map((provider) => ({
    ...provider,
    totalRevenue: paymentMap[provider._id.toString()] || 0,
  }));

  res.json({
    success: true,
    data: enrichedProviders,
  });
});

export const updateProviderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["approved", "rejected", "suspended"];

  if (!allowedStatuses.includes(status)) {
    throw new AppError("Invalid provider status.", 400);
  }

  const provider = await User.findOneAndUpdate(
    { _id: req.params.providerId, role: "serviceProvider" },
    { providerStatus: status },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");

  if (!provider) {
    throw new AppError("Service provider not found.", 404);
  }

  res.json({
    success: true,
    message: `Provider ${status} successfully.`,
    data: provider,
  });
});

