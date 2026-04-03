import { Payment } from "../models/Payment.js";

const ADMIN_COMMISSION_RATE = 0.11; // 11% goes to admin

export const calculateProviderPayout = (totalAmount) => Math.round(Number(totalAmount || 0) * (1 - ADMIN_COMMISSION_RATE));

export const calculateAdminProfit = (totalAmount) => Math.round(Number(totalAmount || 0) * ADMIN_COMMISSION_RATE);

export const calculatePayoutDueDate = (eventDate) => {
  const dueDate = new Date(eventDate);
  dueDate.setDate(dueDate.getDate() + 2);
  return dueDate;
};

export const upsertPendingPaymentForBooking = async (booking) => {
  const totalAmount = Number(booking.totalAmount || 0);
  const providerAmount = calculateProviderPayout(totalAmount);
  const adminProfit = calculateAdminProfit(totalAmount);

  return Payment.findOneAndUpdate(
    { booking: booking._id },
    {
      booking: booking._id,
      provider: booking.provider,
      amount: totalAmount,
      providerAmount,
      adminProfit,
      status: "pending",
      method: "bank_transfer",
      payoutDueDate: calculatePayoutDueDate(booking.eventDate),
      releasedAt: undefined,
      transactionId: undefined,
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
};

