import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Lock,
  MapPin,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  Trash2,
  Globe,
  Users,
  Zap,
  Award,
  Heart,
  Shield,
  Clock,
  CreditCard,
  XCircle,
  X,
} from "lucide-react";
import { publicApi, customerApi } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/common/Button";
import { Footer } from "../../components/common/Footer";
import { Modal } from "../../components/common/Modal";
import { formatCurrency } from "../../utils/currency";

function getServiceInitials(name) {
  return (name || "SV")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getFirstInitial(name) {
  return (name || "P").charAt(0).toUpperCase();
}

function getProviderColor(name) {
  const colors = [
    "from-blue-500 to-blue-600",
    "from-cyan-500 to-cyan-600",
    "from-violet-500 to-violet-600",
    "from-rose-500 to-rose-600",
    "from-amber-500 to-amber-600",
    "from-sky-500 to-sky-600",
    "from-pink-500 to-pink-600",
    "from-indigo-500 to-indigo-600",
  ];
  const index = (name || "P").charCodeAt(0) % colors.length;
  return colors[index];
}

function getServicePreviewImages(service) {
  console.log("getServicePreviewImages called with service:", service?.name, "images:", service?.images);
  if (service?.images?.length) {
    return service.images.slice(0, 5);
  }

  return service?.image ? [service.image] : [];
}

export function CustomerProviderServicesPage() {
  const { providerId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { cart, provider: cartProvider, addToCart, removeFromCart, isInCart, clearCart } =
    useCart();

  const canShowPrices = isAuthenticated && user?.role === "customer";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [isPendingProvider, setIsPendingProvider] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedServiceId, setSelectedServiceId] = useState(searchParams.get("service") || "");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSelection, setBookingSelection] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [bookingData, setBookingData] = useState({
    eventDate: "",
    eventTime: "",
    eventLocation: "",
    guestCount: "1",
    notes: "",
  });
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (serviceId, imageIndex) => {
    setImageErrors(prev => ({
      ...prev,
      [`${serviceId}-${imageIndex}`]: true
    }));
  };

  const isImageFailed = (serviceId, imageIndex) => {
    return imageErrors[`${serviceId}-${imageIndex}`];
  };

  const handleImageLoadWithRetry = (e, retryCount = 0) => {
    const maxRetries = 2;
    if (e.target.naturalWidth === 0 && retryCount < maxRetries) {
      setTimeout(() => {
        const img = e.target;
        img.src = img.src;
      }, 1000 * (retryCount + 1));
    }
  };

  useEffect(() => {
    let timer;
    if (showSuccessModal) {
      timer = setTimeout(() => {
        setShowSuccessModal(false);
        setSuccessMessage("");
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showSuccessModal]);

  useEffect(() => {
    let timer;
    if (showErrorModal) {
      timer = setTimeout(() => {
        setShowErrorModal(false);
        setErrorMessage("");
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [showErrorModal]);

  useEffect(() => {
    const fetchProviderServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("providerId from useParams:", providerId);
        
        if (!providerId || providerId === 'undefined' || providerId === 'null') {
          setError("Provider ID is missing or invalid");
          setLoading(false);
          return;
        }
        
        const response = await publicApi.getProviderServices(providerId);
        
        console.log("API response:", response);
        console.log("Services with images:", response.data?.data?.services?.map(s => ({ _id: s._id, name: s.name, images: s.images })));
        
        if (!response.data?.data) {
          setError("No provider data received");
          setLoading(false);
          return;
        }
        
        setData(response.data.data);
        console.log("Data set, services:", response.data.data?.services?.map(s => ({ _id: s._id, images: s.images })));
      } catch (requestError) {
        console.error("Error fetching provider services:", requestError);
        const errorData = requestError.response?.data;
        if (errorData?.providerStatus === "pending") {
          setIsPendingProvider(true);
          setError("This provider is pending admin approval and not yet available for bookings.");
        } else {
          setError(
            errorData?.message || "Failed to load provider services"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProviderServices();
  }, [providerId]);

  const redirectToLogin = () => {
    navigate("/login", { state: { from: `/provider/${providerId}` } });
  };

  const handleServiceToggle = (service) => {
    if (!canShowPrices) {
      redirectToLogin();
      return;
    }

    if (isInCart(service._id)) {
      removeFromCart(service._id);
      return;
    }

    addToCart(service, data.provider);
  };

  const { provider, services = [] } = data || {};
  const hasCategoryInUrl = Boolean(searchParams.get("category") || searchParams.get("service"));
  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Map(
          services
            .filter((service) => service.category?._id)
            .map((service) => [service.category._id, service.category])
        ).values()
      ),
    [services]
  );
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesServiceId = !selectedServiceId || service._id === selectedServiceId;
      const matchesCategory = !selectedCategory || service.category?._id === selectedCategory;

      return matchesServiceId && matchesCategory;
    });
  }, [selectedCategory, selectedServiceId, services]);
  const displayService =
    filteredServices.find((service) => service._id === selectedServiceId) ||
    filteredServices[0] ||
    null;
  const displayServiceImages = displayService ? getServicePreviewImages(displayService) : [];
  const sameProviderCart = !cartProvider || cartProvider._id === provider?._id;
  const currentCart = sameProviderCart ? cart : [];
  const hasForeignCart = cart.length > 0 && !sameProviderCart;
  const normalizedGuestCount = Math.max(Number(bookingData.guestCount) || 1, 1);
  const cartTotal = currentCart.reduce((total, item) => {
    if (item.allowsMembers && item.pricePerMember && bookingData.guestCount) {
      const members = normalizedGuestCount;
      if (members <= 1) {
        return total + (item.startingPrice || 0);
      }
      // For 2+ members: base price + (pricePerMember × (members - 1))
      return total + (item.startingPrice || 0) + (item.pricePerMember * (members - 1));
    }
    return total + (item.startingPrice || 0);
  }, 0);
  
  const bookingTotal = bookingSelection.reduce((total, item) => {
    if (item.allowsMembers && item.pricePerMember && bookingData.guestCount) {
      const members = normalizedGuestCount;
      if (members <= 1) {
        return total + (item.startingPrice || 0);
      }
      // For 2+ members: base price + (pricePerMember × (members - 1))
      return total + (item.startingPrice || 0) + (item.pricePerMember * (members - 1));
    }
    return total + (item.startingPrice || 0);
  }, 0);
  const providerName = provider?.businessName || provider?.name || "Provider";
  const providerCategoryLabel =
    provider?.serviceCategory?.name || categoryOptions[0]?.name || "Event services";
  const providerRatingCount = Number(provider?.ratingCount || 0);
  const providerRatingValue = Number(provider?.rating || 0);
  const providerRatingLabel = providerRatingCount > 0 ? providerRatingValue.toFixed(1) : "New";
  const selectedService = services.find((service) => service._id === selectedServiceId);
  const selectedCategoryLabel =
    categoryOptions.find((category) => category._id === selectedCategory)?.name || "";
  const visiblePricePoints = services
    .map((service) => Number(service.startingPrice))
    .filter((price) => Number.isFinite(price) && price >= 0);
  const lowestPrice = visiblePricePoints.length > 0 ? Math.min(...visiblePricePoints) : null;
  const activeFocusLabel =
    selectedService?.name || selectedCategoryLabel || providerCategoryLabel;
  const heroStats = [
    {
      label: "Services",
      value: String(services.length),
      icon: Package,
      iconClassName: "bg-primary-100 text-primary-700",
    },
    {
      label: "Categories",
      value: String(categoryOptions.length),
      icon: Sparkles,
      iconClassName: "bg-blue-100 text-blue-700",
    },
    {
      label: canShowPrices ? "Starts From" : "Pricing",
      value:
        canShowPrices && lowestPrice !== null
          ? formatCurrency(lowestPrice)
          : canShowPrices
            ? "Custom"
            : "Login",
      icon: TrendingUp,
      iconClassName: "bg-amber-100 text-amber-700",
    },
    {
      label: "Rating",
      value: providerRatingCount > 0 ? providerRatingLabel : "New",
      icon: Star,
      iconClassName: "bg-yellow-100 text-yellow-700",
      subLabel: providerRatingCount > 0 ? `${providerRatingCount} reviews` : "No reviews",
    },
  ];
  const bookingHasMemberPricing = bookingSelection.some(
    (item) => item.allowsMembers && Number(item.pricePerMember) > 0
  );

  useEffect(() => {
    setActiveImageIndex(0);
  }, [displayService?._id]);

  const handleBookNow = (selectedServices = currentCart) => {
    if (!canShowPrices) {
      redirectToLogin();
      return;
    }

    if (!selectedServices.length) {
      return;
    }

    setBookingSelection(selectedServices);
    setBookingData((previous) => ({
      ...previous,
      guestCount: selectedServices.some(
        (item) => item.allowsMembers && Number(item.pricePerMember) > 0
      )
        ? previous.guestCount || "1"
        : "1",
    }));
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    try {
      setBookingLoading(true);

      const response = await customerApi.createBooking({
        serviceIds: bookingSelection.map((item) => item._id),
        eventDate: bookingData.eventDate,
        eventTime: bookingData.eventTime,
        location: bookingData.eventLocation,
        guestCount: bookingHasMemberPricing ? normalizedGuestCount : 1,
        notes: bookingData.notes,
      });

      const bookedCurrentCart =
        currentCart.length > 0 &&
        bookingSelection.length === currentCart.length &&
        bookingSelection.every((selectedItem) =>
          currentCart.some((cartItem) => cartItem._id === selectedItem._id)
        );

      if (bookedCurrentCart) {
        clearCart();
      }

      setSuccessMessage(response.data?.message || "Booking created successfully!");
      setShowSuccessModal(true);
      setShowBookingModal(false);
      setBookingSelection([]);
      setBookingData({
        eventDate: "",
        eventTime: "",
        eventLocation: "",
        guestCount: "1",
        notes: "",
      });
      setBookingSelection([]);
      setBookingData({
        eventDate: "",
        eventTime: "",
        eventLocation: "",
        guestCount: "1",
        notes: "",
      });
      setTimeout(() => {
        navigate("/customer/profile?tab=bookings");
      }, 2500);
    } catch (requestError) {
      setErrorMessage(requestError.response?.data?.message || "Failed to create booking");
      setShowErrorModal(true);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
        <div className="relative flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
          <p className="text-sm text-slate-600 font-medium">Loading provider services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-200">
            {isPendingProvider ? (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
                <p className="mb-2 text-lg font-semibold text-amber-700">Provider Pending Approval</p>
              </>
            ) : (
              <>
                <p className="mb-4 text-red-500">{error}</p>
              </>
            )}
            <p className="mb-6 text-sm text-slate-600">{error}</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
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

      <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-6 sm:px-6 lg:px-8 sm:pb-6">
        <div className="mx-auto mb-4 max-w-5xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/85 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-lg shadow-slate-200/20 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
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
                <span className="text-xs font-bold text-slate-700 tracking-widest uppercase">✨ Premium Provider Services</span>
                <div className="h-3 w-px bg-slate-300" />
                <span className="text-[10px] font-semibold text-primary-600">NEW</span>
              </motion.div>

              {/* Provider Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col md:flex-row items-center gap-6 mb-6"
              >
                <div className="relative">
                  {provider?.avatar ? (
                    <img
                      src={provider.avatar}
                      alt={providerName}
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const next = e.target.nextSibling;
                        if (next) next.style.display = 'flex';
                      }}
                      className="h-32 w-32 rounded-2xl border-4 border-white/20 object-cover shadow-xl"
                    />
                  ) : (
                    <div
                      className={`flex h-32 w-32 items-center justify-center rounded-2xl border-4 border-white/20 bg-gradient-to-br ${getProviderColor(providerName)} text-5xl font-bold text-white shadow-xl`}
                    >
                      {getFirstInitial(providerName)}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-blue-400 shadow-lg">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900">{providerName}</h2>
                  <p className="text-slate-600 mt-1">{providerCategoryLabel}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-900">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      {providerRatingCount > 0 ? `${providerRatingLabel} rating` : "New Provider"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300/30 bg-slate-200/50 px-3 py-1 text-xs font-medium text-slate-800">
                      <TrendingUp className="h-3.5 w-3.5 text-slate-600" />
                      {provider?.experience || 0}+ years
                    </span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              >
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 text-center">{services.length}</p>
                  <p className="text-xs font-medium text-slate-500 text-center mt-1">Services</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 text-center">{categoryOptions.length}</p>
                  <p className="text-xs font-medium text-slate-500 text-center mt-1">Categories</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 text-center">
                    {providerRatingCount > 0 ? providerRatingLabel : "New"}
                  </p>
                  <p className="text-xs font-medium text-slate-500 text-center mt-1">Rating</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 text-center">{providerRatingCount}</p>
                  <p className="text-xs font-medium text-slate-500 text-center mt-1">Reviews</p>
                </div>
              </motion.div>

              {/* CTA Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className={`inline-flex max-w-xl flex-wrap items-center gap-2 rounded-2xl border px-5 py-3 text-sm backdrop-blur-md ${
                  canShowPrices
                    ? "border-emerald-300/30 bg-emerald-100/80 text-emerald-900"
                    : "border-slate-300/30 bg-slate-200/80 text-slate-800"
                }`}
              >
                {canShowPrices ? (
                  <>
                    <ShoppingCart className="h-4 w-4 text-emerald-600" />
                    Pricing unlocked. Compare rates, shortlist services, and move straight to booking.
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-slate-500" />
                    Login as customer to unlock service pricing and instant booking.
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Service Details Section */}
        <section className="relative py-8 sm:py-10 md:py-12 px-2 sm:px-6">
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
                <span className="text-xs font-bold text-emerald-700 tracking-wide">SERVICE DETAILS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-slate-900 mb-4 leading-tight">
                {displayService ? displayService.name : "Available Services"}
              </h2>
              <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Explore this provider's service like a product detail page, review recent work photos, and book with full context.
              </p>
            </motion.div>

            {/* Filter Section */}
            {!hasCategoryInUrl && categoryOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-8"
              >
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-slate-200">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-700">
                          Refine Results
                        </p>
                        <h2 className="mt-2 font-display text-2xl font-bold text-slate-950">
                          Filter services by category
                        </h2>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                        <Package className="h-4 w-4 text-blue-300" />
                        {filteredServices.length} visible service{filteredServices.length === 1 ? "" : "s"}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[1fr_240px]">
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4">
                        <Sparkles className="h-4 w-4 text-slate-400" />
                        <select
                          value={selectedCategory}
                          onChange={(event) => setSelectedCategory(event.target.value)}
                          className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none"
                        >
                          <option value="">All service categories</option>
                          {categoryOptions.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {selectedCategoryLabel && (
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                          Category: {selectedCategoryLabel}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {filteredServices.length === 0 || !displayService ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-200">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="font-semibold text-slate-900">No services match this filter.</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Try changing the category filter to see more services.
                  </p>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Service Selection */}
                {filteredServices.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                  >
                    <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">
                        Choose Service
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {filteredServices.map((service) => (
                          <button
                            key={service._id}
                            type="button"
                            onClick={() => setSelectedServiceId(service._id)}
                            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                              displayService._id === service._id
                                ? "border-primary-300 bg-primary-50 text-primary-700"
                                : "border-slate-200 bg-white text-slate-600 hover:border-primary-200 hover:text-primary-700"
                            }`}
                          >
                            {service.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Service Details */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    {/* Main Image */}
                    {displayServiceImages.length > 0 ? (
                      <div className="overflow-hidden">
                        <img
                          src={displayServiceImages[activeImageIndex] || displayServiceImages[0]}
                          alt={displayService.name}
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const next = e.target.nextSibling;
                            if (next) next.style.display = 'flex';
                          }}
                          className="h-[280px] w-full object-cover sm:h-[360px] lg:h-[420px]"
                        />
                        <div className="hidden h-[280px] items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 font-display text-6xl font-semibold text-primary-700 sm:h-[360px] lg:h-[420px]">
                          {getServiceInitials(displayService.name)}
                        </div>
                      </div>
                    ) : displayService.image ? (
                      <div className="overflow-hidden">
                        <img
                          src={displayService.image}
                          alt={displayService.name}
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const next = e.target.nextSibling;
                            if (next) next.style.display = 'flex';
                          }}
                          className="h-[280px] w-full object-cover sm:h-[360px] lg:h-[420px]"
                        />
                        <div className="hidden h-[280px] items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 font-display text-6xl font-semibold text-primary-700 sm:h-[360px] lg:h-[420px]">
                          {getServiceInitials(displayService.name)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-[280px] items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 font-display text-6xl font-semibold text-primary-700 sm:h-[360px] lg:h-[420px]">
                        {getServiceInitials(displayService.name)}
                      </div>
                    )}

                    {/* Image Thumbnails Row */}
                    {displayServiceImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto bg-slate-50 p-3">
                        {displayServiceImages.map((image, imageIndex) => (
                          <button
                            key={`${displayService._id}-${imageIndex}`}
                            type="button"
                            onClick={() => setActiveImageIndex(imageIndex)}
                            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                              activeImageIndex === imageIndex
                                ? "border-primary-500 shadow-md shadow-primary-200/60"
                                : "border-slate-200 hover:border-primary-200"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${displayService.name} thumbnail ${imageIndex + 1}`}
                              loading="lazy"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const fallback = e.target.parentElement.querySelector('.initials');
                                if (fallback) fallback.style.display = 'flex';
                              }}
                              className="h-full w-full object-cover"
                            />
                            <div className="initials hidden h-full w-full items-center justify-center bg-primary-100 text-xs font-bold text-primary-700">
                              {imageIndex + 1}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="p-6">
                      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                        <div className="space-y-6">
                          <div className="flex flex-wrap items-center gap-2">
                            {displayService.category?.name ? (
                              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
                                {displayService.category.name}
                              </span>
                            ) : null}
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {displayServiceImages.length || 1} gallery photo{(displayServiceImages.length || 1) === 1 ? "" : "s"}
                            </span>
                          </div>
                          <h3 className="font-display text-3xl font-semibold leading-tight text-slate-950">
                            {displayService.name}
                          </h3>
                          {displayService.description ? (
                            <div className="mt-3">
                              <p
                                className={`text-sm leading-7 text-slate-600 ${
                                  !descriptionExpanded ? "line-clamp-3 sm:line-clamp-none" : ""
                                }`}
                              >
                                {displayService.description}
                              </p>
                              {displayService.description.length > 150 && (
                                <button
                                  type="button"
                                  onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                                  className="mt-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors sm:hidden"
                                >
                                  {descriptionExpanded ? "Show less" : "Show more"}
                                </button>
                              )}
                            </div>
                          ) : null}
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                              {canShowPrices ? "Starting Price" : "Access"}
                            </p>
                            {canShowPrices ? (
                              <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-slate-950">
                                {formatCurrency(displayService.startingPrice)}
                              </p>
                            ) : (
                              <p className="mt-2 text-sm font-semibold text-slate-600">
                                Login to view pricing
                              </p>
                            )}
                            {canShowPrices && displayService.allowsMembers && displayService.pricePerMember ? (
                              <p className="mt-2 text-sm text-amber-700">
                                + {formatCurrency(displayService.pricePerMember)} per extra member
                              </p>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                              <Sparkles className="h-3.5 w-3.5" />
                              Real work photos
                            </span>
                            {displayService.allowsMembers ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                <Users className="h-3.5 w-3.5" />
                                Group-friendly pricing
                              </span>
                            ) : null}
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                              <Shield className="h-3.5 w-3.5" />
                              Provider-ready package
                            </span>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-blue-600">
                                <Sparkles className="h-4 w-4 text-white" />
                              </div>
                              <p className="text-sm font-semibold text-slate-900">What you can review</p>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-start gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                <p className="text-sm text-slate-600">Service photos to judge actual work quality before booking.</p>
                              </div>
                              <div className="flex items-start gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                <p className="text-sm text-slate-600">Package pricing, category, and extra-member cost if enabled.</p>
                              </div>
                              <div className="flex items-start gap-2.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                <p className="text-sm text-slate-600">Quick actions to book now or shortlist in your cart.</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 pt-2">
                            <button
                              onClick={() => handleBookNow([displayService])}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-500/40 active:scale-95"
                            >
                              <Calendar className="h-4 w-4" />
                              Book Now
                            </button>
                            <button
                              onClick={() => handleServiceToggle(displayService)}
                              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 px-5 py-4 text-sm font-semibold transition-all active:scale-95 ${
                                canShowPrices && isInCart(displayService._id)
                                  ? "border-red-300 bg-red-50 text-red-600 hover:-translate-y-0.5 hover:bg-red-100 hover:shadow-md"
                                  : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
                              }`}
                            >
                              {canShowPrices && isInCart(displayService._id) ? (
                                <>
                                  <Trash2 className="h-4 w-4" />
                                  Remove
                                </>
                              ) : (
                                <>
                                  {canShowPrices ? <ShoppingCart className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                  {canShowPrices ? "Add to Cart" : "Login to Book"}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Booking Modal */}
      {showBookingModal ? (
        <div className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(241,245,249,0.9)_45%,rgba(226,232,240,0.84)_100%)] p-3 pt-4 pb-24 backdrop-blur-md sm:items-center sm:p-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[30px] border border-white/80 bg-white/95 shadow-[0_24px_70px_rgba(148,163,184,0.24)]"
          >
            <div className="rounded-t-[30px] border-b border-slate-100 bg-gradient-to-r from-primary-50 via-white to-blue-50 px-5 py-5 sm:px-7">
              <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">Confirm Your Booking</h3>
              <p className="mt-1 text-sm text-slate-600">
                {bookingSelection.length} service{bookingSelection.length !== 1 ? "s" : ""}
              </p>
              <p className="mt-1 text-sm text-primary-700">{providerName}</p>
            </div>

            <div className="space-y-5 p-6 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.eventDate}
                    onChange={(event) =>
                      setBookingData({ ...bookingData, eventDate: event.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Event Time
                  </label>
                  <input
                    type="time"
                    value={bookingData.eventTime}
                    onChange={(event) =>
                      setBookingData({ ...bookingData, eventTime: event.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
                  />
                </div>
              </div>

              {bookingHasMemberPricing ? (
                <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
                  <label className="mb-1.5 block text-sm font-semibold text-amber-900">
                    Member/Guest Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bookingData.guestCount}
                    onChange={(event) =>
                      setBookingData({ ...bookingData, guestCount: event.target.value })
                    }
                    className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                  />
                  <p className="mt-2 text-xs font-medium text-amber-700">
                    This appears only when the provider enabled extra-member pricing.
                  </p>
                </div>
              ) : null}

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Event Location *
                </label>
                <input
                  type="text"
                  value={bookingData.eventLocation}
                  onChange={(event) =>
                    setBookingData({ ...bookingData, eventLocation: event.target.value })
                  }
                  placeholder="Enter event location"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Additional Notes
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(event) =>
                    setBookingData({ ...bookingData, notes: event.target.value })
                  }
                  placeholder="Any special requirements..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
                  rows={3}
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Selected Services
                </h4>
                {bookingSelection.map((item) => (
                  <div key={item._id} className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm first:mt-4">
                    <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="block truncate font-semibold text-slate-900">{item.name}</span>
                      {item.category?.name ? (
                        <p className="mt-1 text-xs font-medium text-primary-700">{item.category.name}</p>
                      ) : null}
                      {item.allowsMembers && item.pricePerMember && bookingData.guestCount ? (
                        <p className="mt-2 text-xs text-amber-700">
                          Base: {formatCurrency(item.startingPrice)} + {formatCurrency(item.pricePerMember)} × {Number(bookingData.guestCount) - 1} extra
                        </p>
                      ) : null}
                    </div>
                    <span className="font-medium">
                      {item.allowsMembers && item.pricePerMember && bookingData.guestCount
                        ? (() => {
                            const members = normalizedGuestCount;
                            if (members <= 1) return formatCurrency(item.startingPrice);
                            return formatCurrency(item.startingPrice + item.pricePerMember * (members - 1));
                          })()
                        : formatCurrency(item.startingPrice)}
                    </span>
                  </div>
                  </div>
                ))}
                <div className="mt-4 rounded-2xl border border-primary-100 bg-primary-50 px-4 py-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Estimated Total</span>
                    <span className="font-display text-2xl font-semibold text-primary-700">
                      {formatCurrency(bookingTotal)}
                    </span>
                  </div>
                  {bookingHasMemberPricing ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Total updates only for services where the provider enabled extra-member pricing.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/80 px-6 py-5 sm:flex-row sm:px-7">
              <Button
                variant="secondary"
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-3"
              >
                Cancel
              </Button>
              <button
                onClick={handleConfirmBooking}
                disabled={
                  bookingLoading || !bookingData.eventDate || !bookingData.eventLocation
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
              >
                {bookingLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Confirm Booking
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}

      {/* Success Modal - Inline notification */}
      {showSuccessModal && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-4 shadow-xl"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-white">Booking Confirmed!</p>
            <p className="text-sm text-white/80">{successMessage}</p>
          </div>
          <button onClick={() => { setShowSuccessModal(false); setSuccessMessage(""); }} className="shrink-0 rounded-full bg-white/20 p-2 text-white hover:bg-white/30">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Error Modal - Inline notification */}
      {showErrorModal && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-rose-600 px-4 py-4 shadow-xl"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
            <XCircle className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-white">Booking Failed</p>
            <p className="text-sm text-white/80">{errorMessage}</p>
          </div>
          <button onClick={() => { setShowErrorModal(false); setErrorMessage(""); }} className="shrink-0 rounded-full bg-white/20 p-2 text-white hover:bg-white/30">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      <Footer />
    </div>
  );
}
