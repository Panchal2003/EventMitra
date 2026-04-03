import { motion } from "framer-motion";
import { Wallet, TrendingUp, CreditCard, Sparkles, IndianRupee, Loader2, Zap, Target, Award, Activity, ArrowRight, CheckCircle, Clock, Shield, BarChart3 } from "lucide-react";
import { useMemo } from "react";
import { GlassCard } from "../../components/admin/GlassCard";
import { SectionHeader } from "../../components/admin/SectionHeader";
import { DataTable } from "../../components/common/DataTable";
import { StatusBadge } from "../../components/common/StatusBadge";
import { useProviderDashboardData } from "../../hooks/useProviderDashboardData";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";

const sectionAnimation = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export function ProviderEarningsPage() {
  const { earnings = [], earningsSummary = {}, error, loading, bookings = [] } = useProviderDashboardData();
  const releasedEarnings = useMemo(
    () => (earnings || []).filter((payment) => payment.status === "released"),
    [earnings]
  );

  // Calculate earnings stats from bookings
  const stats = useMemo(() => {
    const completedBookings = (bookings || []).filter(b => b.status === "completed");
    const totalEarnings = Number(earningsSummary?.completedPaymentAmount || 0);
    const pendingPayouts = (earnings || [])
      .filter(e => e.status === "pending")
      .reduce((sum, e) => sum + (e.providerAmount || Math.round(e.amount * 0.89) || 0), 0);
    const paidOut = Number(earningsSummary?.completedPaymentAmount || 0);
    
    return {
      totalEarnings,
      pendingPayouts,
      paidOut,
      completedJobs: completedBookings.length,
    };
  }, [earnings, earningsSummary, bookings]);

  const earningsColumns = [
    {
      header: "Booking",
      render: (payment) => (
        <div>
          <p className="font-semibold text-slate-900">{payment.booking?.service?.name}</p>
          <p className="mt-1 text-xs text-slate-500">{payment.booking?.customer?.name}</p>
        </div>
      ),
    },
    {
      header: "Amount",
      render: (payment) => (
        <div>
          <p className="font-semibold text-slate-900">{formatCurrency(payment.providerAmount || Math.round(payment.amount * 0.89))}</p>
          <p className="mt-1 text-xs text-slate-500 capitalize">
            {payment.method?.replace("_", " ") || "Online"}
          </p>
        </div>
      ),
    },
    {
      header: "Status",
      render: (payment) => <StatusBadge status={payment.status} />,
    },
    {
      header: "Timeline",
      render: (payment) => (
        <div>
          <p className="font-medium text-slate-900">
            Due {formatDate(payment.payoutDueDate || payment.createdAt)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {payment.releasedAt ? `Released ${formatDate(payment.releasedAt)}` : "Awaiting release"}
          </p>
        </div>
      ),
    },
  ];

  // Mobile card for each earning
  const renderEarningCard = (payment) => (
    <motion.div
      key={payment._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-lg transition-all duration-300 hover:shadow-xl"
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 opacity-10 blur-2xl transition-transform group-hover:scale-150"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">{payment.booking?.service?.name}</p>
            <p className="mt-1 text-xs text-slate-500">{payment.booking?.customer?.name}</p>
          </div>
          <StatusBadge status={payment.status} />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="text-xs text-slate-500">Your Amount</p>
            <p className="font-semibold text-primary-700">{formatCurrency(payment.providerAmount || Math.round(payment.amount * 0.89))}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Admin Fee</p>
            <p className="text-sm font-medium text-slate-700">-{formatCurrency(payment.adminProfit || Math.round(payment.amount * 0.11))}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>Due: {formatDate(payment.payoutDueDate || payment.createdAt)}</span>
        </div>
        {payment.releasedAt && (
          <p className="mt-2 text-xs text-primary-700">
            ✓ Released on {formatDate(payment.releasedAt)}
          </p>
        )}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm font-medium text-slate-600">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
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
                  <Wallet className="h-3.5 w-3.5" />
                  Earnings Tracker
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl"
                >
                  My Earnings
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-2 max-w-lg text-sm text-purple-100"
                >
                  Track your payments and payouts.
                </motion.p>
              </div>
              
              {/* Stats preview cards */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="hidden lg:grid lg:grid-cols-2 lg:gap-3"
              >
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-400/20">
                      <TrendingUp className="h-5 w-5 text-blue-300" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-200">Total Earnings</p>
                      <p className="text-lg font-bold">{formatCurrency(stats.totalEarnings)}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/20">
                      <Award className="h-5 w-5 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-xs text-purple-200">Jobs Done</p>
                      <p className="text-lg font-bold">{stats.completedJobs}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-blue-500">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Total Earnings</p>
                <p className="font-display text-lg font-bold text-slate-900">
                  {formatCurrency(stats.totalEarnings)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-500">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Pending</p>
                <p className="font-display text-lg font-bold text-slate-900">
                  {formatCurrency(stats.pendingPayouts)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-purple-500">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Paid Out</p>
                <p className="font-display text-lg font-bold text-slate-900">
                  {formatCurrency(stats.paidOut)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                <IndianRupee className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Jobs Done</p>
                <p className="font-display text-lg font-bold text-slate-900">
                  {stats.completedJobs}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        {/* Earnings Table Section */}
        <motion.section
          id="earnings"
          variants={sectionAnimation}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
        >
          <GlassCard hover={false} className="p-4 sm:p-6">
            <SectionHeader
              eyebrow="Payment History"
              title="Earnings details"
              description="View all your earnings from completed bookings and payout status."
            />

            {/* Mobile View */}
            <div className="mt-4 space-y-3 sm:hidden">
              {releasedEarnings.length > 0 ? (
                releasedEarnings.map(renderEarningCard)
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50"
                  >
                    <Sparkles className="h-10 w-10 text-blue-400" />
                  </motion.div>
                  <p className="mt-4 font-semibold text-slate-600">No released earnings yet</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Released payouts will appear here after admin approval.
                  </p>
                </div>
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block">
              <DataTable
                columns={earningsColumns}
                rows={releasedEarnings}
                emptyTitle="No released earnings yet"
                emptyDescription="Released payouts will appear here after admin approval."
              />
            </div>
          </GlassCard>
        </motion.section>
      </div>
    </div>
  );
}
