import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Clock3,
  CreditCard,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  XCircle,
  Zap,
} from "lucide-react";
import { Button } from "../common/Button";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";

const statusColors = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  provider_assigned: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  in_progress: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  otp_pending: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  cancelled: "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
};

const statusLabels = {
  pending: "Pending",
  provider_assigned: "Awaiting Provider",
  confirmed: "Accepted",
  rejected: "Rejected",
  in_progress: "In Progress",
  otp_pending: "Finish With OTP",
  completed: "Completed",
  cancelled: "Cancelled",
};

function getBookingServices(booking) {
  if (booking?.services?.length) {
    return booking.services;
  }

  return booking?.service ? [booking.service] : [];
}

function getProviderDisplayName(booking) {
  return booking?.provider?.businessName || booking?.provider?.name || "Provider pending";
}

function BookingStatusPanel({ booking, onVerifyOtp }) {
  if (booking.status === "provider_assigned") {
    return (
      <div className="rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50 to-purple-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20">
            <Clock3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-violet-800">Booking request sent to provider</p>
            <p className="mt-1 text-sm text-violet-700">
              Your provider has received the booking request. The next update will appear here after they respond.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (booking.status === "confirmed") {
    return (
      <div className="rounded-2xl border border-primary-200/60 bg-gradient-to-br from-primary-50 to-blue-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 text-white shadow-lg shadow-primary-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-primary-800">Your booking has been accepted</p>
            {booking.bookingOtp ? (
              <>
                <p className="mt-1 text-sm text-primary-700">
                  The provider is ready to start. Share this OTP so the work can begin.
                </p>
                <div className="mt-4 rounded-xl border border-primary-200/60 bg-white px-5 py-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">Start OTP</p>
                  <p className="mt-2 font-mono text-3xl font-black tracking-widest text-primary-700">
                    {booking.bookingOtp}
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-1 text-sm text-primary-700">
                The start OTP will appear here once the provider is ready to begin.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (booking.status === "in_progress") {
    return (
      <div className="rounded-2xl border border-sky-200/60 bg-gradient-to-br from-sky-50 to-cyan-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-lg shadow-sky-500/20">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-sky-800">Work has started</p>
            <p className="mt-1 text-sm text-sky-700">
              Arrival OTP has been verified. Final OTP and feedback will be needed when the booking is completed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (booking.status === "otp_pending") {
    return (
      <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">Final step pending</p>
            <p className="mt-1 text-sm text-amber-700">
              Complete the remaining payment, then enter your OTP and share feedback to close this booking.
            </p>
            {booking.completionOtpCode ? (
              <div className="mt-4 rounded-xl border border-amber-200/60 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Completion OTP</p>
                <p className="mt-2 font-mono text-3xl font-black tracking-widest text-amber-700">
                  {booking.completionOtpCode}
                </p>
              </div>
            ) : null}
            {booking.payment?.paymentStatus === "full_paid" ? (
              <Button
                onClick={() => onVerifyOtp(booking)}
                variant="success"
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-success-600 to-success-700 text-white shadow-lg shadow-success-500/20 hover:from-success-700 hover:to-success-800 hover:shadow-xl hover:shadow-success-500/30"
              >
                Verify OTP
              </Button>
            ) : (
              <p className="mt-4 rounded-xl border border-amber-200/70 bg-white px-4 py-3 text-sm text-amber-700">
                Remaining payment is still pending. Use the payment action below before final OTP verification.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (booking.status === "completed" && booking.feedback) {
    const payment = booking.payment || {};
    return (
      <div className="rounded-2xl border border-primary-200/60 bg-gradient-to-br from-primary-50 to-emerald-50 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Left side - Feedback */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-emerald-600 text-white shadow-lg shadow-primary-500/20">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary-800">Booking completed with your feedback</p>
              <div className="mt-2 flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={`rating-${booking._id}-${index}`}
                    className={`h-5 w-5 ${index < Number(booking.feedback.rating || 0) ? "fill-current" : ""}`}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm text-primary-700">{booking.feedback.comment}</p>
            </div>
          </div>
          
          {/* Right side - Payment Summary */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase text-emerald-700">Complete Payment</p>
            <p className="mt-1 text-sm font-bold text-emerald-700">
              {formatCurrency(booking.totalAmount || 0)}
            </p>
            <p className="mt-1 text-xs font-medium text-emerald-600">
              ✓ Fully paid
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (booking.status === "rejected") {
    return (
      <div className="rounded-2xl border border-rose-200/60 bg-gradient-to-br from-rose-50 to-pink-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/20">
            <AlertCircle className="h-5 w-5" />
          </div>
          <p className="text-sm text-rose-700">
            Provider ne is request ko reject kiya hai. Aap kisi aur provider ke saath dobara booking create kar sakte hain.
          </p>
        </div>
      </div>
    );
  }

  if (booking.status === "cancelled" && booking.cancellation) {
    const cancelledByProvider = booking.cancellation.cancelledBy?.toString() === booking.provider?._id?.toString();
    const isRefundInProcess = booking.cancellation.refundStatus === "pending" && booking.cancellation.refundAmount > 0;
    const isRefundCompleted = booking.cancellation.refundStatus === "completed" && booking.cancellation.refundAmount > 0;
    
    return (
      <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-slate-100 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/20">
            <XCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-slate-800">Booking Cancelled</p>
              {isRefundInProcess && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                  Refund in Process
                </span>
              )}
              {isRefundCompleted && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  Refund Completed
                </span>
              )}
            </div>
            <div className="mt-1 text-sm text-slate-600">
              <span className="font-medium">Booked:</span> {formatDate(booking.eventDate)}
              <span className="mx-2">|</span>
              <span className="font-medium">Cancelled:</span> {booking.cancellation.cancelledAt ? formatDate(booking.cancellation.cancelledAt, true) : "-"}
            </div>
            
            {cancelledByProvider && (
              <div className="mt-2 rounded-lg bg-rose-50 px-4 py-3 border border-rose-200">
                <p className="text-xs font-semibold text-rose-700 uppercase tracking-wide">Cancelled by Provider</p>
                {booking.provider && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-rose-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{booking.provider.name || "Provider"}</p>
                      {booking.provider.phone && (
                        <p className="text-xs text-slate-500">{booking.provider.phone}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {booking.cancellation.cancelReason && (
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-medium">Reason:</span> {booking.cancellation.cancelReason}
              </p>
            )}
            
            {booking.cancellation.refundAmount > 0 && (
              <div className="mt-3 rounded-lg bg-emerald-50 px-4 py-3 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-emerald-700">
                    Refund Amount: {formatCurrency(booking.cancellation.refundAmount)}
                  </p>
                  {isRefundInProcess && (
                    <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      Processing
                    </span>
                  )}
                  {isRefundCompleted && (
                    <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Credited
                    </span>
                  )}
                </div>
                {isRefundInProcess && (
                  <p className="mt-1 text-xs text-emerald-600">
                    Your refund has been successfully initiated. The amount will be credited to your account within 2 business days.
                  </p>
                )}
                {isRefundCompleted && (
                  <p className="mt-1 text-xs text-emerald-600">
                    Refund has been credited to your account. Thank you for using EventMitra!
                  </p>
                )}
              </div>
            )}
            
            {booking.cancellation.cancellationPolicy === "no_refund" && (
              <p className="mt-2 text-xs text-slate-500">No refund applicable (cancelled within 24 hours)</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function BookingPaymentPanel({ booking, onPayRemaining }) {
  const payment = booking.payment || {};
  const canPayRemaining =
    (booking.status === "otp_pending" || booking.status === "completed") &&
    payment.paymentStatus !== "full_paid" &&
    Number(payment.remainingAmount || 0) > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Payment Summary</p>
          {payment.paymentStatus === "full_paid" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase text-emerald-700">Complete Payment</p>
              <p className="mt-1 text-sm font-bold text-emerald-700">
                {formatCurrency(booking.totalAmount || 0)}
              </p>
              <p className="mt-1 text-xs font-medium text-emerald-600">
                ✓ Fully paid
              </p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                <p className="text-[11px] font-semibold uppercase text-slate-500">Advance Paid</p>
                <p className="mt-1 text-sm font-bold text-emerald-700">
                  {formatCurrency(payment.advancePaid || 0)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                <p className="text-[11px] font-semibold uppercase text-slate-500">Remaining Due</p>
                <p className="mt-1 text-sm font-bold text-amber-700">
                  {formatCurrency(payment.remainingAmount || 0)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                <p className="text-[11px] font-semibold uppercase text-slate-500">Status</p>
                <p className="mt-1 text-sm font-bold capitalize text-slate-900">
                  {(payment.paymentStatus || "unpaid").replace(/_/g, " ")}
                </p>
              </div>
            </div>
          )}
        </div>
        {canPayRemaining && onPayRemaining && (
          <div className="mt-4">
            <button
              onClick={() => onPayRemaining(booking)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300"
            >
              <CreditCard className="h-4 w-4" />
              Pay Remaining {payment.remainingAmount ? `(${formatCurrency(payment.remainingAmount)})` : ""}
            </button>
          </div>
        )}
    </div>
  );
}

export function CustomerBookingCard({ booking, index = 0, onVerifyOtp, onCancel, onPayRemaining }) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(null);

  const services = getBookingServices(booking);
  const primaryService = services[0];
  const providerDisplayName = getProviderDisplayName(booking);
  const totalMembers = Math.max(Number(booking?.guestCount) || 1, 1);

  const canCancel = 
    booking.status === "cancelled" ? false :
    ["pending", "provider_assigned"].includes(booking.status) ||
    (booking.status === "confirmed" && !booking.startOtpRequested) ||
    booking.status === "in_progress";

  const getHoursUntilEvent = () => {
    const eventTime = new Date(booking.eventDate);
    const now = new Date();
    return (eventTime - now) / (1000 * 60 * 60);
  };

  const getRefundPolicy = () => {
    const hours = getHoursUntilEvent();
    if (hours > 36) return { policy: "100% advance refund", refund: 100, className: "bg-emerald-50 border-emerald-200" };
    if (hours >= 24) return { policy: "80% advance refund", refund: 80, className: "bg-blue-50 border-blue-200" };
    if (hours >= 18) return { policy: "75% advance refund", refund: 75, className: "bg-indigo-50 border-indigo-200" };
    if (hours >= 12) return { policy: "65% advance refund", refund: 65, className: "bg-amber-50 border-amber-200" };
    return { policy: "50% advance refund", refund: 50, className: "bg-rose-50 border-rose-200" };
  };

  const handleCancelConfirm = async () => {
    if (!onCancel) return;
    setCancelling(true);
    try {
      await onCancel(booking._id, cancelReason);
      setShowCancelModal(false);
      setCancelReason("");
    } catch (error) {
      console.error("Cancel failed:", error);
    } finally {
      setCancelling(false);
    }
  };

  const metaItems = [
    {
      label: "Event Date",
      value: formatDate(booking.eventDate),
      hint: booking.eventTime || "Time not added",
      icon: Clock3,
    },
    {
      label: "Address",
      value: booking.location || "Address not provided",
      hint: "Event location",
      icon: MapPin,
    },
    {
      label: "Total Amount",
      value: formatCurrency(booking.totalAmount),
      hint: "Booking value",
      icon: ShieldCheck,
      valueClassName: "text-emerald-700",
    },
    {
      label: "Total Members",
      value: `${totalMembers}`,
      hint: totalMembers === 1 ? "Single member booking" : "Members included",
      icon: User,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="group relative"
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500/10 via-transparent to-blue-500/10 blur-xl opacity-0 transition-all duration-500 group-hover:opacity-100" />
      <article className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-900/5 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary-500/10">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-blue-500 to-indigo-500" />

        <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/15 to-blue-500/15 text-primary-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-display text-lg font-black text-slate-900 sm:text-xl">
                      {primaryService?.name || "Service Booking"}
                    </h3>
                    {services.length > 1 ? (
                      <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700 ring-1 ring-primary-200/70">
                        +{services.length - 1} more service{services.length - 1 !== 1 ? "s" : ""}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${statusColors[booking.status] || "bg-slate-100 text-slate-700"}`}
                    >
                      {statusLabels[booking.status] || booking.status}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-600">
                      <User className="h-4 w-4 text-slate-400" />
                      {providerDisplayName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {booking.provider?._id ? (
              <Link
                to={`/provider/${booking.provider._id}`}
                className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:text-primary-700"
              >
                View Provider
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {metaItems.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3.5"
              >
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </div>
                <p className={`mt-2 text-sm font-bold text-slate-900 ${item.valueClassName || ""}`}>
                  {item.value}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">{item.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <BookingStatusPanel booking={booking} onVerifyOtp={onVerifyOtp} />
          </div>

          <div className="mt-5">
            {!((booking.status === "completed" && booking.feedback) || booking.status === "cancelled") && (
              <BookingPaymentPanel booking={booking} onPayRemaining={onPayRemaining} />
            )}
          </div>

          {canCancel && (
            <div className="mt-5 flex justify-end">
              <Button
                variant="danger"
                onClick={() => setShowCancelModal(true)}
                className="rounded-xl"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Booking
              </Button>
            </div>
          )}
        </div>
      </article>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                <XCircle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Cancel Booking?</h3>
                <p className="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to cancel this booking?
            </p>

            <div className={`p-4 rounded-xl border mb-4 ${getRefundPolicy().className}`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">Refund Policy</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-800">{getRefundPolicy().policy}</span>
                {getHoursUntilEvent() > 0 && (
                  <span className="text-xs text-slate-500">
                    {Math.floor(getHoursUntilEvent())} hours until event
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="flex-1 rounded-xl"
                disabled={cancelling}
              >
                Go Back
              </Button>
              <Button
                variant="danger"
                onClick={handleCancelConfirm}
                className="flex-1 rounded-xl"
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Confirm Cancel"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {cancelSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
            >
              <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <h3 className="text-lg font-bold text-slate-900">Booking Cancelled!</h3>
            <p className="mt-2 text-sm text-slate-600">{cancelSuccess}</p>
            <button
              onClick={() => setCancelSuccess(null)}
              className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              OK
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
