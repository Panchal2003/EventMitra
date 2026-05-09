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
  Navigation,
  LocateFixed,
  X,
  Loader2,
} from "lucide-react";
import { publicApi } from "../../services/api";
import { Button } from "../../components/common/Button";
import { Footer } from "../../components/common/Footer";
import { useAuth } from "../../context/AuthContext";
import { filterProvidersByDistance, formatDistance } from "../../utils/distance";

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
    glow: "bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-purple-500/20",
    border: "border-violet-100/80",
    background: "bg-gradient-to-br from-violet-100 via-fuchsia-50 to-purple-100/90",
    icon: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
  },
  {
    glow: "bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-yellow-500/20",
    border: "border-amber-100/80",
    background: "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100/90",
    icon: "bg-gradient-to-br from-amber-500 to-orange-600",
  },
];

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

  // Location filter state
  const [userLocation, setUserLocation] = useState({ lat: "", lon: "" });
  const [userAddress, setUserAddress] = useState("");
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [isLocating, setIsLocating] = useState(false);

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
          setError("No partners are available for this service yet.");
          return;
        }

        const providersRes = await publicApi.getProvidersByCategory(category._id);
        setData(providersRes.data.data);
        setError(null);
      } catch (requestError) {
        console.error("Error fetching providers:", requestError);
        setError("No partners are available for this service yet.");
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [decodedServiceName]);

  // Filter providers by location when user location is set
  useEffect(() => {
    if (!data?.providers) return;

    const userLat = parseFloat(userLocation.lat);
    const userLon = parseFloat(userLocation.lon);

    if (userLocation.lat && userLocation.lon && !isNaN(userLat) && !isNaN(userLon)) {
      const filtered = filterProvidersByDistance(data.providers, userLat, userLon, 10);
      setFilteredProviders(filtered);
    } else {
      setFilteredProviders(data.providers);
    }
  }, [userLocation, data?.providers]);

  // Handle "Use my location" button
  const handleUseMyLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude.toString(),
            lon: position.coords.longitude.toString(),
          });
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please enter manually.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  // Handle manual location input
  const handleApplyLocationFilter = () => {
    const lat = parseFloat(userLocation.lat);
    const lon = parseFloat(userLocation.lon);

    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      // Filter will be applied by the useEffect
      setShowLocationFilter(false);
    } else {
      alert("Please enter valid latitude and longitude coordinates, or use 'Find my location'");
    }
  };

  // Clear location filter
  const handleClearLocationFilter = () => {
    setUserLocation({ lat: "", lon: "" });
    setUserAddress("");
    setShowLocationFilter(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <div className="relative flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-600">Loading partner listings...</p>
        </div>
      </div>
    );
  }

  const { category, providers = [] } = data || {};

  if (error || providers.length === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary-200/40 via-blue-200/30 to-indigo-200/20 blur-3xl animate-pulse" />
          <div
            className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-purple-200/30 via-pink-200/20 to-rose-200/10 blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
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

            <div className="rounded-2xl border border-white/60 bg-white/90 p-12 text-center shadow-xl backdrop-blur-2xl">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-blue-500 text-white shadow-lg">
                <Sparkles className="h-10 w-10" />
              </div>
              <h2 className="mt-6 font-display text-3xl font-bold text-slate-950">No partners available</h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-600">
                {error ||
                  `No partner listings are available for ${decodedServiceName} yet. Please check back later or explore another service category.`}
              </p>
              <Button onClick={() => navigate("/services")} className="mt-8">
                Explore Services
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

      <div className="relative px-4 pt-4 sm:px-6 sm:pt-6">
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
                Service Partner Directory
              </span>
              <div className="h-3 w-px bg-slate-300" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-600">
                Verified Partner Access
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-5 text-3xl font-display font-extrabold leading-[0.92] tracking-[-0.04em] text-slate-950 sm:text-4xl md:text-5xl lg:text-6xl"
            >
              {displayServiceName}
              <br />
              <span className="relative inline-block bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Trusted Partner Options
                <div className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-primary-500 via-blue-500 to-indigo-500 opacity-90" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mx-auto mb-8 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg md:text-[1.15rem] md:leading-8"
            >
              Review verified partners for this service, compare available packages, and proceed with greater
              clarity and confidence.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="mt-6 grid grid-cols-2 items-stretch gap-3 sm:mt-8 sm:gap-4 md:grid-cols-4"
          >
            {[
              { value: providers.length, label: "Verified Partners", icon: Users },
              {
                value: canShowPrices ? (startingFrom ? `INR ${startingFrom.toLocaleString()}` : "Custom") : "Login",
                label: canShowPrices ? "Starting From" : "Pricing Access",
                icon: TrendingUp,
              },
              { value: category?.name || displayServiceName, label: "Service Category", icon: Globe },
              { value: "4.9/5", label: "Average Rating", icon: Star },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                className="group relative flex"
              >
                <div
                  className={`absolute inset-0 rounded-xl opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:blur-2xl ${statCardThemes[index].glow}`}
                />
                <div
                  className={`relative flex min-h-[150px] w-full flex-col items-center justify-center rounded-2xl border p-4 text-center shadow-lg shadow-slate-200/20 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl ${statCardThemes[index].border}`}
                >
                  <div className={`absolute inset-0 rounded-2xl ${statCardThemes[index].background}`} />
                  <div
                    className={`relative mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110 ${statCardThemes[index].icon}`}
                  >
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="relative mb-1 text-2xl font-display font-extrabold text-slate-900 sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="relative flex min-h-[2.5rem] items-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative px-4 py-8 sm:px-6 sm:py-10 md:py-12">
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
              <span className="text-xs font-bold tracking-[0.18em] text-emerald-700">AVAILABLE PARTNERS</span>
            </div>
            <h2 className="mb-4 text-2xl font-display font-extrabold leading-tight tracking-[-0.03em] text-slate-900 sm:text-3xl md:text-4xl">
              Compare available{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                partner options
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600">
              Review partner profiles, compare service offerings, and choose the right fit for your event.
            </p>
          </motion.div>

          {/* Location Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mb-8"
          >
            <div className="rounded-2xl border border-sky-100/60 bg-gradient-to-r from-sky-50/80 via-blue-50/60 to-cyan-50/70 p-4 shadow-lg backdrop-blur-xl sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Location-Based Partner Search</h3>
                    <p className="text-xs text-slate-600">
                      {userLocation.lat && userLocation.lon
                        ? `Showing partners within 10km of your location`
                        : "Find verified partners near you within 10km"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!showLocationFilter ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowLocationFilter(true)}
                      className="gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="hidden sm:inline">Set Location</span>
                    </Button>
                  ) : (
                    <>
                      <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 sm:flex-initial">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Address (optional)"
                          value={userAddress}
                          onChange={(e) => setUserAddress(e.target.value)}
                          className="border-none bg-transparent px-2 py-1 text-sm outline-none focus:ring-0"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="any"
                          min="-90"
                          max="90"
                          placeholder="Latitude"
                          value={userLocation.lat}
                          onChange={(e) => setUserLocation(prev => ({ ...prev, lat: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:w-24"
                        />
                        <input
                          type="number"
                          step="any"
                          min="-180"
                          max="180"
                          placeholder="Longitude"
                          value={userLocation.lon}
                          onChange={(e) => setUserLocation(prev => ({ ...prev, lon: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:w-24"
                        />
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleUseMyLocation}
                        disabled={isLocating}
                        className="gap-1"
                      >
                        {isLocating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LocateFixed className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline">{isLocating ? "Locating..." : "Find my location"}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleApplyLocationFilter}
                      >
                        Apply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearLocationFilter}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {userLocation.lat && userLocation.lon && (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-800">
                      Location set: {userLocation.lat}, {userLocation.lon}
                      {userAddress && ` (${userAddress})`}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700">
                    Filtering within 10km radius
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProviders.map((item, index) => {
              const provider = item.provider;
              const services = item.services || [];
              const validPrices = services
                .map((service) => Number(service.startingPrice) || 0)
                .filter((price) => price > 0);
              const minPrice = validPrices.length ? Math.min(...validPrices) : null;
              const previewImages = getProviderGalleryImages(services);
              const providerRatingCount = Number(provider.ratingCount || 0);
              const providerRatingLabel =
                providerRatingCount > 0 ? Number(provider.rating || 0).toFixed(1) : "New";
              // Get distance from the filtered provider (added by filterProvidersByDistance)
              const distance = item.distance;

              return (
                <motion.div
                  key={provider._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500/10 via-transparent to-blue-500/10 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:blur-2xl" />
                  <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-lg shadow-slate-200/30 transition-all duration-500 hover:-translate-y-1 hover:border-primary-200/60 hover:shadow-2xl hover:shadow-primary-200/40">
                    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 sm:p-6">
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-bl from-primary-400 to-transparent blur-2xl" />
                        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-tr from-blue-400 to-transparent blur-2xl" />
                      </div>

                      <div className="relative flex items-start gap-4">
                        {provider.avatar ? (
                          <img
                            src={provider.avatar}
                            alt={provider.businessName || provider.name}
                            className="h-16 w-16 rounded-2xl border-2 border-white/20 object-cover shadow-xl"
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
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/20 px-3 py-1 text-amber-200">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              {providerRatingLabel}
                              {providerRatingCount ? ` (${providerRatingCount})` : ""}
                            </span>
                            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white/80">
                              {provider.experience || 0} yrs exp
                            </span>
                          </div>
                          {(services[0]?.location?.address || provider.address) ? (
                            <p className="mt-3 flex items-center gap-2 text-sm text-white/70">
                              <MapPin className="h-4 w-4" />
                              {services[0]?.location?.address || provider.address}
                            </p>
                          ) : null}
                          {distance !== null && distance !== undefined ? (
                            <p className="mt-1 flex items-center gap-2 text-xs text-sky-200">
                              <Navigation className="h-3.5 w-3.5" />
                              {formatDistance(distance)}
                            </p>
                          ) : userLocation.lat && userLocation.lon ? (
                            <p className="mt-1 flex items-center gap-2 text-xs text-amber-200">
                              <MapPin className="h-3.5 w-3.5" />
                              Distance unavailable
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:p-6">
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

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
                              {services.length} service{services.length === 1 ? "" : "s"}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                              {providerRatingCount
                                ? `${providerRatingCount} review${providerRatingCount === 1 ? "" : "s"}`
                                : "New listing"}
                            </span>
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
                          className="group/btn relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/40"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-blue-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
                          <span className="relative">View Services</span>
                          <ChevronRight className="relative h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty state when no partners are available within 10km */}
          {filteredProviders.length === 0 && userLocation.lat && userLocation.lon && providers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-amber-100 bg-amber-50 p-8 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <MapPin className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-amber-900">No partners available within 10km</h3>
              <p className="mb-4 text-sm text-amber-700">
                There are no verified partners within 10km of your location. Try expanding your search area or clearing the location filter to view all available partners.
              </p>
              <Button variant="secondary" onClick={handleClearLocationFilter}>
                Clear Location Filter
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
