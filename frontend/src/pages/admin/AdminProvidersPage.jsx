import { motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield,
  Star,
  Phone,
  MapPin,
  Calendar,
 IndianRupee,
  Briefcase,
  Eye,
  X,
  TrendingUp,
  Mail
} from "lucide-react";
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

const formatCount = (value) => new Intl.NumberFormat("en-IN").format(value || 0);
const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

const getStatusConfig = (status) => {
  const configs = {
    approved: { 
      bg: "bg-emerald-100", 
      text: "text-emerald-700",
      icon: CheckCircle,
      label: "Approved",
    },
    pending: { 
      bg: "bg-amber-100", 
      text: "text-amber-700",
      icon: Clock,
      label: "Pending",
    },
    rejected: { 
      bg: "bg-rose-100", 
      text: "text-rose-700",
      icon: XCircle,
      label: "Rejected",
    },
    suspended: { 
      bg: "bg-slate-100", 
      text: "text-slate-700",
      icon: Shield,
      label: "Suspended",
    },
  };
  return configs[status] || configs.pending;
};

const getAvatarGradient = (name) => {
  const gradients = [
    "from-blue-400 to-indigo-500",
    "from-violet-400 to-purple-500",
    "from-emerald-400 to-teal-500",
    "from-orange-400 to-amber-500",
    "from-rose-400 to-pink-500",
    "from-cyan-400 to-blue-500",
    "from-violet-400 to-fuchsia-500",
    "from-amber-400 to-orange-500",
  ];
  const index = (name?.charCodeAt(0) || 0) % gradients.length;
  return gradients[index];
};

export function AdminProvidersPage() {
  const { hideBottomNav, showBottomNav } = useUI();
  const {
    actionInFlight,
    error,
    loading,
    providers = [],
    services = [],
    updateProviderStatus,
  } = useAdminPanelData();

  const [notice, setNotice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

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

  const pendingProviders = useMemo(
    () => providers.filter((provider) => provider.providerStatus === "pending"),
    [providers]
  );

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const matchesSearch = 
        provider.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || provider.providerStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [providers, searchQuery, filterStatus]);

  const providerServices = useMemo(() => {
    if (!selectedProvider) return [];
    const providerId = selectedProvider._id;
    return services.filter((service) => {
      const serviceCreatedBy = service.createdBy?._id || service.createdBy;
      return serviceCreatedBy === providerId || serviceCreatedBy === String(providerId);
    });
  }, [selectedProvider, services]);

  const totalRevenue = providers.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);

  const handleProviderStatus = async (providerId, status) => {
    try {
      await updateProviderStatus(providerId, status);
      setNotice({ type: "success", message: `Provider ${status} successfully.` });
    } catch (requestError) {
      setNotice({ type: "error", message: getErrorMessage(requestError, "Unable to update provider status.") });
    }
  };

  return (
    <div className="admin-page-shell space-y-3 sm:space-y-6 px-3 sm:px-4 pb-16 sm:pb-24 pt-3 sm:pt-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-500 to-fuchsia-600 p-5 sm:p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="absolute -right-16 -top-16 h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/5 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold">Service Providers</h1>
              <p className="mt-1 sm:mt-2 max-w-xl text-xs sm:text-sm text-purple-100">
                Manage provider registrations, approve new vendors, and monitor service quality.
              </p>
            </div>
            <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Users className="h-7 w-7" />
            </div>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-800">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            {error}
          </div>
        </motion.div>
      )}

      {notice && (
        <div className={`rounded-2xl px-4 py-3 text-sm ${
          notice.type === "success" ? "border border-emerald-100 bg-emerald-50 text-emerald-700" : "border border-red-100 bg-red-50 text-red-700"
        }`}>
          {notice.message}
        </div>
      )}

      <motion.section variants={sectionAnimation} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Total Providers */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-50 transition-transform group-hover:scale-150 group-hover:bg-blue-100"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{formatCount(providers.length)}</p>
              <p className="text-xs text-slate-500 mt-1">Providers</p>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-50 transition-transform group-hover:scale-150 group-hover:bg-emerald-100"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200">
                <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Provider Revenue</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{formatCurrency(Math.round(totalRevenue * 0.89))}</p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> All time
              </p>
            </div>
          </div>

          {/* Approved */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-violet-50 transition-transform group-hover:scale-150 group-hover:bg-violet-100"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-200">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Approved</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{formatCount(approvedProviders.length)}</p>
              <p className="text-xs text-slate-500 mt-1">Active</p>
            </div>
          </div>

          {/* Pending */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-50 transition-transform group-hover:scale-150 group-hover:bg-amber-100"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-200">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{formatCount(pendingProviders.length)}</p>
              <p className="text-xs text-slate-500 mt-1">Awaiting</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <GlassCard className="p-3 sm:p-5" hover={false}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
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
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
              <div className="flex rounded-lg bg-slate-100 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-md p-1.5 transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <div className="grid h-4 w-4 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-md p-1.5 transition-all ${viewMode === "list" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <div className="flex h-4 w-4 flex-col gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs text-slate-500">
              Showing {filteredProviders.length} result{filteredProviders.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          )}
        </GlassCard>

        {/* Providers Grid/List */}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-white shadow-md" />
            ))}
          </div>
        ) : filteredProviders.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProviders.map((provider, index) => {
                const statusConfig = getStatusConfig(provider.providerStatus);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <motion.div
                    key={provider._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <GlassCard hover={true} className="p-4">
                      <div className="flex flex-col items-center text-center">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${getAvatarGradient(provider.businessName || provider.name)} text-white text-xl font-bold shadow-lg`}>
                          {provider.avatar ? (
                            <img src={provider.avatar} alt={provider.name} className="h-14 w-14 rounded-2xl object-cover" />
                          ) : (
                            (provider.businessName || provider.name)?.charAt(0) || "P"
                          )}
                        </div>
                        <h3 className="mt-3 truncate text-sm font-semibold text-slate-900 w-full">{provider.businessName || provider.name}</h3>
                        <p className="text-xs text-slate-500 truncate w-full">{provider.email}</p>
                        
                        <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                        
                        <div className="mt-4 flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                          <div className="text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Services</p>
                            <p className="text-sm font-bold text-slate-900">{services.filter(s => s.createdBy?._id === provider._id || s.createdBy === provider._id).length || 0}</p>
                          </div>
                          <div className="h-8 w-px bg-slate-200"></div>
                          <div className="text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Revenue</p>
                            <p className="text-sm font-bold text-emerald-600">{formatCurrency(Math.round((provider.totalRevenue || 0) * 0.89))}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex w-full items-center justify-between">
                          <p className="text-xs text-slate-400">{formatDate(provider.createdAt)}</p>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedProvider(provider)} className="h-8 text-xs">
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="hidden sm:grid gap-3 rounded-2xl bg-slate-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 grid-cols-12">
                <div className="col-span-3">Provider</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-center">Services</div>
                <div className="col-span-2 text-center">Revenue</div>
                <div className="col-span-2 text-center">Joined</div>
                <div className="col-span-1 text-right">Action</div>
              </div>
              {filteredProviders.map((provider, index) => {
                const statusConfig = getStatusConfig(provider.providerStatus);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <motion.div
                    key={provider._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <GlassCard hover={true} className="p-3 sm:p-4">
                      <div className="grid gap-3 sm:grid-cols-12 sm:items-center">
                        <div className="flex items-center gap-3 sm:col-span-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarGradient(provider.businessName || provider.name)} text-white font-bold`}>
                            {provider.avatar ? (
                              <img src={provider.avatar} alt={provider.name} className="h-10 w-10 rounded-xl object-cover" />
                            ) : (
                              (provider.businessName || provider.name)?.charAt(0) || "P"
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-900">{provider.businessName || provider.name}</h3>
                            <p className="truncate text-xs text-slate-500">{provider.email}</p>
                          </div>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:hidden">Status</p>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </span>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:hidden">Services</p>
                          <p className="text-base font-bold text-slate-900 sm:text-center">
                            {services.filter(s => s.createdBy?._id === provider._id || s.createdBy === provider._id).length || 0}
                          </p>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:hidden">Revenue</p>
                          <p className="text-base font-bold text-emerald-600 sm:text-center">{formatCurrency(Math.round((provider.totalRevenue || 0) * 0.89))}</p>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:hidden">Joined</p>
                          <p className="text-sm text-slate-500 sm:text-center">{formatDate(provider.createdAt)}</p>
                        </div>
                        
                        <div className="sm:col-span-1 flex justify-end">
                          {provider.providerStatus === "pending" ? (
                            <div className="flex gap-1">
                              <Button variant="success" size="sm" className="text-xs px-2" onClick={() => handleProviderStatus(provider._id, "approved")} isLoading={actionInFlight === `provider-${provider._id}-approved`}>
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button variant="danger" size="sm" className="text-xs px-2" onClick={() => handleProviderStatus(provider._id, "rejected")} isLoading={actionInFlight === `provider-${provider._id}-rejected`}>
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button variant="primary" size="sm" className="text-xs" onClick={() => setSelectedProvider(provider)}>
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              <span className="sm:hidden">View</span>
                              <span className="hidden sm:inline">Details</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )
        ) : (
          <GlassCard className="p-10 sm:p-14 text-center" hover={false}>
            <div className="mx-auto mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
              <Users className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{searchQuery ? "No matches found" : "No providers yet"}</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              {searchQuery 
                ? `We couldn't find any providers matching "${searchQuery}". Try a different search term.` 
                : "Providers who register will appear here. Share your platform to get started."}
            </p>
            {searchQuery && (
              <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </GlassCard>
        )}
      </motion.section>

      {/* Provider Details Modal */}
      <Modal
        open={!!selectedProvider}
        onClose={() => setSelectedProvider(null)}
        title="Provider Details"
        size="lg"
      >
        {selectedProvider && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br ${getAvatarGradient(selectedProvider.businessName || selectedProvider.name)} text-white text-3xl font-bold shadow-xl`}>
                {selectedProvider.avatar ? (
                  <img src={selectedProvider.avatar} alt={selectedProvider.name} className="h-20 w-20 rounded-3xl object-cover" />
                ) : (
                  (selectedProvider.businessName || selectedProvider.name)?.charAt(0) || "P"
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-slate-900">{selectedProvider.businessName || selectedProvider.name}</h3>
                <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                      <Mail className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="truncate max-w-[200px]">{selectedProvider.email}</span>
                  </div>
                  {selectedProvider.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                        <Phone className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span>{selectedProvider.phone}</span>
                    </div>
                  )}
                </div>
                {selectedProvider.address && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 justify-center sm:justify-start">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedProvider.address}</span>
                  </div>
                )}
                {(selectedProvider.serviceCategory || selectedProvider.serviceCategory?.name) && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-violet-600 justify-center sm:justify-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                      <Briefcase className="h-4 w-4 text-violet-500" />
                    </div>
                    <span className="font-medium">{selectedProvider.serviceCategory?.name || selectedProvider.serviceCategory}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl bg-emerald-50/80 p-3 sm:p-4 text-center">
                <IndianRupee className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold text-slate-900">{formatCurrency(Math.round((selectedProvider.totalRevenue || 0) * 0.89))}</p>
                <p className="text-[10px] sm:text-xs font-medium text-emerald-600">Total Revenue</p>
              </div>
              <div className="rounded-xl bg-blue-50/80 p-3 sm:p-4 text-center">
                <Briefcase className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold text-slate-900">{providerServices.length}</p>
                <p className="text-[10px] sm:text-xs font-medium text-blue-600">Services</p>
              </div>
              <div className="rounded-xl bg-violet-50/80 p-3 sm:p-4 text-center">
                <Calendar className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-violet-500" />
                <p className="mt-1.5 sm:mt-2 text-sm sm:text-lg font-bold text-slate-900">{formatDate(selectedProvider.createdAt)}</p>
                <p className="text-[10px] sm:text-xs font-medium text-violet-600">Joined</p>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-900">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                Services Offered
              </h4>
              {providerServices.length > 0 ? (
                <div className="max-h-40 sm:max-h-80 space-y-2 sm:space-y-3 overflow-auto scrollbar-thin">
                  {providerServices.slice(0, 10).map((service, index) => {
                    const colors = ["from-violet-500 to-purple-600", "from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-rose-500 to-pink-600", "from-amber-500 to-orange-600"];
                    const colorClass = colors[index % colors.length];
                    
                    return (
                      <div key={service._id} className="flex items-center gap-2 sm:gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 sm:p-4">
                        <div className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br ${colorClass} text-white`}>
                          {service.images?.[0] ? (
                            <img src={service.images[0]} alt={service.name} className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl object-cover" />
                          ) : (
                            <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-900 text-sm">{service.name}</p>
                          <p className="text-xs text-slate-500">{service.category?.name}</p>
                        </div>
                        <p className="font-semibold text-emerald-600 text-sm">{formatCurrency(service.startingPrice || 0)}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 sm:p-8 text-center">
                  <Briefcase className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-slate-300" />
                  <p className="mt-2 sm:mt-3 text-sm text-slate-500">No services listed yet</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row pt-1">
              {selectedProvider.providerStatus === "pending" && (
                <>
                  <Button variant="success" className="flex-1 text-sm" onClick={() => { handleProviderStatus(selectedProvider._id, "approved"); setSelectedProvider(null); }} isLoading={actionInFlight === `provider-${selectedProvider._id}-approved`}>
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Approve
                  </Button>
                  <Button variant="danger" className="flex-1 text-sm" onClick={() => { handleProviderStatus(selectedProvider._id, "rejected"); setSelectedProvider(null); }} isLoading={actionInFlight === `provider-${selectedProvider._id}-rejected`}>
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Reject
                  </Button>
                </>
              )}
              {selectedProvider.providerStatus === "approved" && (
                <Button variant="outline" className="flex-1 text-sm" onClick={() => { handleProviderStatus(selectedProvider._id, "suspended"); setSelectedProvider(null); }} isLoading={actionInFlight === `provider-${selectedProvider._id}-suspended`}>
                  <Shield className="h-4 w-4 mr-1.5" />
                  Suspend
                </Button>
              )}
              {selectedProvider.providerStatus === "suspended" && (
                <Button variant="success" className="flex-1 text-sm" onClick={() => { handleProviderStatus(selectedProvider._id, "approved"); setSelectedProvider(null); }} isLoading={actionInFlight === `provider-${selectedProvider._id}-approved`}>
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Unsuspend
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}