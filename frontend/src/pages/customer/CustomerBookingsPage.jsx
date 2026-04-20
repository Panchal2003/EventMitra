import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CalendarCheck2,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Shield,
  XCircle,
  CreditCard,
  Star,
  Ban,
  Zap,
} from "lucide-react";
import { GlassCard } from "../../components/admin/GlassCard";
import { CustomerOtpModal } from "../../components/customer/CustomerOtpModal";
import { CustomerBookingCard } from "../../components/customer/CustomerBookingCard";
import { customerApi } from "../../services/api";
import { useUI } from "../../context/UIContext";
import { formatCurrency } from "../../utils/currency";

export function CustomerBookingsPage({ embedded = false }) {
  const navigate = useNavigate();
  const { hideBottomNav, showBottomNav } = useUI();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCurrentBookings, setShowCurrentBookings] = useState(true);
  const [verifyOtpBooking, setVerifyOtpBooking] = useState(null);
  const [verifyOtpBusy, setVerifyOtpBusy] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackBooking, setFeedbackBooking] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ rating: 5, comment: "" });
  const [showCompletedInHistory, setShowCompletedInHistory] = useState(true);

  const handleSearchFocus = () => hideBottomNav();
  const handleSearchBlur = () => showBottomNav();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await customerApi.getBookings();
      if (response.data?.success) {
        setBookings(response.data.data || []);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleVerifyOtp = async (otp, rating, comment) => {
    if (!verifyOtpBooking) return;

    try {
      setVerifyOtpBusy(true);
      await customerApi.verifyOtp(verifyOtpBooking._id, {
        otp: otp.trim(),
        rating,
        comment: comment?.trim(),
      });
      setVerifyOtpBooking(null);
      await fetchBookings();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to verify OTP");
    } finally {
      setVerifyOtpBusy(false);
    }
  };

  const handleCancelBooking = async (bookingId, cancelReason) => {
    try {
      const response = await customerApi.cancelBooking(bookingId, { cancelReason });
      if (response.data?.success) {
        setCancelSuccess(response.data.message);
        await fetchBookings();
        setShowCurrentBookings(false);
        setTimeout(() => setCancelSuccess(null), 5000);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to cancel booking");
      throw requestError;
    }
  };

  const handlePayRemaining = (booking) => {
    // Navigate directly to payment page - feedback will be collected there
    navigate(`/customer/payment/${booking._id}`);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await customerApi.getBookings();
      if (response.data?.success) {
        setBookings(response.data.data || []);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to refresh bookings");
    } finally {
      setRefreshing(false);
    }
  };

  const filteredBookings = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    if (!search) {
      return bookings;
    }

    return bookings.filter((booking) => {
      const services = booking?.services?.length
        ? booking.services
        : booking?.service
          ? [booking.service]
          : [];
      return (
        services.some((service) => service?.name?.toLowerCase().includes(search)) ||
        booking.provider?.name?.toLowerCase().includes(search) ||
        booking.provider?.businessName?.toLowerCase().includes(search) ||
        booking.location?.toLowerCase().includes(search)
      );
    });
  }, [bookings, searchQuery]);

  const advancePaymentBookings = useMemo(() => {
    return filteredBookings.filter((booking) => booking.paymentStatus === "advance_paid");
  }, [filteredBookings]);

  const completedBookings = useMemo(() => {
    return filteredBookings.filter((booking) => booking.status === "completed");
  }, [filteredBookings]);

  const cancelledBookings = useMemo(() => {
    return filteredBookings.filter((booking) => booking.status === "cancelled");
  }, [filteredBookings]);

  const historyBookings = showCompletedInHistory ? completedBookings : cancelledBookings;

  if (loading) {
    return (
      <div
        className={
          embedded
            ? "flex min-h-[240px] items-center justify-center"
            : "flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden"
        }
      >
        {/* Premium Background Elements */}
        {!embedded && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 h-[600px] w-[600px] bg-gradient-to-br from-primary-200/40 via-blue-200/30 to-indigo-200/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] bg-gradient-to-tr from-purple-200/30 via-pink-200/20 to-rose-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-white/50" />
          </div>
        )}
        <div className="relative flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
          <p className="text-sm text-slate-600 font-medium">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        embedded
          ? "space-y-6"
          : "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden px-4 pb-24 pt-4 sm:p-6"
      }
    >
      {/* Premium Background Elements */}
      {!embedded && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] bg-gradient-to-br from-primary-200/40 via-blue-200/30 to-indigo-200/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] bg-gradient-to-tr from-purple-200/30 via-pink-200/20 to-rose-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/4 left-1/4 h-32 w-32 bg-gradient-to-r from-emerald-200/30 to-teal-200/20 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '8s' }} />
          <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-white/50" />
        </div>
      )}

      <div className={embedded ? "" : "relative mx-auto max-w-5xl"}>
        {!embedded ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-primary-800 to-blue-700 p-6 text-white shadow-2xl shadow-primary-500/20"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary-400 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400 to-transparent rounded-full blur-3xl" />
            </div>

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                  <CalendarCheck2 className="h-4 w-4 text-primary-400" />
                  <span className="text-xs font-bold text-white tracking-wide">MY BOOKINGS</span>
                </div>
                <h1 className="font-display text-3xl font-black text-white">My Bookings</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                  Track provider acceptance, monitor OTP milestones, and keep every event booking in one organized view.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Advance Payment", value: advancePaymentBookings.length, icon: CreditCard },
                  {
                    label: "Active",
                    value: advancePaymentBookings.filter((booking) => ["confirmed", "in_progress", "otp_pending"].includes(booking.status)).length,
                    icon: Zap,
                  },
                  {
                    label: "Completed",
                    value: completedCancelledBookings.filter((booking) => booking.status === "completed").length,
                    icon: Shield,
                  },
                ].map((item) => (
                      <div
                        key={item.label}
                        className={`rounded-2xl border px-4 py-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 ${
                          item.label === "Total"
                            ? "border-cyan-300/30 bg-cyan-400/10"
                            : item.label === "Active"
                              ? "border-emerald-300/30 bg-emerald-400/10"
                              : "border-violet-300/30 bg-violet-400/10"
                        }`}
                      >
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className="h-4 w-4 text-primary-400" />
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
                    </div>
                    <p className="font-display text-2xl font-black text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}

        {filteredBookings.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            {/* Mobile: Toggle + Refresh in row, Search below */}
            <div className="flex flex-col gap-3 sm:hidden">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-lg border border-slate-200 flex-1">
                  <button
                    onClick={() => setShowCurrentBookings(true)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all flex-1 ${
                      showCurrentBookings
                        ? "bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Current
                  </button>
                  <button
                    onClick={() => setShowCurrentBookings(false)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all flex-1 ${
                      !showCurrentBookings
                        ? "bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    History
                  </button>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg shadow-slate-200/20 transition hover:border-primary-200 hover:text-primary-700 disabled:opacity-50"
                >
                  <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by service, provider, or location..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3 pl-12 pr-4 text-sm text-slate-900 shadow-lg shadow-slate-200/20 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                />
              </div>
            </div>

            {/* Desktop: Toggle + Search + Refresh in row */}
            <div className="hidden sm:flex gap-3">
              <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-lg border border-slate-200">
                <button
                  onClick={() => setShowCurrentBookings(true)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    showCurrentBookings
                      ? "bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Current
                </button>
                <button
                  onClick={() => setShowCurrentBookings(false)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    !showCurrentBookings
                      ? "bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  History
                </button>
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by service, provider, or location..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3 pl-12 pr-4 text-sm text-slate-900 shadow-lg shadow-slate-200/20 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                />
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg shadow-slate-200/20 transition hover:border-primary-200 hover:text-primary-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </motion.div>
        ) : null}

        {error ? (
          <GlassCard className="mb-6 border-amber-200 bg-amber-50 p-4" hover={false}>
            <div className="flex items-center gap-3 text-amber-700">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </GlassCard>
        ) : null}

        {cancelSuccess ? (
          <GlassCard className="mb-6 border-emerald-200 bg-emerald-50 p-4" hover={false}>
            <div className="flex items-center gap-3 text-emerald-700">
              <XCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{cancelSuccess}</p>
            </div>
          </GlassCard>
        ) : null}

        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100 shadow-xl shadow-slate-900/5">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 via-blue-500 to-indigo-600 shadow-2xl shadow-primary-500/30 mx-auto"
              >
                <CalendarCheck2 className="h-14 w-14 text-white" />
              </motion.div>
              <h2 className="mt-8 font-display text-2xl font-bold text-slate-900">
                No Bookings Yet
              </h2>
              <p className="mt-3 max-w-md text-slate-500 leading-relaxed">
                Explore providers, add services to cart, or book directly from a provider page to get started.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/services")}
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 px-8 py-4 font-bold text-white shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 transition-all duration-300"
              >
                <Sparkles className="h-5 w-5" />
                Explore Services
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {showCurrentBookings ? (
              /* Advance Payment Bookings Section */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Current Bookings</h3>
                    <p className="text-sm text-slate-500">Your active bookings with advance payment</p>
                  </div>
                  <span className="ml-auto rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                    {advancePaymentBookings.length}
                  </span>
                </div>
                
                {advancePaymentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {advancePaymentBookings.map((booking, index) => (
                      <CustomerBookingCard
                        key={booking._id}
                        booking={booking}
                        index={index}
                        onVerifyOtp={setVerifyOtpBooking}
                        onCancel={handleCancelBooking}
                        onPayRemaining={handlePayRemaining}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6 text-center">
                    <CreditCard className="mx-auto h-8 w-8 text-amber-400" />
                    <p className="mt-2 text-sm text-amber-700">No current bookings</p>
                  </div>
                )}
              </motion.div>
            ) : (
              /* Completed & Cancelled Bookings Section */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-blue-500">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Booking History</h3>
                    <p className="text-sm text-slate-500">Your completed and cancelled bookings</p>
                  </div>
                  <span className="ml-auto rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
                    {completedBookings.length + cancelledBookings.length}
                  </span>
                </div>

                {/* Toggle for Completed/Cancelled */}
                <div className="flex items-center gap-2 mb-4 p-1 bg-white rounded-xl border border-slate-200 w-fit">
                  <button
                    onClick={() => setShowCompletedInHistory(true)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      showCompletedInHistory
                        ? "bg-primary-600 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Completed ({completedBookings.length})
                  </button>
                  <button
                    onClick={() => setShowCompletedInHistory(false)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      !showCompletedInHistory
                        ? "bg-rose-600 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancelled ({cancelledBookings.length})
                  </button>
                </div>
                
                {historyBookings.length > 0 ? (
                  <div className="space-y-4">
                    {historyBookings.map((booking, index) => (
                      <CustomerBookingCard
                        key={booking._id}
                        booking={booking}
                        index={index}
                        onVerifyOtp={setVerifyOtpBooking}
                        onCancel={handleCancelBooking}
                        onPayRemaining={handlePayRemaining}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center">
                    {showCompletedInHistory ? (
                      <>
                        <Shield className="mx-auto h-8 w-8 text-slate-400" />
                        <p className="mt-2 text-sm text-slate-500">No completed bookings</p>
                      </>
                    ) : (
                      <>
                        <XCircle className="mx-auto h-8 w-8 text-rose-400" />
                        <p className="mt-2 text-sm text-slate-500">No cancelled bookings</p>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>

      <CustomerOtpModal
        open={!!verifyOtpBooking}
        booking={verifyOtpBooking}
        busy={verifyOtpBusy}
        onClose={() => setVerifyOtpBooking(null)}
        onSubmit={handleVerifyOtp}
      />

      {feedbackModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setFeedbackModalOpen(false);
            }
          }}
        >
          <div 
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">Rate Your Experience</h2>
              <p className="mt-2 text-sm text-slate-600">
                Please rate your experience before making payment.
              </p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-slate-700">Rating</label>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= feedbackData.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700">Comment (optional)</label>
              <textarea
                value={feedbackData.comment}
                onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                placeholder="Share your experience..."
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none"
                rows={3}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                onClick={() => {
                  setFeedbackModalOpen(false);
                  setFeedbackBooking(null);
                  setFeedbackData({ rating: 5, comment: "" });
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:from-amber-600 hover:to-orange-700 transition-all"
                onClick={() => {
                  localStorage.setItem("pendingFeedback", JSON.stringify({
                    bookingId: feedbackBooking._id,
                    feedback: feedbackData
                  }));
                  setFeedbackModalOpen(false);
                  setFeedbackBooking(null);
                  setFeedbackData({ rating: 5, comment: "" });
                  navigate(`/customer/payment/${feedbackBooking._id}`);
                }}
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
