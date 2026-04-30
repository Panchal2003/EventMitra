import { motion } from "framer-motion";
import { 
  Briefcase, 
  Eye, 
  FolderPlus, 
  PencilLine, 
  Plus, 
  Search, 
  Shapes, 
  Star, 
  Trash2,
  X,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Archive
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { GlassCard } from "../../components/admin/GlassCard";
import { ServiceCategoryFormModal } from "../../components/admin/ServiceCategoryFormModal";
import { ServiceFormModal } from "../../components/admin/ServiceFormModal";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useAdminPanelData } from "../../hooks/useAdminPanelData";
import { useUI } from "../../context/UIContext";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";

const sectionAnimation = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } };
const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;
const getStatusConfig = (status) =>
  ({
    active: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle, label: "Active" },
    inactive: { bg: "bg-slate-100", text: "text-slate-700", icon: Clock, label: "Inactive" },
    draft: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock, label: "Draft" },
    archived: { bg: "bg-rose-100", text: "text-rose-700", icon: Archive, label: "Archived" },
  }[status] || { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle, label: "Active" });

const getCardGradient = (index) => {
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
  return gradients[index % gradients.length];
};

export function AdminServicesPage() {
  const { hideBottomNav, showBottomNav } = useUI();
  const {
    actionInFlight,
    categories = [],
    createService,
    createServiceCategory,
    deleteService,
    error,
    loading,
    services = [],
    updateService,
  } = useAdminPanelData();

  const [notice, setNotice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedService, setSelectedService] = useState(null);
  const [serviceModalState, setServiceModalState] = useState({ open: false, service: null });
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
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

  const filteredServices = useMemo(
    () =>
      services.filter((service) => {
        const matchesSearch =
          service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === "all" || service.category?._id === filterCategory;
        return matchesSearch && matchesCategory;
      }),
    [services, searchQuery, filterCategory]
  );

  const totalServices = services.length;
  const activeServices = services.filter((service) => service.status === "active").length;
  const totalCategories = categories.length;
  const averageStartingPrice = totalServices
    ? Math.round(services.reduce((sum, service) => sum + Number(service.startingPrice || 0), 0) / totalServices)
    : 0;

  const handleServiceSubmit = async (payload) => {
    try {
      if (serviceModalState.service) {
        await updateService(serviceModalState.service._id, payload);
        setNotice({ type: "success", message: "Service updated successfully." });
      } else {
        await createService(payload);
        setNotice({ type: "success", message: "Service created successfully." });
      }
      setServiceModalState({ open: false, service: null });
    } catch (requestError) {
      setNotice({ type: "error", message: getErrorMessage(requestError, "Unable to save the service right now.") });
    }
  };

  const handleCategorySubmit = async (payload) => {
    try {
      await createServiceCategory(payload);
      setNotice({ type: "success", message: "Service category created successfully." });
      setCategoryModalOpen(false);
    } catch (requestError) {
      setNotice({ type: "error", message: getErrorMessage(requestError, "Unable to create the service category.") });
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Delete this service from the catalog?")) return;
    try {
      await deleteService(serviceId);
      setNotice({ type: "success", message: "Service deleted successfully." });
    } catch (requestError) {
      setNotice({ type: "error", message: getErrorMessage(requestError, "Unable to delete the service.") });
    }
  };

  const serviceModalBusy =
    actionInFlight === "create-service" || actionInFlight === `update-service-${serviceModalState.service?._id}`;

  return (
    <div className="admin-page-shell space-y-3 sm:space-y-6 px-3 sm:px-4 pb-16 sm:pb-24 pt-3 sm:pt-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-600 p-5 sm:p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="absolute -right-16 -top-16 h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/5 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold">Services Catalog</h1>
              <p className="mt-1 sm:mt-2 max-w-xl text-xs sm:text-sm text-purple-100">
                Create and manage your service catalog with better structure and easier controls.
              </p>
            </div>
            <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Shapes className="h-7 w-7" />
            </div>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-800">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            {error}
          </div>
        </motion.div>
      )}
      {notice && (
        <div className={`rounded-2xl px-4 py-3 text-sm ${
          notice.type === "success" 
            ? "border border-emerald-100 bg-emerald-50 text-emerald-700" 
            : "border border-red-100 bg-red-50 text-red-700"
        }`}>
          {notice.message}
        </div>
      )}

      <motion.section variants={sectionAnimation} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Total Services */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-50 transition-transform group-hover:scale-150 group-hover:bg-blue-100"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200">
                <Shapes className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{totalServices}</p>
              <p className="text-xs text-slate-500 mt-1">Services</p>
            </div>
          </div>

          {/* Active Services */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-50 transition-transform group-hover:scale-150 group-hover:bg-emerald-100"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Active</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{activeServices}</p>
              <p className="text-xs text-emerald-600 mt-1">Available</p>
            </div>
          </div>

          {/* Categories */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-violet-50 transition-transform group-hover:scale-150 group-hover:bg-violet-100"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-200">
                <FolderPlus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Categories</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{totalCategories}</p>
              <p className="text-xs text-slate-500 mt-1">Total</p>
            </div>
          </div>

          {/* Average Price */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-50 transition-transform group-hover:scale-150 group-hover:bg-amber-100"></div>
            <div className="relative">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-200">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <p className="mt-3 sm:mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Price</p>
              <p className="text-xl sm:text-2xl font-display font-bold text-slate-900">{formatCurrency(averageStartingPrice)}</p>
              <p className="text-xs text-slate-500 mt-1">Starting from</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <GlassCard className="p-3 sm:p-5" hover={false}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 text-sm text-slate-700 outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Filters Row */}
            <div className="flex items-center gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:py-3 text-xs text-slate-700 outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
              <div className="flex rounded-lg bg-slate-100 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-md p-1.5 transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-violet-600" : "text-slate-400 hover:text-slate-600"}`}
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
                  className={`rounded-md p-1.5 transition-all ${viewMode === "list" ? "bg-white shadow-sm text-violet-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <div className="flex h-4 w-4 flex-col gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => setCategoryModalOpen(true)}>
                <FolderPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                <span className="sm:hidden">Cat</span>
                <span className="hidden sm:inline">Category</span>
              </Button>
              <Button size="sm" className="flex-1" onClick={() => setServiceModalState({ open: true, service: null })}>
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                <span className="sm:hidden">Add</span>
                <span className="hidden sm:inline">Add Service</span>
              </Button>
            </div>
          </div>
          {(searchQuery || filterCategory !== "all") && (
            <p className="mt-2 text-xs text-slate-500">
              Showing {filteredServices.length} result{filteredServices.length !== 1 ? "s" : ""}
              {searchQuery && ` for "${searchQuery}"`}
              {filterCategory !== "all" && ` in ${categories.find(c => c._id === filterCategory)?.name}`}
            </p>
          )}
        </GlassCard>

        {/* Services Grid/List */}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-white shadow-md" />
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredServices.map((service, index) => {
                const statusConfig = getStatusConfig(service.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <motion.div
                    key={service._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <GlassCard hover={true} className="p-4">
                      <div className="flex flex-col items-center text-center">
                        {/* Image */}
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${getCardGradient(index)} text-white text-xl font-bold shadow-lg overflow-hidden`}>
                          {service.images?.[0] ? (
                            <img src={service.images[0]} alt={service.name} className="h-14 w-14 object-cover" />
                          ) : (
                            <Shapes className="h-6 w-6" />
                          )}
                        </div>
                        
                        <h3 className="mt-3 truncate text-sm font-semibold text-slate-900 w-full">{service.name}</h3>
                        <p className="text-xs text-slate-500 truncate w-full">{service.category?.name || "Uncategorized"}</p>
                        
                        <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                        
                        <div className="mt-4 flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                          <div className="text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Price</p>
                            <p className="text-sm font-bold text-violet-600">{formatCurrency(service.startingPrice)}</p>
                          </div>
                          <div className="h-8 w-px bg-slate-200"></div>
                          <div className="text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Created</p>
                            <p className="text-xs font-medium text-slate-600">{formatDate(service.createdAt)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex w-full items-center justify-between">
                          <p className="text-[10px] text-slate-400 truncate max-w-[80px]">
                            By {service.createdBy?.businessName || service.createdBy?.name || "Admin"}
                          </p>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedService(service)} className="h-8 text-xs">
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
                <div className="col-span-3">Service</div>
                <div className="col-span-2 text-center">Category</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Created</div>
                <div className="col-span-1 text-right">Action</div>
              </div>
              {filteredServices.map((service, index) => {
                const statusConfig = getStatusConfig(service.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <motion.div
                    key={service._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <GlassCard hover={true} className="p-3 sm:p-4">
                      <div className="grid gap-3 sm:grid-cols-12 sm:items-center">
                        <div className="flex items-center gap-3 sm:col-span-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getCardGradient(index)} text-white`}>
                            {service.images?.[0] ? (
                              <img src={service.images[0]} alt={service.name} className="h-10 w-10 rounded-xl object-cover" />
                            ) : (
                              <Shapes className="h-5 w-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-900">{service.name}</h3>
                            <p className="truncate text-xs text-slate-500">{service.description?.substring(0, 40)}...</p>
                          </div>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:hidden">Category</p>
                          <p className="text-sm font-medium text-slate-700 sm:text-center">{service.category?.name || "N/A"}</p>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:hidden">Status</p>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </span>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:hidden">Price</p>
                          <p className="text-base font-bold text-violet-600 sm:text-center">{formatCurrency(service.startingPrice)}</p>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:hidden">Created</p>
                          <p className="text-sm text-slate-500 sm:text-center">{formatDate(service.createdAt)}</p>
                        </div>
                        
                        <div className="sm:col-span-1 flex justify-end gap-1">
                          <Button variant="secondary" size="sm" className="text-xs px-2" onClick={() => setSelectedService(service)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="primary" size="sm" className="text-xs px-2" onClick={() => setServiceModalState({ open: true, service })}>
                            <PencilLine className="h-3 w-3" />
                          </Button>
                          <Button variant="danger" size="sm" className="text-xs px-2" onClick={() => handleDeleteService(service._id)} isLoading={actionInFlight === `delete-service-${service._id}`}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
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
              <Shapes className="h-8 w-8 sm:h-10 sm:w-10 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{searchQuery ? "No matches found" : "No services yet"}</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              {searchQuery 
                ? `We couldn't find any services matching "${searchQuery}". Try a different search term.` 
                : "Services will appear here. Add categories first, then create services."}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              {(searchQuery || filterCategory !== "all") && (
                <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setFilterCategory("all"); }}>
                  Clear Filters
                </Button>
              )}
              <Button size="sm" onClick={() => setServiceModalState({ open: true, service: null })}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Service
              </Button>
            </div>
          </GlassCard>
        )}
      </motion.section>

      {/* Service Details Modal */}
      <Modal open={!!selectedService} onClose={() => setSelectedService(null)} title="Service Details" size="lg">
        {selectedService && (
          <div className="space-y-4 sm:space-y-5">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-5">
              <div className={`flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br ${getCardGradient(0)} text-white text-2xl sm:text-3xl font-bold shadow-xl overflow-hidden`}>
                {selectedService.images?.[0] ? (
                  <img src={selectedService.images[0]} alt={selectedService.name} className="h-16 w-16 sm:h-20 sm:w-20 object-cover" />
                ) : (
                  <Shapes className="h-7 w-7 sm:h-8 sm:w-8" />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">{selectedService.name}</h3>
                <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                  {(() => {
                    const statusConfig = getStatusConfig(selectedService.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    );
                  })()}
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                    {selectedService.category?.name || "Uncategorized"}
                  </span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-slate-500">
                  By {selectedService.createdBy?.businessName || selectedService.createdBy?.name || "Admin"} • {formatDate(selectedService.createdAt)}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl bg-violet-50/60 p-3 sm:p-4">
              <p className="text-[10px] font-semibold uppercase text-violet-600 mb-1.5 sm:mb-2">Description</p>
              <p className="text-sm text-slate-700">{selectedService.description}</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl bg-violet-50/80 p-3 sm:p-4 text-center">
                <Briefcase className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-violet-500" />
                <p className="mt-1.5 sm:mt-2 text-lg sm:text-xl font-bold text-slate-900">{formatCurrency(selectedService.startingPrice)}</p>
                <p className="text-[10px] font-medium text-violet-600">Starting Price</p>
              </div>
              <div className="rounded-xl bg-blue-50/80 p-3 sm:p-4 text-center">
                <Star className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                <p className="mt-1.5 sm:mt-2 text-lg sm:text-xl font-bold text-slate-900">{selectedService.status}</p>
                <p className="text-[10px] font-medium text-blue-600">Status</p>
              </div>
              <div className="rounded-xl bg-emerald-50/80 p-3 sm:p-4 text-center">
                <Calendar className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                <p className="mt-1.5 sm:mt-2 text-sm sm:text-base font-bold text-slate-900">{formatDate(selectedService.createdAt)}</p>
                <p className="text-[10px] font-medium text-emerald-600">Created</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row pt-1">
              <Button variant="primary" className="flex-1 text-sm" onClick={() => { setServiceModalState({ open: true, service: selectedService }); setSelectedService(null); }}>
                <PencilLine className="h-4 w-4 mr-1.5" />
                Edit Service
              </Button>
              <Button variant="danger" className="text-sm" onClick={() => { handleDeleteService(selectedService._id); setSelectedService(null); }} isLoading={actionInFlight === `delete-service-${selectedService._id}`}>
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {serviceModalState.open && (
        <ServiceFormModal
          open={serviceModalState.open}
          onClose={() => setServiceModalState({ open: false, service: null })}
          onSubmit={handleServiceSubmit}
          initialValues={serviceModalState.service}
          categories={categories}
          busy={serviceModalBusy}
        />
      )}

      {categoryModalOpen && (
        <ServiceCategoryFormModal
          open={categoryModalOpen}
          onClose={() => setCategoryModalOpen(false)}
          onSubmit={handleCategorySubmit}
          busy={actionInFlight === "create-service-category"}
        />
      )}
    </div>
  );
}