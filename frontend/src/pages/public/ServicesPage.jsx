import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Filter,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Globe,
  Star,
  X,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { publicApi } from "../../services/api";
import { Button } from "../../components/common/Button";
import { Footer } from "../../components/common/Footer";

function slugify(value) {
  return (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildCategoryPath(category) {
  const slug = category?.slug || slugify(category?.name);
  return slug ? `/services/${encodeURIComponent(slug)}` : "/services";
}

function buildServiceGroups(services) {
  const groups = new Map();

  services.forEach((service) => {
    const categoryId = service.category?._id || "uncategorized";
    const normalizedName = service.name?.trim().toLowerCase() || "service";
    const key = `${categoryId}::${normalizedName}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        name: service.name || "Unnamed Service",
        category: service.category || null,
        providerIds: new Set(),
      });
    }

    if (service.createdBy?._id) {
      groups.get(key).providerIds.add(service.createdBy._id);
    }
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      providerCount: group.providerIds.size,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}



export function ServicesPage() {
  const { isAuthenticated } = useAuth();
  const { hideBottomNav, showBottomNav } = useUI();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [servicesRes, categoriesRes] = await Promise.all([
          publicApi.getServices(),
          publicApi.getServiceCategories(),
        ]);

        if (isCancelled) return;

        setServices(servicesRes.data?.data || []);
        setCategories(categoriesRes.data?.data || []);
        setError("");
      } catch (requestError) {
        if (isCancelled) return;
        setError(requestError.response?.data?.message || "Failed to load services");
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const serviceGroups = useMemo(() => buildServiceGroups(services), [services]);

  const filteredServices = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return serviceGroups.filter((service) => {
      const matchesCategory = !selectedCategory || service.category?._id === selectedCategory;
      const matchesSearch =
        !search ||
        service.name?.toLowerCase().includes(search) ||
        service.category?.name?.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory, serviceGroups]);

  const stats = useMemo(() => {
    return {
      categories: categories.length,
      services: serviceGroups.length,
      providers: new Set(services.map((service) => service.createdBy?._id).filter(Boolean)).size,
    };
  }, [categories.length, serviceGroups.length, services]);

  const selectedCategoryName = useMemo(() => {
    return categories.find((category) => category._id === selectedCategory)?.name || "";
  }, [categories, selectedCategory]);

  const updateCategory = (categoryId) => {
    const nextParams = new URLSearchParams(searchParams);

    if (categoryId) {
      nextParams.set("category", categoryId);
    } else {
      nextParams.delete("category");
    }

    setSearchParams(nextParams);
    setIsCategoryModalOpen(false);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    hideBottomNav();
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    showBottomNav();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <div className="relative flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
          <p className="text-sm text-slate-600 font-medium">Loading premium services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orbs */}
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] bg-gradient-to-br from-primary-200/40 via-blue-200/30 to-indigo-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] bg-gradient-to-tr from-purple-200/30 via-pink-200/20 to-rose-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Secondary floating elements */}
        <div className="absolute top-1/4 left-1/4 h-32 w-32 bg-gradient-to-r from-emerald-200/30 to-teal-200/20 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/3 right-1/3 h-24 w-24 bg-gradient-to-r from-violet-200/40 to-purple-200/30 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-white/50" />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-2 pb-0 px-4 sm:px-6">
        <div className="relative mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full bg-gradient-to-r from-white/95 via-white/90 to-white/95 backdrop-blur-2xl border border-white/60 shadow-xl shadow-slate-200/30"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 via-blue-500 to-indigo-500 shadow-lg shadow-primary-500/30">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-slate-700 tracking-widest uppercase">✨ Premium Event Services</span>
              <div className="h-3 w-px bg-slate-300" />
              <span className="text-[10px] font-semibold text-primary-600">NEW</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-slate-900 mb-5 leading-[0.9] tracking-tight"
            >
              Discover Premium
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x relative inline-block">
                Event Services
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-blue-500 to-indigo-500 rounded-full opacity-90" />
              </span>
            </motion.h1>

            {/* Subtitle - Hidden on mobile */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="hidden sm:block text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed font-medium"
            >
              Browse service categories, compare providers, and book verified professionals for your next event.
              From intimate gatherings to spectacular celebrations, we make every moment unforgettable.
            </motion.p>


          </motion.div>

          {/* Premium Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8"
          >
            {[
              { value: stats.categories, label: "Categories", icon: Globe },
              { value: stats.services, label: "Service Names", icon: Sparkles },
              { value: stats.providers, label: "Providers", icon: Users },
              { value: "4.9★", label: "Average Rating", icon: Star },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-blue-500/5 to-indigo-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-xl p-4 sm:p-5 border border-white/60 shadow-lg shadow-slate-200/20 hover:shadow-xl hover:shadow-primary-200/30 transition-all duration-500 text-center h-full flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-lg bg-gradient-to-br from-primary-500 to-blue-500 shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-display font-black text-slate-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-slate-600 font-medium">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>



      {/* Services Section */}
      <section id="services-section" className="relative py-4 sm:py-6 md:py-8 px-4 sm:px-6 pb-0">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.03)_1px,transparent_0)] bg-[size:40px_40px]" />
        </div>
        
        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-3 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
              <Globe className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 tracking-wide">EXPLORE SERVICES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-slate-900 mb-4 leading-tight">
              Browse{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Services
              </span>
            </h2>
            <p className="hidden sm:block text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Explore all available event services with verified providers ready to make your event special
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-primary-400 via-blue-400 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-indigo-400 via-purple-400 to-transparent rounded-full blur-3xl" />
              </div>

              {/* Grid Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
              </div>

              <div className="relative p-6 sm:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                        <Search className="h-4 w-4 text-primary-400" />
                        <span className="text-xs font-bold text-white/90 tracking-wide">SEARCH & FILTER</span>
                      </div>
                      <h2 className="font-display text-2xl sm:text-3xl font-black text-white">
                        Find Your Perfect Service
                      </h2>
                      <p className="mt-2 text-sm text-slate-300">
                        Search by name or filter by category to discover the right service for your event
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm px-5 py-3 border border-white/20">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-500 shadow-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-display font-black text-white">{filteredServices.length}</p>
                        <p className="text-xs text-slate-300">Service{filteredServices.length === 1 ? "" : "s"} Found</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 grid-cols-2 md:grid-cols-[1fr_280px]">
                    <label className="relative block">
                      <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10">
                        <Search className="h-4 w-4 sm:h-5 sm:w-5 text-white/70" />
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                        placeholder="Search service name..."
                        className="w-full rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm py-3 sm:py-4 pl-11 sm:pl-14 pr-3 sm:pr-4 text-sm text-white placeholder:text-white/50 outline-none transition focus:border-primary-400 focus:bg-white/15 focus:ring-4 focus:ring-primary-500/20"
                      />
                    </label>

                    {/* Mobile Dropdown */}
                    <div className="relative md:hidden">
                      <button
                        type="button"
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-3 sm:py-4 hover:bg-white/20 transition-colors w-full h-[48px] sm:h-[56px]"
                      >
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10">
                          <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-white/70" />
                        </div>
                        <span className="text-sm text-white truncate max-w-[150px]">
                          {selectedCategoryName || "All Categories"}
                        </span>
                      </button>
                      {isCategoryDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                          <div className="max-h-[200px] overflow-y-auto">
                            <button
                              onClick={() => { updateCategory(""); setIsCategoryDropdownOpen(false); }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                !selectedCategory ? "bg-primary-50 text-primary-700" : "hover:bg-slate-50 text-slate-900"
                              }`}
                            >
                              <Globe className={`h-5 w-5 ${!selectedCategory ? "text-primary-600" : "text-slate-500"}`} />
                              <span className="font-medium">All Categories</span>
                              {!selectedCategory && <Check className="h-4 w-4 ml-auto text-primary-600" />}
                            </button>
                            {categories.map((category) => (
                              <button
                                key={category._id}
                                onClick={() => { updateCategory(category._id); setIsCategoryDropdownOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                  selectedCategory === category._id ? "bg-primary-50 text-primary-700" : "hover:bg-slate-50 text-slate-900"
                                }`}
                              >
                                <Globe className={`h-5 w-5 ${selectedCategory === category._id ? "text-primary-600" : "text-slate-500"}`} />
                                <span className="font-medium">{category.name}</span>
                                {selectedCategory === category._id && <Check className="h-4 w-4 ml-auto text-primary-600" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Desktop Modal Button */}
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="hidden md:flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-3 sm:py-4 hover:bg-white/20 transition-colors h-[48px] sm:h-[56px]"
                    >
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10">
                        <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-white/70" />
                      </div>
                      <span className="text-sm text-white truncate max-w-[150px]">
                        {selectedCategoryName || "All Categories"}
                      </span>
                    </button>
                  </div>

                  {(selectedCategoryName || searchTerm) && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedCategoryName ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-primary-500/20 border border-primary-500/30 px-4 py-2 text-xs font-semibold text-primary-300">
                          <Globe className="h-3.5 w-3.5" />
                          Category: {selectedCategoryName}
                          <button
                            onClick={() => updateCategory("")}
                            className="ml-1 hover:text-white transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ) : null}
                      {searchTerm ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-xs font-semibold text-white/80">
                          <Search className="h-3.5 w-3.5" />
                          Search: {searchTerm}
                          <button
                            onClick={() => setSearchTerm("")}
                            className="ml-1 hover:text-white transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="bg-rose-50/90 backdrop-blur-2xl rounded-2xl p-4 border border-rose-200">
                <p className="text-sm text-rose-600">{error}</p>
              </div>
            </motion.div>
          ) : null}

          {/* Services Grid */}
          <div className="mt-8">
            {filteredServices.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="bg-white/90 backdrop-blur-2xl rounded-2xl p-12 shadow-xl border border-white/60">
                  <p className="font-semibold text-slate-900">No services found.</p>
                  <p className="mt-2 text-sm text-slate-500">Try a different search or category filter.</p>
                </div>
              </motion.div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredServices.map((service, index) => (
                  <motion.div
                    key={service.key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-blue-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                    <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-lg shadow-slate-200/30 hover:shadow-2xl hover:shadow-primary-200/40 border border-white/60 hover:border-primary-200/60 transition-all duration-500 h-full flex flex-col">
                      {/* Card Header with Gradient */}
                      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 sm:p-6">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-400 to-transparent rounded-full blur-2xl" />
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400 to-transparent rounded-full blur-2xl" />
                        </div>

                        <div className="relative">
                          {service.category?.name ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
                              <Globe className="h-3 w-3" />
                              {service.category.name}
                            </span>
                          ) : null}
                          <h2 className="mt-4 font-display text-xl sm:text-2xl font-bold text-white group-hover:text-primary-300 transition-colors duration-300">
                            {service.name}
                          </h2>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between gap-5">
                        <div>
                          <p className="text-sm leading-relaxed text-slate-600">
                            Browse providers offering this service category and compare availability before booking.
                          </p>

                          {/* Stats Row */}
                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-slate-50 p-3 text-center">
                              <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br from-primary-500 to-blue-500 shadow-md">
                                <Users className="h-4 w-4 text-white" />
                              </div>
                              <p className="text-lg font-display font-bold text-slate-900">{service.providerCount || 0}</p>
                              <p className="text-xs text-slate-500">Provider{service.providerCount === 1 ? "" : "s"}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3 text-center">
                              <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-md">
                                <Star className="h-4 w-4 text-white" />
                              </div>
                              <p className="text-lg font-display font-bold text-slate-900">4.9</p>
                              <p className="text-xs text-slate-500">Avg Rating</p>
                            </div>
                          </div>
                        </div>

                        <Link
                          to={buildCategoryPath(service.category)}
                          className="group/btn relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 overflow-hidden"
                        >
                          {/* Button Background Animation */}
                          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-blue-500 to-indigo-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                          
                          <span className="relative">View Providers</span>
                          <ArrowRight className="relative h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(241,245,249,0.9)_45%,rgba(226,232,240,0.84)_100%)] p-3 pt-4 pb-24 backdrop-blur-md sm:items-center sm:p-5"
            onClick={() => setIsCategoryModalOpen(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="flex max-h-[78vh] w-full max-w-xl flex-col overflow-hidden rounded-[30px] border border-white/80 bg-white/95 shadow-[0_24px_70px_rgba(148,163,184,0.24)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-primary-50 via-white to-blue-50 px-5 py-5 sm:px-6">
                <div className="absolute inset-0 opacity-70">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary-100/80 blur-3xl" />
                  <div className="absolute -bottom-10 left-0 h-24 w-24 rounded-full bg-blue-100/80 blur-3xl" />
                </div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-display font-bold text-slate-900">Select Category</h3>
                    <p className="mt-1 text-sm text-slate-500">Choose a service category for faster browsing.</p>
                  </div>
                  <button
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto bg-white/80 p-4 sm:p-5">
                <div className="space-y-3">
                  {/* All Categories Option */}
                  <button
                    onClick={() => updateCategory("")}
                    className={`w-full rounded-[24px] border p-4 text-left transition-all duration-200 ${
                      !selectedCategory
                        ? "border-primary-200 bg-gradient-to-r from-primary-50 to-blue-50 shadow-sm shadow-primary-100/60"
                        : "border-slate-200 bg-slate-50/90 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          !selectedCategory
                            ? "bg-gradient-to-br from-primary-500 to-blue-500 shadow-lg shadow-primary-500/20"
                            : "bg-slate-200"
                        }`}
                      >
                        <Globe className={`h-6 w-6 ${!selectedCategory ? "text-white" : "text-slate-600"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-semibold ${!selectedCategory ? "text-primary-700" : "text-slate-900"}`}>All Categories</p>
                        <p className="text-xs text-slate-500">View all services</p>
                      </div>
                      {!selectedCategory && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 shadow-sm shadow-primary-500/20">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Category Options */}
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => updateCategory(category._id)}
                      className={`w-full rounded-[24px] border p-4 text-left transition-all duration-200 ${
                        selectedCategory === category._id
                          ? "border-primary-200 bg-gradient-to-r from-primary-50 to-blue-50 shadow-sm shadow-primary-100/60"
                          : "border-slate-200 bg-slate-50/90 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                            selectedCategory === category._id
                              ? "bg-gradient-to-br from-primary-500 to-blue-500 shadow-lg shadow-primary-500/20"
                              : "bg-slate-200"
                          }`}
                        >
                          <Globe className={`h-6 w-6 ${selectedCategory === category._id ? "text-white" : "text-slate-600"}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`font-semibold ${selectedCategory === category._id ? "text-primary-700" : "text-slate-900"}`}>{category.name}</p>
                          <p className="text-xs text-slate-500">Browse {category.name} services</p>
                        </div>
                        {selectedCategory === category._id && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 shadow-sm shadow-primary-500/20">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
