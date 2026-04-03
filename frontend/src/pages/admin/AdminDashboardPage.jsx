import { motion } from "framer-motion";
import { 
  BriefcaseBusiness, 
  CalendarCheck2, 
  IndianRupee, 
  Clock3,
  TrendingUp,
  Users,
  ArrowRight,
  Star,
  Sparkles,
  Activity,
  BarChart3,
  Zap,
  Target,
  Settings,
  CreditCard,
  UserCheck,
  Wallet,
  UsersRound,
  FileText,
  CheckCircle,
  X,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { GlassCard } from "../../components/admin/GlassCard";
import { Button } from "../../components/common/Button";
import { SectionHeader } from "../../components/admin/SectionHeader";
import { useAdminPanelData } from "../../hooks/useAdminPanelData";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";

const sectionAnimation = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const formatCount = (value) => new Intl.NumberFormat("en-IN").format(value || 0);

const getGradientBg = (index) => {
  const gradients = [
    "from-violet-500 via-purple-500 to-indigo-500",
    "from-blue-500 via-cyan-500 to-emerald-500",
    "from-amber-500 via-orange-500 to-red-500",
    "from-pink-500 via-rose-500 to-red-500",
    "from-slate-500 via-gray-500 to-zinc-500",
  ];
  return gradients[index % gradients.length];
};

const getBgGradient = (index) => {
  const gradients = [
    "from-violet-50 to-purple-50",
    "from-blue-50 to-cyan-50",
    "from-amber-50 to-orange-50",
    "from-pink-50 to-rose-50",
    "from-slate-50 to-gray-50",
  ];
  return gradients[index % gradients.length];
};

export function AdminDashboardPage() {
  const { loading, metrics = {} } = useAdminPanelData();

  const metricCards = [
    {
      title: "Total Bookings",
      value: formatCount(metrics?.totalBookings),
      description: "All time bookings",
      icon: CalendarCheck2,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(metrics?.totalRevenue),
      description: "Platform revenue",
      icon: IndianRupee,
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Admin Profit",
      value: formatCurrency(metrics?.totalAdminProfit || 0),
      description: "11% commission",
      icon: TrendingUp,
      trend: "+10%",
      trendUp: true,
    },
    {
      title: "Active Providers",
      value: formatCount(metrics?.activeServiceProviders),
      description: "Approved providers",
      icon: BriefcaseBusiness,
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "Pending Approvals",
      value: formatCount(metrics?.pendingApprovals),
      description: "Awaiting review",
      icon: Clock3,
      trend: null,
      trendUp: null,
    },
  ];

  const quickActions = [
    {
      title: "Manage Providers",
      description: "Review and approve providers",
      icon: UserCheck,
      link: "/admin/providers",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      title: "View Bookings",
      description: "Monitor all bookings",
      icon: CalendarCheck2,
      link: "/admin/bookings",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      title: "Manage Services",
      description: "Add and edit services",
      icon: Star,
      link: "/admin/services",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      title: "View Customers",
      description: "Customer management",
      icon: Users,
      link: "/admin/customers",
      gradient: "from-pink-500 to-rose-600",
    },
    {
      title: "Process Payments",
      description: "Handle payouts",
      icon: CreditCard,
      link: "/admin/payments",
      gradient: "from-primary-500 to-blue-600",
    },
    {
      title: "Platform Settings",
      description: "Configure platform",
      icon: Settings,
      link: "/admin/settings",
      gradient: "from-slate-500 to-gray-600",
    },
  ];

  return (
    <div className="admin-page-shell space-y-3 sm:space-y-6 px-3 sm:px-4 pb-16 sm:pb-24 pt-3 sm:pt-4">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-5 sm:p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-16 -top-16 h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -bottom-8 -right-8 h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-pink-500/20 blur-2xl"></div>
        </div>
        
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] backdrop-blur-sm sm:px-4 sm:text-sm">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                Admin Dashboard
              </div>
              
              <h1 className="mt-3 sm:mt-4 font-display text-2xl sm:text-3xl lg:text-4xl font-bold">
                Welcome back, <span className="text-yellow-300">Admin!</span>
              </h1>
              
              <p className="mt-2 sm:mt-3 max-w-xl text-xs sm:text-sm text-purple-100">
                Monitor platform performance, manage providers, and track business growth.
              </p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-2 sm:gap-3 lg:w-auto"
            >
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400/20">
                    <IndianRupee className="h-4 w-4 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-purple-200">Revenue</p>
                    <p className="text-sm font-bold">{formatCurrency(metrics?.totalRevenue)}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/20">
                    <TrendingUp className="h-4 w-4 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-purple-200">Profit</p>
                    <p className="text-sm font-bold">{formatCurrency(metrics?.totalAdminProfit || 0)}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/20">
                    <Activity className="h-4 w-4 text-cyan-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-purple-200">Bookings</p>
                    <p className="text-sm font-bold">{formatCount(metrics?.totalBookings)}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-400/20">
                    <BriefcaseBusiness className="h-4 w-4 text-pink-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-purple-200">Providers</p>
                    <p className="text-sm font-bold">{formatCount(metrics?.activeServiceProviders)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.section
        variants={sectionAnimation}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <SectionHeader
            title="Performance Overview"
            subtitle="Key metrics at a glance"
            icon={BarChart3}
          />
          <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 px-3 py-1.5 text-xs font-semibold text-violet-700">
            <Zap className="h-3 w-3" />
            <span className="hidden sm:inline">Live Data</span>
          </div>
        </div>
        
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {(loading ? Array.from({ length: 5 }) : metricCards).map((card, index) =>
            loading ? (
              <div key={`metric-skeleton-${index}`} className="h-32 sm:h-40 animate-pulse rounded-2xl bg-white shadow-md" />
            ) : (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <GlassCard className="p-4 sm:p-5 h-full" hover={true}>
                  <div className="relative">
                    <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${getGradientBg(index)} opacity-10 blur-xl transition-transform group-hover:scale-150`}></div>
                    <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getGradientBg(index)} shadow-lg`}>
                      <card.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    
                    <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.title}</p>
                    <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{card.value}</p>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-slate-500">{card.description}</p>
                      {card.trend && (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          card.trendUp 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          <TrendingUp className={`h-2.5 w-2.5 ${!card.trendUp && "rotate-180"}`} />
                          {card.trend}
                        </span>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )
          )}
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        variants={sectionAnimation}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <SectionHeader
          title="Quick Actions"
          subtitle="Frequently used admin tasks"
          icon={Target}
        />
        
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={action.link}
                className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-md transition-transform group-hover:scale-110`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">{action.title}</h3>
                  <p className="text-xs text-slate-500 truncate">{action.description}</p>
                </div>
                
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Platform Stats Banner */}
      <motion.div
        variants={sectionAnimation}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 p-4 sm:p-6 shadow-xl"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-200/50 blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-indigo-200/50 blur-2xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col items-center gap-4 text-center lg:flex-row lg:text-left lg:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">EventMitra Platform</h2>
                <p className="text-xs sm:text-sm text-slate-500">Your all-in-one event management solution</p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <div className="rounded-xl bg-white px-4 py-2.5 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-600">Bookings</p>
                <p className="text-base font-bold text-slate-900">{formatCount(metrics?.totalBookings)}</p>
              </div>
              <div className="rounded-xl bg-white px-4 py-2.5 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-600">Providers</p>
                <p className="text-base font-bold text-slate-900">{formatCount(metrics?.activeServiceProviders)}</p>
              </div>
              <div className="rounded-xl bg-white px-4 py-2.5 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">Revenue</p>
                <p className="text-base font-bold text-slate-900">{formatCurrency(metrics?.totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}