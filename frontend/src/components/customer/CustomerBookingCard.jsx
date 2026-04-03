import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  User,
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
              Enter your OTP and share feedback to close this booking.
            </p>
            {booking.completionOtpCode ? (
              <div className="mt-4 rounded-xl border border-amber-200/60 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Completion OTP</p>
                <p className="mt-2 font-mono text-3xl font-black tracking-widest text-amber-700">
                  {booking.completionOtpCode}
                </p>
              </div>
            ) : null}
            <Button
              onClick={() => onVerifyOtp(booking)}
              variant="success"
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-success-600 to-success-700 text-white shadow-lg shadow-success-500/20 hover:from-success-700 hover:to-success-800 hover:shadow-xl hover:shadow-success-500/30"
            >
              Verify OTP
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (booking.status === "completed" && booking.feedback) {
    return (
      <div className="rounded-2xl border border-primary-200/60 bg-gradient-to-br from-primary-50 to-emerald-50 p-5">
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

  return null;
}

export function CustomerBookingCard({ booking, index = 0, onVerifyOtp }) {
  const services = getBookingServices(booking);
  const primaryService = services[0];
  const providerDisplayName = getProviderDisplayName(booking);
  const totalMembers = Math.max(Number(booking?.guestCount) || 1, 1);

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

        <div className="px-5 pb-5 pt-6 sm:px-6 sm:pb-6">
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

          <div className="mt-5 grid grid-cols-2 gap-3">
            {metaItems.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4"
              >
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </div>
                <p className={`mt-2 text-sm font-bold text-slate-900 ${item.valueClassName || ""}`}>
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{item.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <BookingStatusPanel booking={booking} onVerifyOtp={onVerifyOtp} />
          </div>
        </div>
      </article>
    </motion.div>
  );
}
