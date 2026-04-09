import { motion } from "framer-motion";
import {
  CheckCircle2,
  Eye,
  PlayCircle,
  XCircle,
  CalendarCheck2,
  Clock,
  CheckCircle,
  Sparkles,
  KeyRound,
  Loader2,
  MessageSquare,
  Star,
  TrendingUp,
  Zap,
  Target,
  Award,
  Activity,
  ArrowRight,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  Shield
} from "lucide-react";
import { useMemo, useState } from "react";
import { GlassCard } from "../../components/admin/GlassCard";
import { Button } from "../../components/common/Button";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ProviderBookingDetailsModal } from "../../components/provider/ProviderBookingDetailsModal";
import { ProviderCompleteJobModal } from "../../components/provider/ProviderCompleteJobModal";
import { useProviderDashboardData } from "../../hooks/useProviderDashboardData";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";

const sectionAnimation = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

export function ProviderBookingsPage() {
  const {
    actionInFlight,
    bookings = [],
    completeJob,
    error,
    loading,
    respondToBooking,
    verifyStartOtp,
    regenerateCompletionOtp,
    startJob,
  } = useProviderDashboardData();

  const [notice, setNotice] = useState(null);
  const [detailsBooking, setDetailsBooking] = useState(null);
  const [completionBooking, setCompletionBooking] = useState(null);
  const [startOtpBooking, setStartOtpBooking] = useState(null);
  const [startOtpValue, setStartOtpValue] = useState("");
  const [startOtpError, setStartOtpError] = useState("");
  const [activeTab, setActiveTab] = useState("requests");
  
  const requestBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "provider_assigned"),
    [bookings]
  );
  const activeBookings = useMemo(
    () =>
      bookings.filter((booking) =>
        ["confirmed", "in_progress", "otp_pending"].includes(booking.status)
      ),
    [bookings]
  );
  const completedBookings = useMemo(
    () => bookings.filter((booking) => ["completed", "rejected"].includes(booking.status)),
    [bookings]
  );
  const cancelledBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "cancelled"),
    [bookings]
  );

  const handleBookingResponse = async (bookingId, action) => {
    try {
      await respondToBooking(bookingId, action);
      setNotice({
        type: "success",
        message: action === "accept" ? "Booking accepted successfully." : "Booking rejected successfully.",
      });
    } catch (requestError) {
      setNotice({
        type: "error",
        message: getErrorMessage(requestError, "Unable to update this booking request."),
      });
    }
  };

  const handleStartJob = async (booking) => {
    if (booking.startOtpRequested) {
      setStartOtpBooking(booking);
      setStartOtpValue("");
      setStartOtpError("");
      return;
    }

    try {
      await startJob(booking._id);
      setNotice({
        type: "success",
        message: "Start OTP generated. Ask the customer to share it, then verify it here to begin the job.",
      });
    } catch (requestError) {
      setNotice({
        type: "error",
        message: getErrorMessage(requestError, "Unable to start the job."),
      });
    }
  };

  const handleVerifyStartOtp = async () => {
    if (!startOtpBooking || startOtpValue.trim().length !== 4) {
      return;
    }

    try {
      await verifyStartOtp(startOtpBooking._id, startOtpValue.trim());
      setStartOtpBooking(null);
      setStartOtpValue("");
      setStartOtpError("");
      setNotice({ type: "success", message: "Start OTP verified. Job is now in progress." });
    } catch (requestError) {
      setStartOtpError(getErrorMessage(requestError, "Unable to verify the start OTP."));
    }
  };

  const handleRegenerateOtp = async (bookingId) => {
    try {
      await regenerateCompletionOtp(bookingId);
      setNotice({ type: "success", message: "A new completion OTP has been generated." });
    } catch (err) {
      setNotice({ type: "error", message: err.response?.data?.message || "Failed to regenerate OTP" });
    }
  };

  const handleCompleteJob = async () => {
    try {
      await completeJob(completionBooking._id);
      setNotice({
        type: "success",
        message: "Final OTP generated. The customer can now complete the booking from their side and submit feedback.",
      });
      setCompletionBooking(null);
    } catch (requestError) {
      setNotice({
        type: "error",
        message: getErrorMessage(requestError, "Unable to mark this job complete."),
      });
    }
  };

  const tabs = [
    { id: "requests", label: "Requests", count: requestBookings.length, icon: CalendarCheck2, gradient: "from-amber-500 to-orange-500" },
    { id: "active", label: "Active", count: activeBookings.length, icon: Clock, gradient: "from-blue-500 to-indigo-500" },
    { id: "completed", label: "Completed", count: completedBookings.length, icon: CheckCircle, gradient: "from-primary-500 to-blue-500" },
    { id: "cancelled", label: "Cancelled", count: cancelledBookings.length, icon: XCircle, gradient: "from-rose-500 to-red-500" },
  ];

  // Render booking card for mobile
  const renderBookingCard = (booking, type) => (
    <motion.div
      key={booking._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-lg transition-all duration-300 hover:shadow-xl"
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 opacity-10 blur-2xl transition-transform group-hover:scale-150"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">{booking.service?.name}</p>
            {booking.services?.length > 1 ? (
              <p className="mt-1 text-xs font-medium text-primary-600">
                +{booking.services.length - 1} more booked service
                {booking.services.length - 1 !== 1 ? "s" : ""}
              </p>
            ) : null}
            <p className="mt-1 text-xs text-slate-500">{booking.customer?.name}</p>
            <p className="mt-1 text-xs text-slate-400">
              {formatDate(booking.eventDate)} | {booking.location}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900">{formatCurrency(booking.totalAmount)}</p>
            <p className="text-xs text-slate-500">{booking.guestCount} guests</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-primary-700 font-medium">
              Your Share: {formatCurrency(booking.providerAmount || Math.round(booking.totalAmount * 0.89))}
            </p>
            <p className="text-xs text-slate-400">
              (11% fee: {formatCurrency(booking.adminProfit || Math.round(booking.totalAmount * 0.11))})
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setDetailsBooking(booking)}>
            <Eye className="h-4 w-4" />
            Details
          </Button>
          {type === "requests" && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleBookingResponse(booking._id, "accept")}
                isLoading={actionInFlight === `respond-booking-${booking._id}-accept`}
              >
                <CheckCircle2 className="h-4 w-4" />
                Accept
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleBookingResponse(booking._id, "reject")}
                isLoading={actionInFlight === `respond-booking-${booking._id}-reject`}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </>
          )}
          {type === "active" && booking.status === "confirmed" && (
            <Button
              size="sm"
              onClick={() => handleStartJob(booking)}
              isLoading={actionInFlight === `start-job-${booking._id}` || actionInFlight === `verify-start-otp-${booking._id}`}
            >
              <PlayCircle className="h-4 w-4" />
              {booking.startOtpRequested ? "Verify Start OTP" : "Generate Start OTP"}
            </Button>
          )}
          {type === "active" && booking.status === "in_progress" && (
            <Button
              variant="success"
              size="sm"
              onClick={() => setCompletionBooking(booking)}
              isLoading={actionInFlight === `complete-job-${booking._id}`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete
            </Button>
          )}
          {type === "active" && booking.status === "otp_pending" && (
            <Button
              size="sm"
              onClick={() => handleRegenerateOtp(booking._id)}
              isLoading={actionInFlight === `regenerate-otp-${booking._id}`}
            >
              <KeyRound className="h-4 w-4" />
              Regenerate OTP
            </Button>
          )}
        </div>
        {booking.status === "confirmed" && booking.startOtpRequested ? (
          <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
            The start OTP has been generated on the customer side. Ask the customer for that OTP and verify it to begin the job.
          </div>
        ) : null}
        {booking.status === "otp_pending" ? (
          <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Final OTP has been generated. The customer must open their booking, enter that OTP, and submit feedback to finish this booking.
          </div>
        ) : null}
        {booking.status === "completed" && booking.feedback ? (
          <div className="mt-3 rounded-2xl border border-primary-100 bg-primary-50/80 p-3">
            <div className="flex items-center gap-2 text-primary-800">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={`provider-feedback-${booking._id}-${index}`}
                  className={`h-4 w-4 ${index < Number(booking.feedback.rating || 0) ? "fill-current" : ""}`}
                />
              ))}
              <span className="text-sm font-semibold">
                {Number(booking.feedback.rating || 0).toFixed(1)} customer rating
              </span>
            </div>
            {booking.feedback.comment ? (
              <p className="mt-2 flex items-start gap-2 text-sm text-primary-700">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{booking.feedback.comment}</span>
              </p>
            ) : null}
          </div>
        ) : null}
        {booking.status === "cancelled" && booking.cancellation ? (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3">
            <p className="text-xs font-semibold text-rose-700 mb-2">Cancellation Details</p>
            <div className="flex items-center gap-4 text-xs text-rose-600">
              <div>
                <span className="font-medium">Booked:</span> {formatDate(booking.eventDate)}
              </div>
              <div>
                <span className="font-medium">Cancelled:</span> {booking.cancellation.cancelledAt ? formatDate(booking.cancellation.cancelledAt, true) : "-"}
              </div>
            </div>
            {booking.cancellation.cancelReason && (
              <p className="mt-2 text-xs text-rose-600">Reason: {booking.cancellation.cancelReason}</p>
            )}
            {booking.cancellation.refundAmount > 0 && (
              <p className="mt-2 text-xs font-semibold text-emerald-600">
                Refund: {formatCurrency(booking.cancellation.refundAmount)} ({booking.cancellation.cancellationPolicy?.replace('_', ' ')})
              </p>
            )}
          </div>
        ) : null}
      </div>
    </motion.div>
  );

  const currentBookings = activeTab === "requests" ? requestBookings : activeTab === "active" ? activeBookings : activeTab === "cancelled" ? cancelledBookings : completedBookings;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="space-y-6 px-4 pb-8 pt-4 sm:px-6 lg:px-8 sm:pb-6">
        {/* Hero Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 text-white shadow-xl sm:p-8"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
            <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-pink-500/20 blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-40"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium backdrop-blur-sm"
                >
                  <CalendarCheck2 className="h-3.5 w-3.5" />
                  Booking Management
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl"
                >
                  My Bookings
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-2 max-w-lg text-sm text-purple-100"
                >
                  Manage your booking requests and active jobs efficiently.
                </motion.p>
              </div>
              
              {/* Stats preview cards */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="hidden lg:grid lg:grid-cols-4 lg:gap-3"
              >
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/20">
                      <CalendarCheck2 className="h-5 w-5 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-200">Requests</p>
                      <p className="text-lg font-bold">{requestBookings.length}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-400/20">
                      <Activity className="h-5 w-5 text-blue-300" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-200">Active</p>
                      <p className="text-lg font-bold">{activeBookings.length}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-400/20">
                      <Award className="h-5 w-5 text-blue-300" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-200">Completed</p>
                      <p className="text-lg font-bold">{completedBookings.length}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-400/20">
                      <XCircle className="h-5 w-5 text-rose-300" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-200">Cancelled</p>
                      <p className="text-lg font-bold">{cancelledBookings.length}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Error/Notice Messages */}
        {error && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        {notice && (
          <div className={`rounded-xl px-4 py-3 text-sm ${
            notice.type === "success"
              ? "border border-blue-100 bg-blue-50 text-blue-700"
              : "border border-rose-100 bg-rose-50 text-rose-600"
          }`}>
            {notice.message}
          </div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="overflow-x-auto rounded-2xl bg-white p-1.5 shadow-xl"
        >
          <div className="flex gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all sm:flex-none sm:px-4 sm:py-2.5 sm:text-sm ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${
                      activeTab === tab.id ? "bg-white/20" : "bg-slate-200"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Bookings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {currentBookings.length > 0 ? (
            <div className="space-y-3">
              {currentBookings.map((booking) => renderBookingCard(booking, activeTab))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-12 text-center shadow-xl">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100"
              >
                <Sparkles className="h-10 w-10 text-blue-400" />
              </motion.div>
              <p className="font-semibold text-slate-600">
                {activeTab === "requests" && "No booking requests"}
                {activeTab === "active" && "No active bookings"}
                {activeTab === "completed" && "No completed bookings"}
                {activeTab === "cancelled" && "No cancelled bookings"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {activeTab === "requests" && "New requests will appear here"}
                {activeTab === "active" && "Accepted bookings will appear here"}
                {activeTab === "completed" && "Completed jobs will appear here"}
                {activeTab === "cancelled" && "Cancelled bookings will appear here"}
              </p>
            </div>
          )}
        </motion.div>

        <ProviderBookingDetailsModal
          open={Boolean(detailsBooking)}
          booking={detailsBooking}
          onClose={() => setDetailsBooking(null)}
        />

        <ProviderCompleteJobModal
          open={Boolean(completionBooking)}
          booking={completionBooking}
          onClose={() => setCompletionBooking(null)}
          onSubmit={handleCompleteJob}
          busy={actionInFlight === `complete-job-${completionBooking?._id}`}
        />

        {startOtpBooking ? (
          <div className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(241,245,249,0.9)_45%,rgba(226,232,240,0.84)_100%)] p-3 pt-4 pb-24 backdrop-blur-md sm:items-center sm:p-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_24px_70px_rgba(148,163,184,0.24)] sm:p-6"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Verify Start OTP</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter the OTP shared by the customer to start this job.
                  </p>
                </div>
                <button onClick={() => setStartOtpBooking(null)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                <p className="font-semibold text-slate-900">{startOtpBooking.service?.name}</p>
                <p className="mt-1 text-sm text-slate-500">{startOtpBooking.customer?.name}</p>
              </div>

              {startOtpError ? (
                <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {startOtpError}
                </div>
              ) : null}

              <div className="mt-4">
                <input
                  type="text"
                  value={startOtpValue}
                  onChange={(event) => setStartOtpValue(event.target.value)}
                  placeholder="Enter 4-digit OTP"
                  maxLength={4}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-2xl font-mono tracking-[0.35em] text-slate-900 outline-none transition focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
                />
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setStartOtpBooking(null)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyStartOtp}
                  disabled={startOtpValue.trim().length !== 4 || actionInFlight === `verify-start-otp-${startOtpBooking._id}`}
                  className="flex-1 rounded-2xl bg-primary-600 px-4 py-3 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {actionInFlight === `verify-start-otp-${startOtpBooking._id}` ? (
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  ) : (
                    "Start Work"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}

      </div>
    </div>
  );
}
