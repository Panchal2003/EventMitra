import mongoose from "mongoose";
import { Booking } from "../models/Booking.js";
import { BOOKING_STATUS } from "./bookingLifecycle.js";

function normalizeProviderIds(providerIds = []) {
  return [...new Set(providerIds.filter(Boolean).map((id) => String(id)))]
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
}

export async function getProviderRatingSummaryMap(providerIds = []) {
  const normalizedIds = normalizeProviderIds(providerIds);

  if (!normalizedIds.length) {
    return new Map();
  }

  const summaries = await Booking.aggregate([
    {
      $match: {
        provider: { $in: normalizedIds },
        status: BOOKING_STATUS.COMPLETED,
        "feedback.rating": { $gte: 1 },
      },
    },
    {
      $group: {
        _id: "$provider",
        averageRating: { $avg: "$feedback.rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  return new Map(
    summaries.map((summary) => [
      String(summary._id),
      {
        rating: Number(summary.averageRating.toFixed(1)),
        ratingCount: Number(summary.ratingCount || 0),
      },
    ])
  );
}

export async function getProviderRatingSummary(providerId) {
  const summaries = await getProviderRatingSummaryMap([providerId]);
  return summaries.get(String(providerId)) || { rating: null, ratingCount: 0 };
}
