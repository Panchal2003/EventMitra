import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarCheck2,
  IndianRupee,
  Wallet,
  ArrowRight,
  Clock,
  Sparkles,
  Banknote,
  TrendingUp,
  Target,
  Zap,
  Star,
  CheckCircle,
  Shield,
  Ban,
} from "lucide-react";
import { useProviderDashboardData } from "../../hooks/useProviderDashboardData";
import { formatCurrency } from "../../utils/currency";
import { useAuth } from "../../context/AuthContext";

const sectionAnimation = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export function ProviderDashboardPage() {
  const { error, loading, summary = {}, profile = {} } = useProviderDashboardData();
  const { user } = useAuth();
  const providerRatingCount = Number(summary?.ratingCount || profile?.ratingCount || 0);
  const providerRatingValue = Number(summary?.averageRating || profile?.rating || 0);
  const providerRatingLabel = providerRatingCount > 0 ? `${providerRatingValue.toFixed(1)} / 5` : "New";
  const providerRatingMeta = providerRatingCount > 0
    ? `${providerRatingCount} review${providerRatingCount === 1 ? "" : "s"}`
    : "Awaiting first review";

  const metricCards = [
    {
      title: "Total Amount",
      value: formatCurrency(summary?.totalAmount || 0),
      description: "Total bookings value",
      icon: Banknote,
      gradient: "from-violet-500 via-purple-500 to-indigo-500",
      bgGradient: "from-violet-50 to-purple-50",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Total Earnings",
      value: formatCurrency(summary?.totalEarnings || 0),
      description: "Your received share",
      icon: IndianRupee,
      gradient: "from-primary-500 via-blue-500 to-cyan-500",
      bgGradient: "from-primary-50 to-blue-50",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Booking Requests",
      value: summary?.pendingRequests || 0,
      description: "Waiting for response",
      icon: CalendarCheck2,
      gradient: "from-amber-500 via-orange-500 to-red-500",
      bgGradient: "from-amber-50 to-orange-50",
      trend: null,
      trendUp: null,
    },
    {
      title: "Active Jobs",
      value: summary?.activeJobs || 0,
      description: "In progress",
      icon: BriefcaseBusiness,
      gradient: "from-cyan-500 via-blue-500 to-indigo-500",
      bgGradient: "from-cyan-50 to-blue-50",
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "Pending Payment",
      value: formatCurrency(summary?.pendingPaymentAmount || 0),
      description: "Waiting release",
      icon: Wallet,
      gradient: "from-rose-500 via-pink-500 to-red-500",
      bgGradient: "from-rose-50 to-pink-50",
      trend: null,
      trendUp: null,
    },
    {
      title: "Partner Rating",
      value: providerRatingLabel,
      description: providerRatingMeta,
      icon: Star,
      gradient: "from-amber-500 via-orange-500 to-yellow-500",
      bgGradient: "from-amber-50 to-yellow-50",
      trend: providerRatingCount > 0 ? providerRatingMeta : null,
      trendUp: true,
    },
  ];

  const stats = [
    {
      icon: CheckCircle,
      value: summary?.completedJobs || 0,
      label: "Completed",
      gradient: "from-primary-500 to-blue-500",
      bgGradient: "from-primary-50 to-blue-50"
    },
    {
      icon: Clock,
      value: summary?.pendingRequests || 0,
      label: "Pending",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50"
    },
    {
      icon: Sparkles,
      value: summary?.serviceCount || 0,
      label: "Services",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50"
    },
    {
      icon: Star,
      value: providerRatingCount > 0 ? providerRatingValue.toFixed(1) : "New",
      label: "Rating",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-yellow-50"
    },
    {
      icon: Ban,
      value: summary?.cancelledBookings || 0,
      label: "Cancelled",
      gradient: "from-rose-500 to-red-500",
      bgGradient: "from-rose-50 to-red-50"
    },
  ];

  const quickActions = [
    { 
      icon: CalendarCheck2, 
      label: "View Bookings", 
      path: "/provider/bookings", 
      gradient: "from-blue-500 to-cyan-600",
      description: "Manage your bookings"
    },
    { 
      icon: Wallet, 
      label: "Earnings", 
      path: "/provider/earnings", 
      gradient: "from-primary-500 to-blue-600",
      description: "Track your earnings"
    },
    { 
      icon: BriefcaseBusiness, 
      label: "My Profile", 
      path: "/provider/profile", 
      gradient: "from-purple-500 to-indigo-600",
      description: "Update your profile"
    },
    { 
      icon: Sparkles, 
      label: "Services", 
      path: "/provider/services", 
      gradient: "from-amber-500 to-orange-600",
      description: "Manage your services"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="space-y-6 px-4 pb-8 pt-4 sm:px-6 lg:px-8 sm:pb-6">
        {/* Hero Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[28px] border border-sky-100/80 bg-[radial-gradient(circle_at_top_right,rgba(191,219,254,0.45),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,246,255,0.95)_50%,rgba(245,251,255,0.98))] p-6 shadow-[0_24px_80px_rgba(148,163,184,0.18)] sm:p-8"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 h-[240px] w-[240px] rounded-full bg-sky-200/70 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 h-[220px] w-[220px] rounded-full bg-cyan-100/80 blur-3xl"></div>
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
                  className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 shadow-sm shadow-sky-100"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Partner Dashboard
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 font-display text-2xl font-bold leading-tight text-slate-950 sm:text-3xl lg:text-4xl"
                >
                  Welcome back, <br className="sm:hidden" />
                  <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {user?.name?.split(" ")[0] || "Partner"}
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-2 max-w-lg text-sm leading-6 text-slate-600"
                >
                  Monitor bookings, track earnings, and manage your partner services with clarity.
                </motion.p>
              </div>
              
              </div>
          </div>
        </motion.div>

        {error && (
          <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        {/* Metrics Grid */}
        <motion.section
          variants={sectionAnimation}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Performance Overview</h2>
              <p className="text-xs text-slate-500">Key metrics at a glance</p>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1.5 text-xs font-medium text-purple-700 sm:flex">
              <Zap className="h-3.5 w-3.5" />
              Live Data
            </div>
          </div>
          
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 items-stretch">
            {(loading ? Array.from({ length: 6 }) : metricCards).map((card, index) =>
              loading ? (
                <div
                  key={`metric-skeleton-${index}`}
                  className="h-[160px] animate-pulse rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200"
                />
              ) : (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group h-full"
                >
                  <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.bgGradient} p-4 shadow-md transition-all duration-300 hover:shadow-lg h-full`}>
                    {/* Decorative gradient blob */}
                    <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-20 blur-xl transition-transform group-hover:scale-150`}></div>
                    
                    <div className="relative">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-md`}>
                        <card.icon className="h-5 w-5 text-white" />
                      </div>
                      
                      <p className="mt-3 text-xs font-medium text-slate-500">{card.title}</p>
                      <p className="mt-1 font-display text-xl font-bold text-slate-900">{card.value}</p>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-[10px] text-slate-400">{card.description}</p>
                        {card.trend && (
                          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            card.trendUp 
                              ? "bg-blue-100 text-blue-700" 
                              : "bg-red-100 text-red-700"
                          }`}>
                            <TrendingUp className={`h-2.5 w-2.5 ${!card.trendUp && "rotate-180"}`} />
                            {card.trend}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            )}
          </div>
        </motion.section>

        {/* Stats Grid */}
        <motion.section
          variants={sectionAnimation}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quick Stats</h2>
              <p className="text-xs text-slate-500">Your partner activity at a glance</p>
            </div>
          </div>
          
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 items-stretch">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[100px] animate-pulse rounded-xl bg-gradient-to-br from-slate-100 to-slate-200" />
              ))
            ) : (
              stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className="group h-full"
                >
                  <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${stat.bgGradient} p-3 shadow-md transition-all duration-300 hover:shadow-lg h-full`}>
                    <div className={`absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br ${stat.gradient} opacity-20 blur-lg transition-transform group-hover:scale-150`}></div>
                    
                    <div className="relative flex flex-col items-center text-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient} shadow-md`}>
                        <stat.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-display text-xl font-bold text-slate-900">{stat.value}</p>
                        <p className="text-[10px] font-medium text-slate-500">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>

        {/* Quick Actions Grid */}
        <motion.section
          variants={sectionAnimation}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
              <p className="text-xs text-slate-500">Frequently used tasks</p>
            </div>
          </div>
          
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -3, scale: 1.02 }}
              >
                <Link
                  to={action.path}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-xl bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg"
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 transition-opacity group-hover:opacity-5`}></div>
                  
                  <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-md transition-transform group-hover:scale-110`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="relative flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{action.label}</h3>
                    <p className="mt-0.5 text-[11px] text-slate-500 truncate">{action.description}</p>
                  </div>
                  
                  <ArrowRight className="relative h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-slate-600 shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Today's Focus Banner */}
        <motion.div
          variants={sectionAnimation}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 text-white shadow-xl"
        >
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-pink-500/20 blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col items-center gap-4 text-center lg:flex-row lg:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
                <Target className="h-6 w-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h2 className="text-lg font-bold">Today&apos;s Focus</h2>
                <p className="mt-1 text-sm text-purple-100">
                  Keep responses quick and delivery clean. Accept booking requests fast, start jobs on time, and hand off the final OTP step to the client so payouts can move smoothly.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3 lg:justify-end">
                <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
                  <p className="text-xs text-purple-200">Completed</p>
                  <p className="text-lg font-bold">{summary?.completedJobs || 0}</p>
                </div>
                <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
                  <p className="text-xs text-purple-200">Pending</p>
                  <p className="text-lg font-bold">{summary?.pendingRequests || 0}</p>
                </div>
                <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
                  <p className="text-xs text-purple-200">Active</p>
                  <p className="text-lg font-bold">{summary?.activeJobs || 0}</p>
                </div>
                <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
                  <p className="text-xs text-purple-200">Cancelled</p>
                  <p className="text-lg font-bold">{summary?.cancelledBookings || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
