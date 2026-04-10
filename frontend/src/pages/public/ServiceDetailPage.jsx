import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  Lock,
  MapPin,
  Sparkles,
  Star,
  Users,
  Globe,
  TrendingUp,
} from "lucide-react";
import { publicApi } from "../../services/api";
import { Button } from "../../components/common/Button";
import { Footer } from "../../components/common/Footer";
import { useAuth } from "../../context/AuthContext";

function getInitial(name) {
  return (name || "P").charAt(0).toUpperCase();
}

function getProviderGalleryImages(services = []) {
  return services
    .flatMap((service) => {
      if (service.images?.length) {
        return service.images;
      }

      return service.image ? [service.image] : [];
    })
    .filter(Boolean)
    .slice(0, 5);
}

export function ServiceDetailPage() {
  const { serviceName } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const canShowPrices = isAuthenticated && user?.role === "customer";

  const decodedServiceName = decodeURIComponent(serviceName || "");

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const categoriesRes = await publicApi.getServiceCategories();
        const category = categoriesRes.data.data.find(
          (item) =>
            item.slug === decodedServiceName.toLowerCase().replace(/\s+/g, "-") ||
            item.name.toLowerCase() === decodedServiceName.toLowerCase()
        );

        if (!category) {
          setData(null);
          setError("No providers available for this service yet.");
          return;
        }

        const providersRes = await publicApi.getProvidersByCategory(category._id);
        setData(providersRes.data.data);
        setError(null);
      } catch (requestError) {
        console.error("Error fetching providers:", requestError);
        setError("No providers available for this service yet.");
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [decodedServiceName]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <div className="relative flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          <p className="text-sm text-slate-600 font-medium">Loading providers...</p>
        </div>
      </div>
    );
  }

  const { category, providers = [] } = data || {};

  if (error || providers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] bg-gradient-to-br from-primary-200/40 via-blue-200/30 to-indigo-200/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] bg-gradient-to-tr from-purple-200/30 via-pink-200/20 to-rose-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-white/50" />
        </div>

        <div className="relative px-6 py-10 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <button
              onClick={() => navigate("/services")}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Services
            </button>

            <div className="bg-white/90 backdrop-blur-2xl rounded-2xl p-12 text-center shadow-xl border border-white/60">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-blue-500 text-white shadow-lg">
                <Sparkles className="h-10 w-10" />
              </div>
              <h2 className="mt-6 font-display text-3xl font-bold text-slate-950">
                No providers available
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-600">
                {error || `No service providers are available for ${decodedServiceName} yet. Please check back later or browse another service category.`}
              </p>
              <Button onClick={() => navigate("/services")} className="mt-8">
                Browse Services
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayServiceName =
    category?.name ||
    decodedServiceName
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  const minPrices = providers
    .flatMap((item) => (item.services || []).map((service) => Number(service.startingPrice) || 0))
    .filter((price) => price > 0);
  const startingFrom = minPrices.length > 0 ? Math.min(...minPrices) : null;

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

      {/* Back Button - Top Left for All Devices */}
      <div className="relative px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => navigate("/services")}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </button>
        </div>
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
              <span className="text-xs font-bold text-slate-700 tracking-widest uppercase">✨ Provider Comparison</span>
              <div className="h-3 w-px bg-slate-300" />
              <span className="text-[10px] font-semibold text-primary-600">PREMIUM</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-slate-900 mb-5 leading-[0.9] tracking-tight"
            >
              {displayServiceName}
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x relative inline-block">
                Providers
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
              Compare providers offering this category, review their service lineup, and open their dedicated service pages for booking.
            </motion.p>


          </motion.div>

          {/* Premium Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-4 items-stretch"
          >
            {[
              { value: providers.length, label: "Providers", icon: Users },
              {
                value: canShowPrices
                  ? startingFrom
                    ? `INR ${startingFrom.toLocaleString()}`
                    : "Custom"
                  : "Login",
                label: canShowPrices ? "Starting From" : "Pricing",
                icon: TrendingUp,
              },
              { value: category?.name || displayServiceName, label: "Category", icon: Globe },
              { value: "4.9★", label: "Avg Rating", icon: Star },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                className="group relative flex"
              >
                <div className={`absolute inset-0 rounded-xl opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:blur-2xl ${[
                  "bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-blue-500/20",
                  "bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
                  "bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-purple-500/20",
                  "bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-yellow-500/20",
                ][index]}`} />
                <div className={`relative flex w-full flex-col items-center justify-center rounded-2xl border bg-white/85 p-4 text-center shadow-lg shadow-slate-200/20 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl ${
                  ["border-cyan-100/80", "border-emerald-100/80", "border-violet-100/80", "border-amber-100/80"][index]
                }`}>
                  <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110 ${[
                    "bg-gradient-to-br from-cyan-500 to-blue-600",
                    "bg-gradient-to-br from-emerald-500 to-teal-600",
                    "bg-gradient-to-br from-violet-500 to-fuchsia-600",
                    "bg-gradient-to-br from-amber-500 to-orange-600",
                  ][index]}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="mb-1 text-2xl font-display font-black text-slate-900 sm:text-3xl">{stat.value}</p>
                  <p className="text-xs font-semibold text-slate-600">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Providers Section */}
      <section className="relative py-8 sm:py-10 md:py-12 px-4 sm:px-6">
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
              <span className="text-xs font-bold text-emerald-700 tracking-wide">AVAILABLE PROVIDERS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-slate-900 mb-4 leading-tight">
              {providers.length} Provider{providers.length === 1 ? "" : "s"}{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Available
              </span>
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Compare providers, review their services, and book the perfect fit for your event
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {providers.map((item, index) => {
              const provider = item.provider;
              const services = item.services || [];
              const validPrices = services
                .map((service) => Number(service.startingPrice) || 0)
                .filter((price) => price > 0);
              const minPrice = validPrices.length ? Math.min(...validPrices) : null;
              const previewImages = getProviderGalleryImages(services);
              const providerRatingCount = Number(provider.ratingCount || 0);
              const providerRatingLabel = providerRatingCount > 0
                ? Number(provider.rating || 0).toFixed(1)
                : "New";

              return (
                <motion.div
                  key={provider._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-blue-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                  <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-lg shadow-slate-200/30 transition-all duration-500 hover:-translate-y-1 hover:border-primary-200/60 hover:shadow-2xl hover:shadow-primary-200/40">
                    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 sm:p-6">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-400 to-transparent rounded-full blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400 to-transparent rounded-full blur-2xl" />
                      </div>

                      <div className="relative flex items-start gap-4">
                        {provider.avatar ? (
                          <img
                            src={provider.avatar}
                            alt={provider.businessName || provider.name}
                            className="h-16 w-16 rounded-2xl object-cover shadow-xl border-2 border-white/20"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-blue-500 text-2xl font-bold text-white shadow-xl">
                            {getInitial(provider.businessName || provider.name)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-display text-xl font-bold text-white">
                            {provider.businessName || provider.name}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-amber-200">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              {providerRatingLabel}
                              {providerRatingCount ? ` (${providerRatingCount})` : ""}
                            </span>
                            <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-white/80">
                              {provider.experience || 0} yrs exp
                            </span>
                          </div>
                          {provider.address ? (
                            <p className="mt-3 flex items-center gap-2 text-sm text-white/70">
                              <MapPin className="h-4 w-4" />
                              {provider.address}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between gap-5 p-5 sm:p-6">
                      <div className="space-y-4">
                        {previewImages.length ? (
                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                            <img
                              src={previewImages[0]}
                              alt={`${provider.businessName || provider.name} featured work`}
                              className="h-40 w-full object-cover"
                            />
                          </div>
                        ) : null}

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-blue-50 p-4">
                            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 shadow-md">
                              <Users className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xl font-display font-black text-slate-900">{services.length}</p>
                            <p className="text-xs font-semibold text-slate-500">Services offered</p>
                          </div>
                          <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
                              <Star className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xl font-display font-black text-slate-900">{providerRatingLabel}</p>
                            <p className="text-xs font-semibold text-slate-500">
                              {providerRatingCount ? `${providerRatingCount} review${providerRatingCount === 1 ? "" : "s"}` : "No reviews yet"}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {services.slice(0, 2).map((service) => (
                              <span
                                key={service._id}
                                className="inline-flex max-w-full items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                              >
                                <span className="truncate">{service.name}</span>
                              </span>
                            ))}
                            {services.length > 2 ? (
                              <span className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
                                +{services.length - 2} more
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-5">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-sm text-slate-500">
                            {canShowPrices ? "Starting from" : "Pricing"}
                          </span>
                          {canShowPrices ? (
                            <span className="font-display text-2xl font-semibold text-slate-950">
                              {minPrice ? `INR ${Number(minPrice).toLocaleString()}` : "Custom"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                              <Lock className="h-4 w-4" />
                              Login to view
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/provider/${provider._id}?category=${category?._id || ""}`}
                          className="group/btn relative inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 overflow-hidden"
                        >
                          {/* Button Background Animation */}
                          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-blue-500 to-indigo-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                          
                          <span className="relative">View Services</span>
                          <ChevronRight className="relative h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
