import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { customerApi } from "../../services/api";
import {
  ArrowRight,
  CalendarCheck2,
  Heart,
  Loader2,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Clock3,
  BarChart3,
  Activity,
  Rocket,
  LogOut,
} from "lucide-react";

const statCardThemes = [
  {
    glow: "bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-blue-500/20",
    border: "border-cyan-100/80",
    background: "bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100/90",
    icon: "bg-gradient-to-br from-cyan-500 to-blue-600",
  },
  {
    glow: "bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
    border: "border-emerald-100/80",
    background: "bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100/90",
    icon: "bg-gradient-to-br from-emerald-500 to-teal-600",
  },
  {
    glow: "bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-yellow-500/20",
    border: "border-amber-100/80",
    background: "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100/90",
    icon: "bg-gradient-to-br from-amber-500 to-orange-600",
  },
  {
    glow: "bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-purple-500/20",
    border: "border-violet-100/80",
    background: "bg-gradient-to-br from-violet-100 via-fuchsia-50 to-purple-100/90",
    icon: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
  },
];

export function CustomerDashboardPage({ embedded = false, onOpenTab = null }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardRes = await customerApi.getDashboard();

        if (dashboardRes.data?.success) {
          setDashboardData(dashboardRes.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      icon: CalendarCheck2,
      label: "Total Bookings",
      value: dashboardData?.totalBookings || 0,
      color: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/20",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      icon: TrendingUp,
      label: "Completed",
      value: dashboardData?.completedBookings || 0,
      color: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-500/20",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      icon: Star,
      label: "Active",
      value: dashboardData?.activeBookings || 0,
      color: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/20",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      icon: Clock3,
      label: "Awaiting Response",
      value: dashboardData?.awaitingProvider || dashboardData?.awaitingAdmin || 0,
      color: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/20",
      bgColor: "bg-violet-50",
      textColor: "text-violet-600",
    },
  ];

  const quickActions = [
    {
      icon: Sparkles,
      label: "Book Service",
      desc: "Find verified partners",
      link: "/services",
      gradient: "from-primary-500 to-blue-600",
      shadow: "shadow-primary-500/20",
    },
    {
      icon: CalendarCheck2,
      label: "My Bookings",
      desc: "Track your events",
      tab: "bookings",
      link: "/customer/profile?tab=bookings",
      gradient: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-500/20",
    },
    {
      icon: Users,
      label: "Find Partners",
      desc: "Browse verified experts",
      link: "/services",
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20",
    },
    {
      icon: Heart,
      label: "My Profile",
      desc: "Manage your account",
      tab: "account",
      link: "/customer/profile?tab=account",
      gradient: "from-rose-500 to-pink-600",
      shadow: "shadow-rose-500/20",
    },
  ];

  const handleAction = (action) => {
    if (action.tab && onOpenTab) {
      onOpenTab(action.tab);
      return;
    }

    if (action.link) {
      navigate(action.link);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

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

      <div className={embedded ? "" : "relative mx-auto max-w-7xl"}>
        {!embedded ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-primary-900 to-blue-900 p-8 text-white shadow-2xl shadow-primary-500/20"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary-400 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400 to-transparent rounded-full blur-3xl" />
            </div>

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              {/* Mobile Hero - Profile Pic & Name Only */}
              <div className="lg:hidden">
                <div className="flex items-center gap-4 mb-4">
                  {user?.avatar ? (
                    <motion.img
                      src={user.avatar}
                      alt={user?.name || "Profile"}
                      className="h-16 w-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-xl"
                      whileHover={{ scale: 1.05 }}
                    />
                  ) : (
                    <motion.div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-blue-500 text-2xl font-bold text-white shadow-xl ring-4 ring-white/20"
                      whileHover={{ scale: 1.05 }}
                    >
                      {user?.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
                    </motion.div>
                  )}
                  <div>
                    <h1 className="font-display text-2xl font-black">
                      {user?.name?.split(" ")[0] || "Client"}
                    </h1>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-xs font-semibold text-emerald-300">
                    <Shield className="h-3 w-3" />
                    Verified
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-300">
                    <Sparkles className="h-3 w-3" />
                    EventMitra Client
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-xs font-semibold text-amber-300">
                    <Zap className="h-3 w-3" />
                    Booking-ready account
                  </span>
                </div>
              </div>

              {/* Desktop Hero - Full Content */}
              <div className="hidden lg:block">
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                  <Zap className="h-4 w-4 text-primary-400" />
                  <span className="text-xs font-bold text-white tracking-wide">Client Dashboard</span>
                </div>
                <h1 className="font-display text-3xl font-black sm:text-4xl">
                  Welcome back, {user?.name?.split(" ")[0] || "Client"}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                  Keep an eye on bookings, revisit service categories, and move quickly between discovery and account management.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Bookings", value: dashboardData?.totalBookings || 0, icon: CalendarCheck2 },
                  { label: "Active", value: dashboardData?.activeBookings || 0, icon: Star },
                  { label: "Completed", value: dashboardData?.completedBookings || 0, icon: TrendingUp },
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

        {loading ? (
          <div className={`flex items-center justify-center ${embedded ? "py-8" : "py-12"}`}>
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
              <p className="text-sm text-slate-600 font-medium">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100">
                    <BarChart3 className="h-3.5 w-3.5 text-primary-600" />
                    <span className="text-xs font-bold text-primary-700 tracking-wide">OVERVIEW</span>
                  </div>
                  <h2 className="font-display text-2xl font-black text-slate-900">
                    Your Booking Overview
                  </h2>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="group relative"
                    >
                      <div className={`absolute inset-0 rounded-xl opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:blur-2xl ${statCardThemes[index].glow}`} />
                      <div className={`relative flex min-h-[150px] flex-col items-center justify-center overflow-hidden rounded-2xl border p-5 text-center shadow-lg shadow-slate-200/20 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl ${statCardThemes[index].border}`}>
                        <div className={`absolute inset-0 rounded-2xl ${statCardThemes[index].background}`} />
                        <div className="relative flex flex-col items-center">
                          <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${statCardThemes[index].icon}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-2xl font-display font-black text-slate-950">{stat.value}</p>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">{stat.label}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Quick Actions Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                    <Rocket className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700 tracking-wide">QUICK ACTIONS</span>
                  </div>
                  <h2 className="font-display text-2xl font-black text-slate-900">
                    Jump into the next task
                  </h2>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.label}
                      type="button"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction(action)}
                      className="group text-left"
                    >
                      <div className="relative bg-white rounded-2xl p-5 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-primary-200/30 transition-all duration-500 h-full overflow-hidden">
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-950 group-hover:text-primary-700 transition-colors duration-300">{action.label}</p>
                            <p className="text-xs text-slate-500">{action.desc}</p>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Booking Insight Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500" />
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100">
                    <Activity className="h-3.5 w-3.5 text-rose-600" />
                    <span className="text-xs font-bold text-rose-700 tracking-wide">BOOKING INSIGHT</span>
                  </div>
                  <h2 className="font-display text-2xl font-black text-slate-900">
                    Keep your next step simple
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                    Use the quick actions above to open bookings, update your profile, or return to service discovery without extra navigation.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleAction(quickActions[1])}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 hover:scale-105"
                  >
                    Open My Bookings
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 hover:scale-105"
                  >
                    Logout
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
