import { motion } from "framer-motion";
import { 
  WalletCards, 
  Search,
  IndianRupee,
  CheckCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Calendar,
  User,
  X,
  XCircle,
  TrendingUp,
  Users,
  ArrowRight,
  CreditCard,
  AlertCircle,
  RefreshCw,
  Wallet,
  Loader2
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { GlassCard } from "../../components/admin/GlassCard";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useAdminPanelData } from "../../hooks/useAdminPanelData";
import { useUI } from "../../context/UIContext";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";
import { adminApi } from "../../services/api";

const sectionAnimation = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

const getStatusConfig = (status, payoutStatus) => {
  const configs = {
    released: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle, label: "Released" },
    pending: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock, label: "Pending" },
    processing: { bg: "bg-purple-100", text: "text-purple-700", icon: Clock, label: "Processing" },
    collection_pending: { bg: "bg-slate-100", text: "text-slate-700", icon: Clock, label: "Awaiting Collection" },
    paid: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle, label: "Released" },
    failed: { bg: "bg-red-100", text: "text-red-700", icon: X, label: "Failed" },
  };
  if (payoutStatus === "paid") return configs.paid;
  if (payoutStatus === "failed") return configs.failed;
  if (payoutStatus === "processing") return configs.processing;
  return configs[status] || configs.pending;
};

export function AdminPaymentsPage() {
  const { hideBottomNav, showBottomNav } = useUI();
  const {
    actionInFlight,
    error,
    loading,
    payments = [],
    releasePayout,
    refresh,
  } = useAdminPanelData();

  const [notice, setNotice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [commissionRateDraft, setCommissionRateDraft] = useState("11");
  const [transactionIdDraft, setTransactionIdDraft] = useState("");
  const [releasingPayment, setReleasingPayment] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 0) {
      hideBottomNav();
    } else {
      showBottomNav();
    }
    return () => showBottomNav();
  }, [searchQuery, hideBottomNav, showBottomNav]);

  useEffect(() => {
    if (selectedPayment) {
      setTransactionIdDraft(selectedPayment?.transactionId || "");
    }
  }, [selectedPayment]);

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

  // Count payouts - if no payout record exists, it's pending (not released yet)
  const totalPayouts = payments.filter(p => p.payout || (p.status === "pending" && p.paymentStatus === "full_paid")).length;
  const pendingPayouts = payments.filter(p => !p.payout?.status || p.payout.status !== "released").length;
  const releasedPayouts = payments.filter(p => p.payout?.status === "released").length;
  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalProviderAmount = payments.reduce((sum, p) => sum + (p.providerAmount || 0), 0);
  const totalAdminProfit = payments.reduce((sum, p) => sum + (p.adminProfit || 0), 0);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch = 
        payment.booking?.service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.provider?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.provider?.businessName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesStatus = filterStatus === "all";
      if (!matchesStatus) {
        if (filterStatus === "full_paid") {
          matchesStatus = payment.paymentStatus === "full_paid";
        } else if (filterStatus === "cancelled") {
          matchesStatus = payment.booking?.status === "cancelled";
        } else {
          matchesStatus = payment.status === filterStatus;
        }
      }
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, filterStatus]);

  const handleReleasePayout = async (payment) => {
    if (!window.confirm("Release payment to provider? 11% commission will be deducted.")) return;
    
    setReleasingPayment(true);
    try {
      const response = await adminApi.releaseProviderPayment(payment.bookingId);
      setNotice({ type: "success", message: response.data?.message || "Payment released successfully." });
      setSelectedPayment(null);
    } catch (requestError) {
      setNotice({ type: "error", message: getErrorMessage(requestError, "Unable to release payment.") });
    } finally {
      setReleasingPayment(false);
    }
  };

  return (
    <div className="admin-page-shell space-y-3 sm:space-y-6 px-3 sm:px-4 pb-16 sm:pb-24 pt-3 sm:pt-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary-600 via-blue-500 to-cyan-600 p-5 sm:p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="absolute -right-16 -top-16 h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-white/10 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-white/90 backdrop-blur-sm sm:text-xs">
                <WalletCards className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Payments
              </div>
              <div className="flex items-center gap-3 mt-3 sm:mt-4">
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Payments & Payouts</h1>
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white disabled:opacity-50 transition-colors"
                  title="Refresh payments"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
              <p className="mt-2 sm:mt-3 max-w-xl text-xs sm:text-sm text-blue-100">
                Manage provider payouts and track all payment transactions.
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
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-blue-100 blur-xl transition-transform group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-100">
                <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-blue-600">Total</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{formatCurrency(totalAmount)}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-purple-100 blur-xl transition-transform group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-purple-100">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-purple-600">Providers</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{formatCurrency(totalProviderAmount)}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-amber-100 blur-xl transition-transform group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-amber-100">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-amber-600">Commission</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{formatCurrency(totalAdminProfit)}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-slate-100 blur-xl transition-transform group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-slate-100">
                <WalletCards className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Transactions</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{totalPayouts}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-emerald-100 blur-xl transition-transform group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-emerald-100">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-emerald-600">Released</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{releasedPayouts}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-amber-100 blur-xl transition-transform group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-amber-100">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{pendingPayouts}</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <GlassCard className="p-3 sm:p-5" hover={false}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:py-3 text-xs text-slate-700 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                <option value="all">All Status</option>
                <option value="collection_pending">Awaiting Collection</option>
                <option value="pending">Pending</option>
                <option value="full_paid">Payment Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="released">Released</option>
              </select>
              {filterStatus !== "all" && (
                <Button variant="outline" size="sm" onClick={() => setFilterStatus("all")} className="hidden sm:flex">
                  Clear
                </Button>
              )}
            </div>
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs text-slate-500">Showing {filteredPayments.length} result{filteredPayments.length !== 1 ? "s" : ""}</p>
          )}
        </GlassCard>

        {/* Payments List */}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-white shadow-md" />
            ))}
          </div>
        ) : filteredPayments.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPayments.map((payment, index) => {
              const statusConfig = getStatusConfig(payment.status, payment.payoutStatus);
              const StatusIcon = statusConfig.icon;
              const canRelease = payment.payoutStatus !== "paid" && payment.paymentStatus === "full_paid";

              return (
                <motion.div
                  key={payment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <GlassCard hover={true} className="p-4 h-full">
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100">
                            <WalletCards className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-900">{payment.booking?.service?.name || "Service"}</h3>
                            <p className="text-xs text-slate-500 truncate">{payment.provider?.businessName || payment.provider?.name}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {payment.booking?.status === "cancelled" ? (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-rose-100 text-rose-700">
                              <XCircle className="h-3 w-3" />
                              Cancelled
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                        <div className="mt-3 space-y-2 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-violet-500" />
                          <span className="truncate">{payment.booking?.customer?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-amber-500" />
                          <span>Booked {formatDate(payment.booking?.createdAt)}</span>
                        </div>
                        
                        {/* Show refund info for cancelled bookings */}
                        {payment.paymentStatus === "full_paid" ? (
                          <div className="flex items-center gap-2 text-emerald-600 font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Payment Completed</span>
                          </div>
                        ) : payment.paymentStatus !== "full_paid" && (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Method:</span>
                              <span className="capitalize">{payment.method?.replace(/_/g, " ") || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Advance:</span>
                              <span>{formatCurrency(payment.advancePaid || 0)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Remaining:</span>
                              <span>
                                {payment.paymentStatus === "full_paid"
                                  ? formatCurrency(payment.remainingPaid || 0)
                                  : `${formatCurrency(payment.remainingDue || 0)} due`}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Price & Actions */}
                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <div>
                          <p className="text-base font-bold text-blue-600">{formatCurrency(payment.amount)}</p>
                          {payment.providerAmount > 0 && (
                            <p className="text-[10px] font-medium text-emerald-600">
                              Provider: {formatCurrency(payment.providerAmount)} 
                              (11% fee)
                            </p>
                          )}
                          {(payment.providerBankAccount || payment.providerUpiId) ? (
                            <p className="text-[10px] font-medium text-violet-600">✓ Payment details added</p>
                          ) : (
                            <p className="text-[10px] font-medium text-amber-600">⚠ No payment details</p>
                          )}
                        </div>
                        <div className="flex gap-1.5">
                          <Button variant="secondary" size="sm" className="text-xs px-2" onClick={() => setSelectedPayment(payment)}>
                            View
                          </Button>
                          {canRelease && (
                            <Button variant="success" size="sm" className="text-xs" onClick={() => setSelectedPayment(payment)}>
                              {payment.payoutStatus === "paid" ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Released
                                </>
                              ) : (
                                <>
                                  <ArrowUpRight className="h-3 w-3 mr-1" />
                                  Release
                                </>
                              )}
                            </Button>
                          )}
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
              <WalletCards className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900">{searchQuery ? "No matches found" : "No payments yet"}</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              {searchQuery ? `No payments matching "${searchQuery}".` : "Payments will appear here."}
            </p>
            {searchQuery && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setSearchQuery("")}>Clear Search</Button>
            )}
          </GlassCard>
        )}
      </motion.section>

      {/* Payment Details Modal */}
      <Modal open={!!selectedPayment} onClose={() => setSelectedPayment(null)} title="Payment Details" size="lg">
        {selectedPayment && (
          <div className="space-y-4 sm:space-y-5">
            {/* Header with Status */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100">
                <WalletCards className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">{formatCurrency(selectedPayment.totalAmount)}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusConfig(selectedPayment.status, selectedPayment.payoutStatus).bg} ${getStatusConfig(selectedPayment.status, selectedPayment.payoutStatus).text}`}>
                    {getStatusConfig(selectedPayment.status, selectedPayment.payoutStatus).label}
                  </span>
                  {selectedPayment.paymentStatus === "full_paid" && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Full Paid
                    </span>
                  )}
                  {selectedPayment.paymentStatus !== "full_paid" && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700">
                      Partial Paid
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Info */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-[10px] font-semibold uppercase text-slate-500 mb-3">Booking Information</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] text-slate-400">Service</p>
                  <p className="text-sm font-medium text-slate-900">{selectedPayment.booking?.service?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Customer</p>
                  <p className="text-sm font-medium text-slate-900">{selectedPayment.booking?.customer?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Provider</p>
                  <p className="text-sm font-medium text-slate-900">{selectedPayment.provider?.businessName || selectedPayment.provider?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Event Date</p>
                  <p className="text-sm font-medium text-slate-900">{selectedPayment.booking?.eventDate ? formatDate(selectedPayment.booking.eventDate) : "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            {selectedPayment.paymentStatus === "full_paid" ? (
              <div className="rounded-xl bg-emerald-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <p className="text-[10px] font-semibold uppercase text-emerald-600">Payment Completed</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] text-emerald-600">Total Amount</p>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(selectedPayment.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-600">Total Paid</p>
                    <p className="text-lg font-bold text-emerald-600">{formatCurrency((selectedPayment.advancePaid || 0) + (selectedPayment.remainingPaid || 0))}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-[10px] font-semibold uppercase text-emerald-600 mb-3">Payment Received</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] text-emerald-600">Total Amount</p>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(selectedPayment.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-600">Advance Paid</p>
                    <p className="text-base font-semibold text-slate-900">{formatCurrency(selectedPayment.advancePaid || 0)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-600">Remaining Due</p>
                    <p className="text-base font-semibold text-amber-600">{formatCurrency(selectedPayment.remainingDue || 0)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Refund Details (if cancelled) */}
            {selectedPayment.booking?.cancellation && selectedPayment.booking.cancellation.refundAmount > 0 && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-rose-600" />
                    <p className="text-sm font-semibold text-rose-700">Refund Details</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    selectedPayment.booking.cancellation.refundStatus === "completed" 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {selectedPayment.booking.cancellation.refundStatus === "completed" ? "Completed" : "Processing"}
                  </span>
                </div>
                <p className="text-lg font-bold text-rose-700">
                  {formatCurrency(selectedPayment.booking.cancellation.refundAmount)}
                  <span className="ml-2 text-xs font-normal text-rose-600">
                    ({selectedPayment.booking.cancellation.cancellationPolicy?.replace(/_/g, " ")})
                  </span>
                </p>
                {selectedPayment.booking.cancellation.refundStatus === "completed" && (
                  <p className="text-xs text-emerald-600">Refund has been processed successfully</p>
                )}
                {selectedPayment.booking.cancellation.refundStatus === "pending" && (
                  <p className="text-xs text-amber-600">Refund initiated - processing within 2 business days</p>
                )}
              </div>
            )}

            {/* Payout Status */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-[10px] font-semibold uppercase text-slate-500 mb-3">Payout Status</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400">Provider Amount</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(selectedPayment.providerAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Admin Commission</p>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(selectedPayment.adminProfit)}</p>
                </div>
              </div>
            </div>

            {/* Provider Payment Details */}
            {(selectedPayment.providerBankAccount || selectedPayment.providerUpiId) ? (
              <div className="rounded-xl bg-violet-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-4 w-4 text-violet-600" />
                  <p className="text-[10px] font-semibold uppercase text-violet-600">Provider Payment Details</p>
                </div>
                {selectedPayment.providerBankAccount && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] text-slate-500">Bank Name</p>
                      <p className="text-sm font-medium text-slate-900">{selectedPayment.providerBankAccount.bankName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Account Number</p>
                      <p className="text-sm font-medium text-slate-900 font-mono">••••{selectedPayment.providerBankAccount.accountNumber?.slice(-4)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">IFSC Code</p>
                      <p className="text-sm font-medium text-slate-900 font-mono">{selectedPayment.providerBankAccount.ifscCode}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Account Holder</p>
                      <p className="text-sm font-medium text-slate-900">{selectedPayment.providerBankAccount.accountHolderName}</p>
                    </div>
                  </div>
                )}
                {selectedPayment.providerUpiId && (
                  <div className="mt-3 pt-3 border-t border-violet-200">
                    <p className="text-[10px] text-slate-500">UPI ID</p>
                    <p className="text-sm font-medium text-slate-900">{selectedPayment.providerUpiId}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <p className="text-sm font-medium text-amber-700">No payment details added by provider</p>
                </div>
              </div>
            )}

            {/* Release Form */}
            {selectedPayment.payoutStatus !== "paid" && selectedPayment.paymentStatus === "full_paid" && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm font-semibold text-emerald-700">Release Payment</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{formatCurrency(selectedPayment.providerAmount)}</span>
                </div>
                <Button variant="success" className="w-full text-sm" onClick={() => handleReleasePayout(selectedPayment)} disabled={releasingPayment}>
                  {releasingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-4 w-4 mr-1.5" />
                      Release Now
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Released Info */}
            {selectedPayment.payoutStatus === "paid" && (
              <div className="rounded-xl bg-emerald-50 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <p className="font-semibold text-emerald-700">Payment Released on {formatDate(selectedPayment.releasedAt)}</p>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] text-emerald-600">Provider Amount</p>
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(selectedPayment.payoutAmount || selectedPayment.providerAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-600">Commission (11%)</p>
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(selectedPayment.commission || selectedPayment.adminProfit)}</p>
                  </div>
                </div>
                {selectedPayment.payoutId && (
                  <p className="mt-2 text-xs text-emerald-600">Razorpay Payout ID: {selectedPayment.payoutId}</p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
