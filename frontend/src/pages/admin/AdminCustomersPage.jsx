import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  IndianRupee, 
  Eye, 
  Loader2,
  UserCircle,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Filter,
  X,
  TrendingUp,
  UserPlus,
  Wallet
} from "lucide-react";
import { GlassCard } from "../../components/admin/GlassCard";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { adminApi } from "../../services/api";
import { useUI } from "../../context/UIContext";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";

const sectionAnimation = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const getStatusConfig = (status) => {
  const configs = {
    completed: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle, label: "Completed" },
    confirmed: { bg: "bg-blue-100", text: "text-blue-700", icon: Clock, label: "Confirmed" },
    provider_assigned: { bg: "bg-purple-100", text: "text-purple-700", icon: Clock, label: "Assigned" },
    pending: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock, label: "Pending" },
    cancelled: { bg: "bg-slate-100", text: "text-slate-700", icon: XCircle, label: "Cancelled" },
    rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Rejected" },
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

export function AdminCustomersPage() {
  const { hideBottomNav, showBottomNav } = useUI();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
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

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getCustomers();
        if (response.data?.success) {
          setCustomers(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        setError(err.response?.data?.message || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const fetchCustomerDetails = async (customerId) => {
    try {
      setLoadingBookings(true);
      const response = await adminApi.getCustomer(customerId);
      if (response.data?.success) {
        setSelectedCustomer(response.data.data.customer);
        setCustomerBookings(response.data.data.bookings);
      }
    } catch (err) {
      console.error("Failed to fetch customer details:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCustomers = customers.length;
  const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const totalBookings = customers.reduce((sum, c) => sum + (c.totalBookings || 0), 0);
  const avgSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

  return (
    <div className="admin-page-shell space-y-3 sm:space-y-6 px-3 sm:px-4 pb-16 sm:pb-24 pt-3 sm:pt-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-500 to-violet-600 p-5 sm:p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/5 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold">Customers</h1>
              <p className="mt-1 sm:mt-2 max-w-xl text-xs sm:text-sm text-blue-100">
                Manage all registered customers, view their booking history and spending patterns.
              </p>
            </div>
            <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Users className="h-7 w-7" />
            </div>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-800"
        >
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            {error}
          </div>
        </motion.div>
      )}

      <motion.section
        variants={sectionAnimation}
        initial="hidden"
        animate="visible"
        className="space-y-4 sm:space-y-6"
      >
        {/* Stats Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Total Customers */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-50 transition-transform group-hover:scale-150 group-hover:bg-blue-100"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{totalCustomers}</p>
              <p className="text-xs text-slate-500 mt-1">Customers</p>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-50 transition-transform group-hover:scale-150 group-hover:bg-emerald-100"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200">
                <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Revenue</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{formatCurrency(totalSpent)}</p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> All time
              </p>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-violet-50 transition-transform group-hover:scale-150 group-hover:bg-violet-100"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-200">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Bookings</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{totalBookings}</p>
              <p className="text-xs text-slate-500 mt-1">Total made</p>
            </div>
          </div>

          {/* Average Spent */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-50 transition-transform group-hover:scale-150 group-hover:bg-amber-100"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-200">
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Spent</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{formatCurrency(avgSpent)}</p>
              <p className="text-xs text-slate-500 mt-1">Per customer</p>
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
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Filter
              </Button>
              <div className="flex rounded-lg bg-slate-100 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-md p-1.5 transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
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
                  className={`rounded-md p-1.5 transition-all ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
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
              Showing {filteredCustomers.length} result{filteredCustomers.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          )}
        </GlassCard>

        {/* Customer List */}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-white shadow-md" />
            ))}
          </div>
        ) : filteredCustomers.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCustomers.map((customer, index) => (
                <motion.div
                  key={customer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <GlassCard hover={true} className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${getAvatarGradient(customer.name)} text-white text-xl font-bold shadow-lg`}>
                        {customer.name?.charAt(0) || "C"}
                      </div>
                      <h3 className="mt-3 truncate text-sm font-semibold text-slate-900 w-full">{customer.name}</h3>
                      <p className="text-xs text-slate-500 truncate w-full">{customer.email}</p>
                      
                      <div className="mt-4 flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                        <div className="text-center">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Bookings</p>
                          <p className="text-sm font-bold text-slate-900">{customer.totalBookings || 0}</p>
                        </div>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div className="text-center">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Spent</p>
                          <p className="text-sm font-bold text-emerald-600">{formatCurrency(customer.totalSpent || 0)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex w-full items-center justify-between">
                        <p className="text-xs text-slate-400">{formatDate(customer.createdAt)}</p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => fetchCustomerDetails(customer._id)}
                          className="h-8 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="hidden sm:grid gap-3 rounded-2xl bg-slate-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 grid-cols-12">
                <div className="col-span-4">Customer</div>
                <div className="col-span-2 text-center">Bookings</div>
                <div className="col-span-2 text-center">Spent</div>
                <div className="col-span-2 text-center">Joined</div>
                <div className="col-span-2 text-right">Action</div>
              </div>
              {filteredCustomers.map((customer, index) => (
                <motion.div
                  key={customer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <GlassCard hover={true} className="p-3 sm:p-4">
                    <div className="grid gap-3 sm:grid-cols-12 sm:items-center">
                      <div className="flex items-center gap-3 sm:col-span-4">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarGradient(customer.name)} text-white font-bold`}>
                          {customer.name?.charAt(0) || "C"}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-900">{customer.name}</h3>
                          <p className="truncate text-xs text-slate-500">{customer.email}</p>
                        </div>
                      </div>
                      
                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:hidden">Bookings</p>
                        <p className="text-base font-bold text-slate-900 sm:text-center">{customer.totalBookings || 0}</p>
                      </div>
                      
                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:hidden">Spent</p>
                        <p className="text-base font-bold text-emerald-600 sm:text-center">{formatCurrency(customer.totalSpent || 0)}</p>
                      </div>
                      
                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:hidden">Joined</p>
                        <p className="text-sm text-slate-500 sm:text-center">{formatDate(customer.createdAt)}</p>
                      </div>
                      
                      <div className="sm:col-span-2 flex justify-end">
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => fetchCustomerDetails(customer._id)}
                          className="text-xs"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          <span className="sm:hidden">View</span>
                          <span className="hidden sm:inline">Details</span>
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          <GlassCard className="p-10 sm:p-14 text-center" hover={false}>
            <div className="mx-auto mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
              <UserCircle className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{searchQuery ? "No matches found" : "No customers yet"}</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              {searchQuery 
                ? `We couldn't find any customers matching "${searchQuery}". Try a different search term.` 
                : "Customers who register will appear here. Share your booking link to get started."}
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            )}
          </GlassCard>
        )}
      </motion.section>

      {/* Customer Details Modal */}
      <Modal
        open={!!selectedCustomer}
        onClose={() => { setSelectedCustomer(null); setCustomerBookings([]); }}
        title="Customer Details"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br ${getAvatarGradient(selectedCustomer.name)} text-white text-3xl font-bold shadow-xl`}>
                {selectedCustomer.name?.charAt(0) || "C"}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h3>
                <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                      <Mail className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="truncate max-w-[200px]">{selectedCustomer.email}</span>
                  </div>
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                        <Phone className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span>{selectedCustomer.phone}</span>
                    </div>
                  )}
                </div>
                {selectedCustomer.address && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 justify-center sm:justify-start">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedCustomer.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl bg-blue-50/80 p-3 sm:p-4 text-center">
                <Calendar className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold text-slate-900">{customerBookings.length}</p>
                <p className="text-[10px] sm:text-xs font-medium text-blue-600">Total Bookings</p>
              </div>
              <div className="rounded-xl bg-emerald-50/80 p-3 sm:p-4 text-center">
                <CheckCircle className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold text-slate-900">
                  {customerBookings.filter(b => b.status === "completed").length}
                </p>
                <p className="text-[10px] sm:text-xs font-medium text-emerald-600">Completed</p>
              </div>
              <div className="rounded-xl bg-violet-50/80 p-3 sm:p-4 text-center">
                <CreditCard className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-violet-500" />
                <p className="mt-1.5 sm:mt-2 text-lg sm:text-xl font-bold text-slate-900">
                  {formatCurrency(customerBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0))}
                </p>
                <p className="text-[10px] sm:text-xs font-medium text-violet-600">Total Spent</p>
              </div>
            </div>

            {/* Booking History */}
            <div>
              <h4 className="mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-900">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                Booking History
              </h4>
              {loadingBookings ? (
                <div className="flex justify-center py-6 sm:py-10">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-500" />
                </div>
              ) : customerBookings.length > 0 ? (
                <div className="max-h-48 sm:max-h-80 space-y-2 sm:space-y-3 overflow-auto scrollbar-thin">
                  {customerBookings.slice(0, 10).map((booking) => {
                    const statusConfig = getStatusConfig(booking.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <div 
                        key={booking._id} 
                        className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:p-4 transition-colors hover:bg-slate-100 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-blue-100">
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900 text-sm">
                              {booking.service?.name || "Service"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDate(booking.eventDate || booking.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1 sm:gap-2">
                          <p className="font-semibold text-slate-900 text-sm">
                            {formatCurrency(booking.totalAmount)}
                          </p>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon className="h-2.5 w-2.5" />
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 sm:p-8 text-center">
                  <Calendar className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-slate-300" />
                  <p className="mt-2 sm:mt-3 text-sm text-slate-500">No bookings yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}