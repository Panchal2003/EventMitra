import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CalendarCheck2,
  Loader2,
  Search,
  Sparkles,
  Zap,
  Shield,
  XCircle,
} from "lucide-react";
import { GlassCard } from "../../components/admin/GlassCard";
import { CustomerOtpModal } from "../../components/customer/CustomerOtpModal";
import { CustomerBookingCard } from "../../components/customer/CustomerBookingCard";
import { customerApi } from "../../services/api";

export function CustomerBookingsPage({ embedded = false }) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyOtpBooking, setVerifyOtpBooking] = useState(null);
  const [verifyOtpBusy, setVerifyOtpBusy] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(null);

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
        setTimeout(() => setCancelSuccess(null), 5000);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to cancel booking");
      throw requestError;
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
                  { label: "Total", value: bookings.length, icon: CalendarCheck2 },
                  {
                    label: "Active",
                    value: bookings.filter((booking) => ["confirmed", "in_progress", "otp_pending"].includes(booking.status)).length,
                    icon: Zap,
                  },
                  {
                    label: "Completed",
                    value: bookings.filter((booking) => booking.status === "completed").length,
                    icon: Shield,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
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

        {bookings.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by service, provider, or location..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/90 backdrop-blur-2xl py-3 pl-12 pr-4 text-sm shadow-lg shadow-slate-200/20 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
              />
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {filteredBookings.map((booking, index) => (
              <CustomerBookingCard
                key={booking._id}
                booking={booking}
                index={index}
                onVerifyOtp={setVerifyOtpBooking}
                onCancel={handleCancelBooking}
              />
            ))}
          </motion.div>
        )}
      </div>

      <CustomerOtpModal
        open={!!verifyOtpBooking}
        booking={verifyOtpBooking}
        busy={verifyOtpBusy}
        onClose={() => setVerifyOtpBooking(null)}
        onSubmit={handleVerifyOtp}
      />
    </div>
  );
}
