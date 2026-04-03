import { motion } from "framer-motion";
import { 
  CalendarCheck2, 
  Search, 
  UserCog, 
  XCircle, 
  CheckCircle, 
  Clock,
  MapPin,
  Users,
  IndianRupee,
  X,
  User,
  Phone
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { AssignProviderModal } from "../../components/admin/AssignProviderModal";
import { GlassCard } from "../../components/admin/GlassCard";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useAdminPanelData } from "../../hooks/useAdminPanelData";
import { useUI } from "../../context/UIContext";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";

const sectionAnimation = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;
const assignableBookingStatuses = ["pending", "provider_assigned", "confirmed", "rejected"];

const getStatusConfig = (status) => {
  const configs = {
    completed: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle, label: "Completed" },
    confirmed: { bg: "bg-blue-100", text: "text-blue-700", icon: Clock, label: "Confirmed" },
    provider_assigned: { bg: "bg-purple-100", text: "text-purple-700", icon: UserCog, label: "Assigned" },
    in_progress: { bg: "bg-indigo-100", text: "text-indigo-700", icon: Clock, label: "In Progress" },
    pending: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock, label: "Pending" },
    cancelled: { bg: "bg-slate-100", text: "text-slate-700", icon: XCircle, label: "Cancelled" },
    rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Rejected" },
  };
  return configs[status] || configs.pending;
};

export function AdminBookingsPage() {
  const { hideBottomNav, showBottomNav } = useUI();
  const {
    actionInFlight,
    assignProvider,
    bookings = [],
    cancelBooking,
    error,
    loading,
    providers = [],
  } = useAdminPanelData();

  const [notice, setNotice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [assignmentState, setAssignmentState] = useState({ open: false, booking: null });
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    if (searchQuery.length > 0) {
      hideBottomNav();
    } else {
      showBottomNav();
    }
    return () => showBottomNav();
  }, [searchQuery, hideBottomNav, showBottomNav]);

  const handleSearchFocus = () => {
    if (window.innerWidth < 768) {
      hideBottomNav();
    }
  };

  const handleSearchBlur = () => {
    if (window.innerWidth < 768) {
      showBottomNav();
    }
  };

  const approvedProviders = useMemo(
    () => providers.filter((provider) => provider.providerStatus === "approved"),
    [providers]
  );

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch = 
        booking.service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.provider?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, filterStatus]);

  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === "completed").length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const handleAssignProvider = async (providerId) => {
    try {
      await assignProvider(assignmentState.booking._id, providerId);
      setNotice({ type: "success", message: "Provider assigned successfully." });
      setAssignmentState({ open: false, booking: null });
    } catch (requestError) {
      setNotice({ type: "error", message: getErrorMessage(requestError, "Unable to assign provider.") });
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await cancelBooking(bookingId);
      setNotice({ type: "success", message: "Booking cancelled." });
    } catch (requestError) {
      setNotice({ type: "error", message: getErrorMessage(requestError, "Unable to cancel booking.") });
    }
  };

  const assignmentBusy = actionInFlight === `assign-provider-${assignmentState.booking?._id}`;

  return (
    <div className="admin-page-shell space-y-3 sm:space-y-6 px-3 sm:px-4 pb-16 sm:pb-24 pt-3 sm:pt-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-600 via-orange-500 to-amber-600 p-5 sm:p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="absolute -right-16 -top-16 h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-white/10 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-white/90 backdrop-blur-sm sm:text-xs">
                <CalendarCheck2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Bookings
              </div>
              <h1 className="mt-3 sm:mt-4 font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Bookings Management</h1>
              <p className="mt-2 sm:mt-3 max-w-xl text-xs sm:text-sm text-amber-100">
                Monitor all bookings, assign providers, and manage the booking workflow.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      {notice && (
        <div className={`rounded-2xl px-4 py-3 text-sm ${
          notice.type === "success" ? "border border-emerald-100 bg-emerald-50 text-emerald-700" : "border border-red-100 bg-red-50 text-red-700"
        }`}>
          {notice.message}
        </div>
      )}

      <motion.section variants={sectionAnimation} initial="hidden" animate="visible" className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-slate-100 blur-xl transition-transform group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-slate-100">
                <CalendarCheck2 className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{totalBookings}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-blue-100 blur-xl transition-transform group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-100">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-blue-600">Completed</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{completedBookings}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-amber-100 blur-xl transition-transform group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-amber-100">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{pendingBookings}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-purple-100 blur-xl transition-transform group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-purple-100">
                <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-purple-600">Revenue</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <GlassCard className="p-3 sm:p-5" hover={false}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 text-sm text-slate-700 outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Filter Dropdown */}
            <div className="flex items-center gap-2 sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:py-3 text-xs text-slate-700 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-100 w-full"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="provider_assigned">Provider Assigned</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {filterStatus !== "all" && (
                <Button variant="outline" size="sm" onClick={() => setFilterStatus("all")} className="hidden sm:flex">
                  Clear
                </Button>
              )}
            </div>
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs text-slate-500">Showing {filteredBookings.length} result{filteredBookings.length !== 1 ? "s" : ""}</p>
          )}
        </GlassCard>

        {/* Bookings List */}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-white shadow-md" />
            ))}
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBookings.map((booking, index) => {
              const statusConfig = getStatusConfig(booking.status);
              const StatusIcon = statusConfig.icon;
              const canAssignProvider = assignableBookingStatuses.includes(booking.status);

              return (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <GlassCard hover={true} className="p-4 h-full">
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                            <CalendarCheck2 className="h-5 w-5 text-amber-600" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-900">{booking.service?.name || "Service"}</h3>
                            <p className="text-xs text-slate-500 truncate">{booking.customer?.name || "Customer"}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="mt-3 space-y-2 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-rose-500" />
                          <span className="truncate">{booking.location || "No location"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarCheck2 className="h-3 w-3 text-violet-500" />
                          <span>{formatDate(booking.eventDate)} • {booking.guestCount} guests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-blue-500" />
                          <span className="truncate">{booking.provider?.businessName || "Unassigned"}</span>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <p className="text-base font-bold text-slate-900">{formatCurrency(booking.totalAmount)}</p>
                        <div className="flex gap-1.5">
                          {canAssignProvider && (
                            <Button variant="secondary" size="sm" className="text-xs px-2" onClick={() => setAssignmentState({ open: true, booking })} isLoading={actionInFlight === `assign-provider-${booking._id}`}>
                              <UserCog className="h-3 w-3" />
                            </Button>
                          )}
                          {selectedBooking && (
                            <Button variant="danger" size="sm" className="text-xs px-2" onClick={() => handleCancelBooking(booking._id)} isLoading={actionInFlight === `cancel-booking-${booking._id}`}>
                              <XCircle className="h-3 w-3" />
                            </Button>
                          )}
                          <Button variant="primary" size="sm" className="text-xs" onClick={() => setSelectedBooking(booking)}>
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <GlassCard className="p-8 sm:p-10 text-center" hover={false}>
            <div className="mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-slate-100">
              <CalendarCheck2 className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900">{searchQuery ? "No matches found" : "No bookings yet"}</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              {searchQuery ? `No bookings matching "${searchQuery}".` : "Bookings will appear here."}
            </p>
            {searchQuery && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setSearchQuery("")}>Clear Search</Button>
            )}
          </GlassCard>
        )}
      </motion.section>

      {/* Booking Details Modal */}
      <Modal open={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Booking Details" size="lg">
        {selectedBooking && (
          <div className="space-y-4 sm:space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100">
                <CalendarCheck2 className="h-6 w-6 sm:h-7 sm:w-7 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">{selectedBooking.service?.name}</h3>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusConfig(selectedBooking.status).bg} ${getStatusConfig(selectedBooking.status).text}`}>
                  {getStatusConfig(selectedBooking.status).label}
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-blue-50/80 p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-3.5 w-3.5 text-blue-500" />
                  <p className="text-[10px] font-semibold uppercase text-blue-600">Customer</p>
                </div>
                <p className="text-sm font-medium text-slate-900">{selectedBooking.customer?.name}</p>
                <p className="text-xs text-slate-500 truncate">{selectedBooking.customer?.email}</p>
              </div>
              <div className="rounded-xl bg-violet-50/80 p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-3.5 w-3.5 text-violet-500" />
                  <p className="text-[10px] font-semibold uppercase text-violet-600">Provider</p>
                </div>
                <p className="text-sm font-medium text-slate-900">{selectedBooking.provider?.businessName || selectedProvider?.name || "Not assigned"}</p>
              </div>
              <div className="rounded-xl bg-amber-50/80 p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarCheck2 className="h-3.5 w-3.5 text-amber-500" />
                  <p className="text-[10px] font-semibold uppercase text-amber-600">Event Date</p>
                </div>
                <p className="text-sm font-medium text-slate-900">{formatDate(selectedBooking.eventDate)}</p>
              </div>
              <div className="rounded-xl bg-rose-50/80 p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-3.5 w-3.5 text-rose-500" />
                  <p className="text-[10px] font-semibold uppercase text-rose-600">Guests</p>
                </div>
                <p className="text-sm font-medium text-slate-900">{selectedBooking.guestCount}</p>
              </div>
              <div className="rounded-xl bg-emerald-50/80 p-3 sm:p-4 sm:col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  <p className="text-[10px] font-semibold uppercase text-emerald-600">Location</p>
                </div>
                <p className="text-sm font-medium text-slate-900">{selectedBooking.location || "Not specified"}</p>
              </div>
              <div className="rounded-xl bg-blue-50/80 p-3 sm:p-4 sm:col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <IndianRupee className="h-3.5 w-3.5 text-blue-500" />
                  <p className="text-[10px] font-semibold uppercase text-blue-600">Total Amount</p>
                </div>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(selectedBooking.totalAmount)}</p>
              </div>
            </div>

            {selectedBooking.notes && (
              <div className="rounded-xl bg-blue-50/50 p-3 sm:p-4">
                <p className="text-[10px] font-semibold uppercase text-blue-600 mb-1">Notes</p>
                <p className="text-sm text-slate-700">{selectedBooking.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row pt-1">
              {assignableBookingStatuses.includes(selectedBooking.status) && (
                <Button variant="primary" className="flex-1 text-xs sm:text-sm" onClick={() => { setAssignmentState({ open: true, booking: selectedBooking }); setSelectedBooking(null); }}>
                  <UserCog className="h-4 w-4 mr-1.5" />
                  {selectedBooking.provider ? "Change Provider" : "Assign Provider"}
                </Button>
              )}
              {!["cancelled", "completed"].includes(selectedBooking.status) && (
                <Button variant="danger" className="flex-1 text-xs sm:text-sm" onClick={() => { handleCancelBooking(selectedBooking._id); setSelectedBooking(null); }}>
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {assignmentState.open && (
        <AssignProviderModal
          isOpen={assignmentState.open}
          onClose={() => setAssignmentState({ open: false, booking: null })}
          onAssign={handleAssignProvider}
          providers={approvedProviders}
          isLoading={assignmentBusy}
          currentProvider={assignmentState.booking?.provider}
        />
      )}
    </div>
  );
}