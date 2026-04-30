import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Filter,
  Loader2,
  Search,
  Sparkles,
  Users,
  Globe,
  Star,
  X,
  Check,
} from "lucide-react";
import { useUI } from "../../context/UIContext";
import { publicApi } from "../../services/api";
import { Footer } from "../../components/common/Footer";

const statCardThemes = [
  {
    glow: "bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-blue-500/20",
    border: "border-cyan-100/80",
    background: "bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100/90",
    icon: "bg-gradient-to-br from-cyan-500 to-blue-600",
  },
  {
    glow: "bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-purple-500/20",
    border: "border-violet-100/80",
    background: "bg-gradient-to-br from-violet-100 via-fuchsia-50 to-purple-100/90",
    icon: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
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
];

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
        partnerIds: new Set(),
      });
    }

    if (service.createdBy?._id) {
      groups.get(key).partnerIds.add(service.createdBy._id);
    }
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      partnerCount: group.partnerIds.size,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function ServicesPage() {
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
        setError(requestError.response?.data?.message || "Unable to load services right now.");
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

  const pageStats = useMemo(
    () => ({
      categories: categories.length,
      services: serviceGroups.length,
      partners: new Set(services.map((service) => service.createdBy?._id).filter(Boolean)).size,
    }),
    [categories.length, serviceGroups.length, services]
  );

  const selectedCategoryName = useMemo(
    () => categories.find((category) => category._id === selectedCategory)?.name || "",
    [categories, selectedCategory]
  );

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

  const handleSearchFocus = () => hideBottomNav();
  const handleSearchBlur = () => showBottomNav();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <div className="relative flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
          <p className="text-sm font-medium text-slate-600">Loading available services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary-200/40 via-blue-200/30 to-indigo-200/20 blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-purple-200/30 via-pink-200/20 to-rose-200/10 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-gradient-to-r from-emerald-200/30 to-teal-200/20 blur-2xl animate-bounce"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute right-1/3 bottom-1/3 h-24 w-24 rounded-full bg-gradient-to-r from-violet-200/40 to-purple-200/30 blur-2xl animate-bounce"
          style={{ animationDuration: "10s", animationDelay: "1s" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-white/50" />
      </div>

      <section className="relative overflow-hidden px-4 pt-2 pb-0 sm:px-6">
        <div className="relative mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/60 bg-gradient-to-r from-white/95 via-white/90 to-white/95 px-5 py-2.5 shadow-xl shadow-slate-200/30 backdrop-blur-2xl"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 via-blue-500 to-indigo-500 shadow-lg shadow-primary-500/30">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
                Curated Event Services Platform
              </span>
              <div className="h-3 w-px bg-slate-300" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-600">
                Verified Partners
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-5 text-3xl font-display font-extrabold leading-[0.92] tracking-[-0.04em] text-slate-950 sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Explore services for
              <br />
              <span className="relative inline-block bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                every event format
                <div className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-primary-500 via-blue-500 to-indigo-500 opacity-90" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mx-auto mb-8 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg md:text-[1.15rem] md:leading-8"
            >
              Explore service options, compare verified partners, and shortlist the right fit for your event with
              more clarity and less guesswork.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-4"
          >
            {[
              { value: pageStats.categories, label: "Service Categories", icon: Globe },
              { value: pageStats.services, label: "Available Services", icon: Sparkles },
              { value: pageStats.partners, label: "Verified Partners", icon: Users },
              { value: "4.9/5", label: "Average Client Rating", icon: Star },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                className="group relative"
              >
                <div className={`absolute inset-0 rounded-xl opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:blur-2xl ${statCardThemes[index].glow}`} />
                <div className={`relative flex h-full min-h-[150px] flex-col items-center justify-center rounded-2xl border p-4 text-center shadow-lg shadow-slate-200/20 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl ${statCardThemes[index].border}`}>
                  <div className={`absolute inset-0 rounded-2xl ${statCardThemes[index].background}`} />
                  <div className={`relative mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110 ${statCardThemes[index].icon}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="relative mb-1 text-2xl font-display font-extrabold text-slate-900 sm:text-3xl">{stat.value}</p>
                  <p className="relative flex min-h-[2.5rem] items-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="services-section" className="relative px-4 py-4 pb-4 sm:px-6 sm:py-6 md:py-8">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.03)_1px,transparent_0)] bg-[size:40px_40px]" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6 text-center sm:mb-8"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2">
              <Globe className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-bold tracking-[0.18em] text-emerald-700">DISCOVER SERVICES</span>
            </div>
            <h2 className="mb-4 text-2xl font-display font-extrabold leading-tight tracking-[-0.03em] text-slate-900 sm:text-3xl md:text-4xl">
              Compare available{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                services
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600">
              Review service names, category fit, and verified partner availability before you move to the next step.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative rounded-3xl border border-sky-100/80 bg-[radial-gradient(circle_at_top_right,rgba(191,219,254,0.45),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,246,255,0.95)_50%,rgba(245,251,255,0.98))] shadow-[0_24px_80px_rgba(148,163,184,0.18)]">
              <div className="absolute inset-0 opacity-70">
                <div className="absolute top-0 right-0 h-[240px] w-[240px] rounded-full bg-sky-200/70 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-[220px] w-[220px] rounded-full bg-cyan-100/80 blur-3xl" />
              </div>
              <div className="absolute inset-0 opacity-[0.05]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.7)_1px,transparent_1px)] bg-[size:40px_40px]" />
              </div>

              <div className="relative p-6 sm:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/85 px-4 py-2 shadow-sm shadow-sky-100">
                        <Search className="h-4 w-4 text-sky-600" />
                        <span className="text-xs font-bold tracking-[0.16em] text-sky-700">SEARCH & FILTER</span>
                      </div>
                      <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-3xl">
                        Find the right service faster
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        Search by service name or narrow the list by category to shortlist the best fit for your event.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/85 px-5 py-3 shadow-sm shadow-slate-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-blue-500 shadow-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-display font-extrabold text-slate-950">{filteredServices.length}</p>
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                          Service{filteredServices.length === 1 ? "" : "s"} found
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_280px]">
                    <label className="relative block">
                      <div className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-slate-100 sm:left-4 sm:h-10 sm:w-10 sm:rounded-xl">
                        <Search className="h-4 w-4 text-slate-500 sm:h-5 sm:w-5" />
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                        placeholder="Search service name..."
                        className="w-full rounded-xl border border-slate-200 bg-white/92 py-3 pl-11 pr-3 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-500/10 sm:rounded-2xl sm:py-4 sm:pl-14 sm:pr-4"
                      />
                    </label>

                    <div className="relative md:hidden">
                      <button
                        type="button"
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        className="flex h-[48px] w-full items-center gap-2 rounded-xl border border-slate-200 bg-white/92 px-3 py-3 transition-colors hover:bg-white sm:h-[56px] sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-4"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 sm:h-10 sm:w-10 sm:rounded-xl">
                          <Filter className="h-4 w-4 text-slate-500 sm:h-5 sm:w-5" />
                        </div>
                        <span className="max-w-[150px] truncate text-sm text-slate-700">
                          {selectedCategoryName || "All Categories"}
                        </span>
                      </button>
                      {isCategoryDropdownOpen ? (
                        <div className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                          <div className="max-h-[200px] overflow-y-auto">
                            <button
                              onClick={() => {
                                updateCategory("");
                                setIsCategoryDropdownOpen(false);
                              }}
                              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                                !selectedCategory ? "bg-primary-50 text-primary-700" : "text-slate-900 hover:bg-slate-50"
                              }`}
                            >
                              <Globe className={`h-5 w-5 ${!selectedCategory ? "text-primary-600" : "text-slate-500"}`} />
                              <span className="font-medium">All Categories</span>
                              {!selectedCategory ? <Check className="ml-auto h-4 w-4 text-primary-600" /> : null}
                            </button>
                            {categories.map((category) => (
                              <button
                                key={category._id}
                                onClick={() => {
                                  updateCategory(category._id);
                                  setIsCategoryDropdownOpen(false);
                                }}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                                  selectedCategory === category._id
                                    ? "bg-primary-50 text-primary-700"
                                    : "text-slate-900 hover:bg-slate-50"
                                }`}
                              >
                                <Globe
                                  className={`h-5 w-5 ${
                                    selectedCategory === category._id ? "text-primary-600" : "text-slate-500"
                                  }`}
                                />
                                <span className="font-medium">{category.name}</span>
                                {selectedCategory === category._id ? (
                                  <Check className="ml-auto h-4 w-4 text-primary-600" />
                                ) : null}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="hidden h-[48px] items-center gap-2 rounded-xl border border-slate-200 bg-white/92 px-3 py-3 transition-colors hover:bg-white md:flex sm:h-[56px] sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-4"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 sm:h-10 sm:w-10 sm:rounded-xl">
                        <Filter className="h-4 w-4 text-slate-500 sm:h-5 sm:w-5" />
                      </div>
                      <span className="max-w-[150px] truncate text-sm text-slate-700">
                        {selectedCategoryName || "All Categories"}
                      </span>
                    </button>
                  </div>

                  {selectedCategoryName || searchTerm ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedCategoryName ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-700">
                          <Globe className="h-3.5 w-3.5" />
                          Category: {selectedCategoryName}
                          <button
                            onClick={() => updateCategory("")}
                            className="ml-1 inline-flex items-center justify-center rounded-full transition-colors hover:text-primary-900"
                            aria-label="Clear category filter"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ) : null}
                      {searchTerm ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-700">
                          <Search className="h-3.5 w-3.5" />
                          Search: {searchTerm}
                          <button
                            onClick={() => setSearchTerm("")}
                            className="ml-1 inline-flex items-center justify-center rounded-full transition-colors hover:text-slate-900"
                            aria-label="Clear search"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>

          {error ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 backdrop-blur-2xl">
                <p className="text-sm text-rose-600">{error}</p>
              </div>
            </motion.div>
          ) : null}

          <div className="mt-8">
            {filteredServices.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-12 text-center">
                <div className="rounded-2xl border border-white/60 bg-white/90 p-12 shadow-xl backdrop-blur-2xl">
                  <p className="font-semibold text-slate-900">No matching services found.</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Try adjusting your search term or selecting a different category.
                  </p>
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
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500/10 via-transparent to-blue-500/10 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:blur-2xl" />
                    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-lg shadow-slate-200/30 transition-all duration-500 hover:-translate-y-1 hover:border-primary-200/60 hover:shadow-2xl hover:shadow-primary-200/40">
                      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 sm:p-6">
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-bl from-primary-400 to-transparent blur-2xl" />
                          <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-tr from-blue-400 to-transparent blur-2xl" />
                        </div>

                        <div className="relative">
                          {service.category?.name ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
                              <Globe className="h-3 w-3" />
                              {service.category.name}
                            </span>
                          ) : null}
                          <h2 className="mt-4 font-display text-xl font-bold text-white transition-colors duration-300 group-hover:text-primary-300 sm:text-2xl">
                            {service.name}
                          </h2>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col justify-between gap-5 p-5 sm:p-6">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-blue-50 p-4">
                            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 shadow-md">
                              <Users className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xl font-display font-black text-slate-900">{service.partnerCount || 0}</p>
                            <p className="text-xs font-semibold text-slate-500">
                              Partner{service.partnerCount === 1 ? "" : "s"}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
                            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                              <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-sm font-bold text-slate-900">{service.category?.name || "Service category"}</p>
                            <p className="text-xs font-semibold text-slate-500">Category overview</p>
                          </div>
                        </div>

                        <Link
                          to={buildCategoryPath(service.category)}
                          className="group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/40"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-blue-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
                          <span className="relative">View Partners</span>
                          <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
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

      <AnimatePresence>
        {isCategoryModalOpen ? (
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
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-primary-50 via-white to-blue-50 px-5 py-5 sm:px-6">
                <div className="absolute inset-0 opacity-70">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary-100/80 blur-3xl" />
                  <div className="absolute -bottom-10 left-0 h-24 w-24 rounded-full bg-blue-100/80 blur-3xl" />
                </div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-display font-bold text-slate-900">Select Category</h3>
                    <p className="mt-1 text-sm text-slate-500">Choose a service category to narrow the results faster.</p>
                  </div>
                  <button
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-white/80 p-4 sm:p-5">
                <div className="space-y-3">
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
                          !selectedCategory ? "bg-gradient-to-br from-primary-500 to-blue-500 shadow-lg shadow-primary-500/20" : "bg-slate-200"
                        }`}
                      >
                        <Globe className={`h-6 w-6 ${!selectedCategory ? "text-white" : "text-slate-600"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-semibold ${!selectedCategory ? "text-primary-700" : "text-slate-900"}`}>
                          All Categories
                        </p>
                        <p className="text-xs text-slate-500">View every service option</p>
                      </div>
                      {!selectedCategory ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 shadow-sm shadow-primary-500/20">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      ) : null}
                    </div>
                  </button>

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
                          <p className={`font-semibold ${selectedCategory === category._id ? "text-primary-700" : "text-slate-900"}`}>
                            {category.name}
                          </p>
                          <p className="text-xs text-slate-500">View {category.name} services</p>
                        </div>
                        {selectedCategory === category._id ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 shadow-sm shadow-primary-500/20">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
