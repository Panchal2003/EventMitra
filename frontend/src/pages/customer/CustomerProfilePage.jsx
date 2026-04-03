import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CalendarCheck2,
  CheckCircle2,
  Headphones,
  HelpCircle,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  XCircle,
  Zap,
  Shield,
  Heart,
  Edit3,
  Camera,
  Clock,
  Star,
  Award,
  BadgeCheck,
  ChevronRight,
  ExternalLink,
  BookOpen,
  MessageSquare,
  PhoneCall,
  Video,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock4,
  Users,
  Globe,
  Lock,
  Search,
  Calendar,
  Clock3,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { GlassCard } from "../../components/admin/GlassCard";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { authApi } from "../../services/api";
import { AvatarCropModal } from "../../components/customer/AvatarCropModal";
import { CustomerDashboardPage } from "./CustomerDashboardPage";
import { CustomerBookingsPage } from "./CustomerBookingsPage";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: CalendarCheck2 },
  { id: "account", label: "Profile", icon: User },
  { id: "support", label: "Support", icon: Headphones },
];

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white/90 backdrop-blur-2xl px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 shadow-lg shadow-slate-200/20";

function getInitial(name) {
  return name?.charAt(0)?.toUpperCase() || "C";
}

export function CustomerProfilePage() {
  const { user, logout, updateUser, isBootstrapping } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    avatar: "",
  });
  const [saveState, setSaveState] = useState({
    saving: false,
    error: "",
    success: "",
  });
  const [cropSource, setCropSource] = useState("");
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSaving, setCropSaving] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    const validTab = tabs.find((tab) => tab.id === requestedTab)?.id || "dashboard";
    setActiveTab(validTab);
  }, [searchParams]);

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      avatar: user?.avatar || "",
    });
  }, [user]);

  // Show loading state while auth is bootstrapping
  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] bg-gradient-to-br from-primary-200/40 via-blue-200/30 to-indigo-200/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] bg-gradient-to-tr from-purple-200/30 via-pink-200/20 to-rose-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-white/50" />
        </div>
        <div className="relative flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
          <p className="text-sm text-slate-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  const profileAvatar = user?.avatar || "";
  const draftAvatar = formData.avatar || "";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    if (tabId === "dashboard") {
      setSearchParams({}, { replace: true });
      return;
    }

    setSearchParams({ tab: tabId }, { replace: true });
  };

  const syncFormWithUser = () => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      avatar: user?.avatar || "",
    });
  };

  const openEditModal = () => {
    syncFormWithUser();
    setSaveState({
      saving: false,
      error: "",
      success: "",
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    syncFormWithUser();
    setSaveState((previous) => ({
      ...previous,
      error: "",
    }));
    setEditModalOpen(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
    setSaveState((previous) => ({
      ...previous,
      error: "",
      success: "",
    }));
  };

  const handleAvatarFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropSource(String(reader.result || ""));
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleApplyCrop = async (croppedAvatar) => {
    setCropSaving(true);
    setFormData((previous) => ({
      ...previous,
      avatar: croppedAvatar,
    }));
    setCropSaving(false);
    setCropOpen(false);
    setCropSource("");
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    setSaveState({
      saving: true,
      error: "",
      success: "",
    });

    try {
      const response = await authApi.updateProfile(formData);
      if (response.data?.success) {
        updateUser(response.data.data);
        setSaveState({
          saving: false,
          error: "",
          success: response.data.message || "Profile updated successfully.",
        });
        setEditModalOpen(false);
      }
    } catch (requestError) {
      setSaveState({
        saving: false,
        error: requestError.response?.data?.message || "Unable to update profile right now.",
        success: "",
      });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden px-4 pb-24 pt-4">
        {/* Premium Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] bg-gradient-to-br from-primary-200/40 via-blue-200/30 to-indigo-200/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] bg-gradient-to-tr from-purple-200/30 via-pink-200/20 to-rose-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/4 left-1/4 h-32 w-32 bg-gradient-to-r from-emerald-200/30 to-teal-200/20 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '8s' }} />
          <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-white/50" />
        </div>

        <div className="relative mx-auto max-w-6xl space-y-5">
          {/* Tab Navigation - Responsive Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white/90 backdrop-blur-2xl p-2 shadow-xl border border-white/60"
          >
            {/* Mobile: Grid layout */}
            <div className="grid grid-cols-4 gap-2 sm:hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <motion.button
                    key={tab.id}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-sm font-bold transition-all ${
                      isActive
                        ? "bg-gradient-to-br from-primary-600 to-blue-600 text-white shadow-lg shadow-primary-500/20"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Desktop: Horizontal layout */}
            <div className="hidden sm:flex items-center gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <motion.button
                    key={tab.id}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all flex-1 justify-center ${
                      isActive
                        ? "bg-gradient-to-br from-primary-600 to-blue-600 text-white shadow-lg shadow-primary-500/20"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "dashboard" ? (
              <CustomerDashboardPage embedded onOpenTab={handleTabChange} />
            ) : null}

            {activeTab === "bookings" ? (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-primary-900 to-blue-900 shadow-2xl"
                >
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-gradient-to-bl from-primary-400 to-transparent blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gradient-to-tr from-blue-400 to-transparent blur-2xl" />
                  </div>
                  <div className="relative p-8">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 text-white shadow-xl">
                        <CalendarCheck2 className="h-8 w-8" />
                      </div>
                      <div>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-primary-400" />
                          <span className="text-xs font-bold tracking-wide text-white">MY BOOKINGS</span>
                        </div>
                        <h2 className="text-3xl font-black text-white">Your Bookings</h2>
                        <p className="mt-2 text-primary-100">
                          Clean booking cards, OTP updates, and provider status in one shared view.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <CustomerBookingsPage embedded />
              </div>
            ) : null}

            {activeTab === "__legacy-bookings" ? (
              <div className="space-y-6">
                {/* Bookings Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-primary-900 to-blue-900 border border-white/10 shadow-2xl"
                >
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary-400 to-transparent rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-400 to-transparent rounded-full blur-2xl" />
                  </div>
                  <div className="relative p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 text-white shadow-xl">
                          <CalendarCheck2 className="h-8 w-8" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                            <Sparkles className="h-3.5 w-3.5 text-primary-400" />
                            <span className="text-xs font-bold text-white tracking-wide">MY BOOKINGS</span>
                          </div>
                          <h2 className="text-3xl font-black text-white">Your Bookings</h2>
                          <p className="mt-2 text-primary-100">Track and manage all your service bookings</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                          <Calendar className="h-4 w-4 text-primary-400" />
                          <span className="text-sm font-bold text-white">{bookings.length} Total</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                          <Zap className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm font-bold text-white">
                            {bookings.filter((b) => ["confirmed", "in_progress", "otp_pending"].includes(b.status)).length} Active
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                          <CheckCircle className="h-4 w-4 text-blue-400" />
                          <span className="text-sm font-bold text-white">
                            {bookings.filter((b) => b.status === "completed").length} Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Search Bar */}
                {bookings.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by service, provider, or location..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white/90 backdrop-blur-2xl py-3 pl-12 pr-4 text-sm shadow-lg shadow-slate-200/20 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {bookingsError && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
                  >
                    <div className="flex items-center gap-3 text-amber-700">
                      <AlertCircle className="h-5 w-5" />
                      <p className="text-sm font-medium">{bookingsError}</p>
                    </div>
                  </motion.div>
                )}

                {/* Loading State */}
                {bookingsLoading ? (
                  <div className="flex min-h-[240px] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
                      <p className="text-sm text-slate-600 font-medium">Loading bookings...</p>
                    </div>
                  </div>
                ) : bookings.length === 0 ? (
                  /* Empty State */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100 shadow-xl shadow-slate-900/5">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 via-blue-500 to-indigo-600 shadow-2xl shadow-primary-500/30 mx-auto"
                      >
                        <CalendarCheck2 className="h-14 w-14 text-white" />
                      </motion.div>
                      <h2 className="mt-8 font-display text-2xl font-bold text-slate-900">
                        No Bookings Yet
                      </h2>
                      <p className="mt-3 max-w-md text-slate-500 leading-relaxed">
                        Explore providers, add services to cart, or book directly from a provider page to get started.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/services")}
                        className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 px-8 py-4 font-bold text-white shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 transition-all duration-300"
                      >
                        <Sparkles className="h-5 w-5" />
                        Explore Services
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  /* Bookings List */
	                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
	                    {filteredBookings.map((booking, index) => {
	                      const services = getBookingServices(booking);
	                      const primaryService = services[0];
                          const providerDisplayName = getProviderDisplayName(booking);
                          const memberBookingSummary = getMemberBookingSummary(booking, services);

	                      return (
                        <motion.div
                          key={booking._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-blue-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                          <div className="relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500">
                            {/* Booking Header */}
                            <div className="relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-blue-600 to-indigo-700" />
                              <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white to-transparent rounded-full blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white to-transparent rounded-full blur-3xl" />
                              </div>
                              <div className="relative px-5 py-5 sm:px-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="flex gap-3 sm:gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl text-white shadow-lg shadow-primary-500/20 sm:h-16 sm:w-16">
                                      <Sparkles className="h-7 w-7 sm:h-8 sm:w-8" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-display text-lg font-black text-white sm:text-xl">
                                          {primaryService?.name || "Service Booking"}
                                        </h3>
                                        {services.length > 1 && (
                                          <span className="rounded-full bg-white/20 backdrop-blur-xl px-2.5 py-1 text-xs font-bold text-white">
                                            +{services.length - 1} more service{services.length - 1 !== 1 ? "s" : ""}
                                          </span>
                                        )}
                                      </div>
                                      
                                      <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span
                                          className={`rounded-full px-3 py-1 text-xs font-bold backdrop-blur-xl ${statusColors[booking.status] || "bg-white/20 text-white"}`}
                                        >
                                          {statusLabels[booking.status] || booking.status}
                                        </span>
	                                        {booking.provider && (
	                                          <span className="flex items-center gap-1 text-xs text-white/80 font-medium">
	                                            <User className="h-3 w-3" />
	                                            {providerDisplayName}
	                                          </span>
	                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    {booking.provider?._id && (
                                      <Link
                                        to={`/provider/${booking.provider._id}`}
                                        className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/30 hover:border-white/50"
                                      >
                                        View Provider
                                        <ArrowRight className="h-4 w-4" />
                                      </Link>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-xl px-3 py-1.5 font-medium text-white">
                                    <Clock3 className="h-3 w-3" />
                                    {formatDate(booking.eventDate)}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-xl px-3 py-1.5 font-medium text-white">
                                    <MapPin className="h-3 w-3" />
                                    {booking.location}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/30 backdrop-blur-xl px-3 py-1.5 font-bold text-white">
                                    <ShieldCheck className="h-3 w-3" />
                                    {formatCurrency(booking.totalAmount)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Booking Details */}
                            <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
	                              <div className="flex flex-wrap gap-2">
	                                <span className="rounded-full bg-gradient-to-r from-primary-50 to-blue-50 px-3 py-1.5 text-xs font-bold text-primary-700 ring-1 ring-primary-200/50">
	                                  {services.length} booked service{services.length !== 1 ? "s" : ""}
	                                </span>
	                                {primaryService?.category?.name && (
	                                  <span className="rounded-full bg-gradient-to-r from-violet-50 to-purple-50 px-3 py-1.5 text-xs font-bold text-violet-700 ring-1 ring-violet-200/50">
	                                    {primaryService.category.name}
	                                  </span>
	                                )}
	                              </div>

                              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Provider Name
                                  </p>
                                  <p className="mt-2 text-sm font-bold text-slate-900">
                                    {providerDisplayName}
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Event Date
                                  </p>
                                  <p className="mt-2 text-sm font-bold text-slate-900">
                                    {formatDate(booking.eventDate)}
                                  </p>
                                  {booking.eventTime ? (
                                    <p className="mt-1 text-xs font-medium text-slate-500">
                                      {booking.eventTime}
                                    </p>
                                  ) : null}
                                </div>

                                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Address
                                  </p>
                                  <p className="mt-2 text-sm font-bold leading-6 text-slate-900">
                                    {booking.location || "Address not provided"}
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-4">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                                    Total Amount
                                  </p>
                                  <p className="mt-2 text-sm font-bold text-emerald-800">
                                    {formatCurrency(booking.totalAmount)}
                                  </p>
                                </div>
                              </div>

                              <div className="rounded-2xl border border-primary-100/80 bg-gradient-to-br from-primary-50/90 to-blue-50/80 p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-700">
                                  Service Details
                                </p>
                                <div className="mt-3 space-y-2">
                                  {services.map((service) => (
                                    <div
                                      key={service?._id || service?.name}
                                      className="flex flex-col gap-2 rounded-xl border border-white/80 bg-white/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">
                                          {service?.name || "Service"}
                                        </p>
                                        {service?.category?.name ? (
                                          <p className="mt-1 text-xs font-medium text-primary-700">
                                            {service.category.name}
                                          </p>
                                        ) : null}
                                      </div>
                                      <p className="shrink-0 text-sm font-bold text-slate-900">
                                        {formatCurrency(service?.startingPrice || 0)}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {memberBookingSummary ? (
                                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    <Users className="mt-0.5 h-4 w-4 shrink-0" />
                                    <p>{memberBookingSummary}</p>
                                  </div>
                                ) : null}
                              </div>

	                              {/* Status-specific content */}
                              {booking.status === "provider_assigned" && (
                                <div className="rounded-2xl border border-violet-200/50 bg-gradient-to-br from-violet-50 to-purple-50 p-5 shadow-sm">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20">
                                      <Clock3 className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-violet-800">
                                        Booking request sent to provider
                                      </p>
                                      <p className="mt-1 text-sm text-violet-700">
                                        Your provider has received the booking request. Once the provider accepts and starts the work, the next status will appear here.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {booking.status === "confirmed" && (
                                <div className="rounded-2xl border border-primary-200/50 bg-gradient-to-br from-primary-50 to-blue-50 p-5 shadow-sm">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 text-white shadow-lg shadow-primary-500/20">
                                      <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-bold text-primary-800">
                                        Your booking has been accepted
                                      </p>
                                      {booking.bookingOtp ? (
                                        <>
                                          <p className="mt-1 text-sm text-primary-700">
                                            The provider has requested the start OTP. Please share this OTP with the provider so the work can begin.
                                          </p>
                                          <div className="mt-4 rounded-xl bg-white border border-primary-200/50 px-5 py-4 shadow-sm">
                                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">
                                              Start OTP
                                            </p>
                                            <p className="mt-2 font-mono text-3xl font-black text-primary-700 tracking-widest">
                                              {booking.bookingOtp}
                                            </p>
                                            <p className="mt-2 text-xs text-primary-600">
                                              Share this OTP with the provider. It will disappear after the provider verifies it.
                                            </p>
                                          </div>
                                        </>
                                      ) : (
                                        <p className="mt-1 text-sm text-primary-700">
                                          The provider has accepted your booking. The start OTP will appear here once the provider is ready to begin the work.
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {booking.status === "in_progress" && (
                                <div className="rounded-2xl border border-sky-200/50 bg-gradient-to-br from-sky-50 to-cyan-50 p-5 shadow-sm">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-lg shadow-sky-500/20">
                                      <Zap className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-sky-800">
                                        Work has started
                                      </p>
                                      <p className="mt-1 text-sm text-sky-700">
                                        Your arrival OTP has been verified by the provider. A final OTP and your feedback will be required at the time of completion.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {booking.status === "otp_pending" && (
                                <div className="rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
                                      <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-bold text-amber-800">
                                        Final step pending
                                      </p>
                                      <p className="mt-1 text-sm text-amber-700">
                                        Enter your OTP and share feedback to complete the booking.
                                      </p>
                                      {booking.completionOtpCode && (
                                        <div className="mt-4 rounded-xl bg-white border border-amber-200/50 px-5 py-4 shadow-sm">
                                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                                            Completion OTP
                                          </p>
                                          <p className="mt-2 font-mono text-3xl font-black text-amber-700 tracking-widest">
                                            {booking.completionOtpCode}
                                          </p>
                                        </div>
                                      )}
                                      <Button
                                        onClick={() => setVerifyOtpBooking(booking)}
                                        variant="success"
                                        className="mt-4 w-full bg-gradient-to-r from-success-600 to-success-700 hover:from-success-700 hover:to-success-800 text-white shadow-lg shadow-success-500/20 hover:shadow-xl hover:shadow-success-500/30 transition-all duration-300 rounded-xl"
                                      >
                                        Verify OTP
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {booking.status === "completed" && booking.feedback && (
                                <div className="rounded-2xl border border-primary-200/50 bg-gradient-to-br from-primary-50 to-emerald-50 p-5 shadow-sm">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-emerald-600 text-white shadow-lg shadow-primary-500/20">
                                      <Star className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-primary-800">
                                        Booking completed with your feedback
                                      </p>
                                      <div className="mt-2 flex items-center gap-1 text-amber-500">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                          <Star
                                            key={`rating-${booking._id}-${index}`}
                                            className={`h-5 w-5 ${
                                              index < Number(booking.feedback.rating || 0)
                                                ? "fill-current"
                                                : ""
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      {booking.feedback.comment && (
                                        <p className="mt-2 text-sm text-primary-700">
                                          "{booking.feedback.comment}"
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            ) : null}

            {activeTab === "account" ? (
              <div className="space-y-6">
                {/* Modern Profile Header Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 border border-white/80 shadow-2xl shadow-slate-200/50"
                >
                  {/* Decorative Background */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-100/40 to-transparent rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100/30 to-transparent rounded-full blur-2xl" />
                  
                  <div className="relative p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* Profile Avatar Section */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-blue-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500" />
                          <div className="relative">
                            {profileAvatar ? (
                              <img
                                src={profileAvatar}
                                alt={user?.name || "Customer"}
                                className="h-28 w-28 rounded-2xl object-cover shadow-xl ring-4 ring-white"
                              />
                            ) : (
                              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-blue-500 to-indigo-600 text-5xl font-black text-white shadow-xl ring-4 ring-white">
                                {getInitial(user?.name)}
                              </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg ring-2 ring-white">
                              <BadgeCheck className="h-4 w-4" />
                            </div>
                          </div>
                        </div>

                        <div className="text-center sm:text-left">
                          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100">
                            <Award className="h-3.5 w-3.5 text-primary-600" />
                            <span className="text-xs font-bold text-primary-700 tracking-wide">PREMIUM CUSTOMER</span>
                          </div>
                          <h2 className="text-2xl font-black text-slate-900">{user?.name || "Customer"}</h2>
                          <p className="mt-1 text-sm text-slate-500 flex items-center gap-2 justify-center sm:justify-start">
                            <Mail className="h-4 w-4" />
                            {user?.email || "No email added"}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Verified Account
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                              <Star className="h-3.5 w-3.5" />
                              Active Member
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={openEditModal}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit Profile
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Profile Details Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Personal Information Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative overflow-hidden rounded-2xl bg-white border border-white/80 shadow-xl shadow-slate-200/50"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-blue-500 to-indigo-500" />
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 text-white shadow-lg shadow-primary-500/30">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-bold text-slate-900">Personal Information</h3>
                          <p className="text-xs text-slate-500">Your basic account details</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {[
                          {
                            icon: User,
                            label: "Full Name",
                            value: user?.name || "Not set",
                            color: "from-blue-500 to-indigo-500",
                          },
                          {
                            icon: Mail,
                            label: "Email Address",
                            value: user?.email || "Not set",
                            color: "from-primary-500 to-blue-500",
                          },
                          {
                            icon: Phone,
                            label: "Phone Number",
                            value: user?.phone || "Not set",
                            color: "from-emerald-500 to-teal-500",
                          },
                        ].map((item, index) => {
                          const Icon = item.icon;
                          return (
                            <motion.div
                              key={item.label}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + index * 0.1 }}
                              className="group flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50/80 to-white border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all duration-300"
                            >
                              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                  {item.label}
                                </p>
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {item.value}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>

                  {/* Location & Address Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-2xl bg-white border border-white/80 shadow-xl shadow-slate-200/50"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-bold text-slate-900">Location & Address</h3>
                          <p className="text-xs text-slate-500">Your saved delivery address</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="group p-5 rounded-xl bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-cyan-50/30 border border-emerald-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <MapPin className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">
                                Saved Address
                              </p>
                              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                {user?.address || "No address saved yet. Add your address to make bookings easier."}
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-500">Last Updated</p>
                            <p className="text-sm font-semibold text-slate-700">Account created recently</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Account Stats & Quick Actions */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Account Status Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-primary-900 to-blue-900 border border-white/10 shadow-2xl"
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-400 to-transparent rounded-full blur-2xl" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400 to-transparent rounded-full blur-xl" />
                    </div>
                    <div className="relative p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm text-white">
                          <Shield className="h-5 w-5" />
                        </div>
                        <h3 className="font-display text-lg font-bold text-white">Account Status</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                          <span className="text-sm text-slate-300">Verification</span>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                          <span className="text-sm text-slate-300">Account Type</span>
                          <span className="text-xs font-bold text-white">Customer</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                          <span className="text-sm text-slate-300">Status</span>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                            <Zap className="h-3.5 w-3.5" />
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Quick Actions Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-white border border-white/80 shadow-xl shadow-slate-200/50"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500" />
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-bold text-slate-900">Quick Actions</h3>
                          <p className="text-xs text-slate-500">Manage your account efficiently</p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={openEditModal}
                          className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 group"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Edit3 className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-slate-900">Edit Profile</p>
                            <p className="text-xs text-slate-500">Update your personal details</p>
                          </div>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={openEditModal}
                          className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 group"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Camera className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-slate-900">Change Photo</p>
                            <p className="text-xs text-slate-500">Upload a new profile picture</p>
                          </div>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTabChange("bookings")}
                          className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300 group"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <CalendarCheck2 className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-slate-900">View Bookings</p>
                            <p className="text-xs text-slate-500">Check your booking history</p>
                          </div>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTabChange("support")}
                          className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300 group"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Headphones className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-slate-900">Get Support</p>
                            <p className="text-xs text-slate-500">Contact our support team</p>
                          </div>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            ) : null}

            {activeTab === "support" ? (
              <div className="space-y-6">
                {/* Support Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-primary-900 to-blue-900 border border-white/10 shadow-2xl"
                >
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary-400 to-transparent rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-400 to-transparent rounded-full blur-2xl" />
                  </div>
                  <div className="relative p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 text-white shadow-xl">
                          <Headphones className="h-8 w-8" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                            <Sparkles className="h-3.5 w-3.5 text-primary-400" />
                            <span className="text-xs font-bold text-white tracking-wide">24/7 SUPPORT</span>
                          </div>
                          <h2 className="text-3xl font-black text-white">How can we help you?</h2>
                          <p className="mt-2 text-primary-100">Our dedicated support team is here to assist you with any questions or issues</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-bold text-white">
                          <Clock4 className="h-4 w-4" />
                          Avg. Response: 2 min
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-bold text-white">
                          <Users className="h-4 w-4" />
                          50+ Agents Online
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Contact Methods Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Live Chat */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="group relative overflow-hidden rounded-2xl bg-white border border-white/80 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-blue-500" />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 text-white shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                          <MessageSquare className="h-7 w-7" />
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </span>
                      </div>
                      <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Live Chat</h3>
                      <p className="text-sm text-slate-600 mb-4">Get instant help from our support agents through real-time messaging</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Average response time: 2 minutes</span>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white shadow-lg shadow-primary-500/20 hover:shadow-xl transition-all duration-300">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Chat
                      </Button>
                    </div>
                  </motion.div>

                  {/* Phone Support */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="group relative overflow-hidden rounded-2xl bg-white border border-white/80 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                          <PhoneCall className="h-7 w-7" />
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Available
                        </span>
                      </div>
                      <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Phone Support</h3>
                      <p className="text-sm text-slate-600 mb-4">Speak directly with our support team for immediate assistance</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                        <Globe className="h-3.5 w-3.5" />
                        <span>Mon-Sat: 9 AM - 9 PM IST</span>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 mb-4">
                        <p className="text-lg font-bold text-emerald-700">+91 1800-123-4567</p>
                        <p className="text-xs text-emerald-600">Toll-free number</p>
                      </div>
                      <Button variant="secondary" className="w-full border-2 border-emerald-200 hover:border-emerald-300 text-emerald-700 hover:text-emerald-800 transition-all duration-300">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </Button>
                    </div>
                  </motion.div>

                  {/* Email Support */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="group relative overflow-hidden rounded-2xl bg-white border border-white/80 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                          <Mail className="h-7 w-7" />
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-700">
                          <Clock className="h-3 w-3" />
                          24h Response
                        </span>
                      </div>
                      <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Email Support</h3>
                      <p className="text-sm text-slate-600 mb-4">Send us detailed queries and get comprehensive responses</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Best for complex issues</span>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 mb-4">
                        <p className="text-sm font-bold text-amber-700">support@eventmitra.com</p>
                        <p className="text-xs text-amber-600">We reply within 24 hours</p>
                      </div>
                      <Button variant="secondary" className="w-full border-2 border-amber-200 hover:border-amber-300 text-amber-700 hover:text-amber-800 transition-all duration-300">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    </div>
                  </motion.div>
                </div>

                {/* FAQ & Resources Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* FAQ Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative overflow-hidden rounded-2xl bg-white border border-white/80 shadow-xl shadow-slate-200/50"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30">
                          <HelpCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-bold text-slate-900">Frequently Asked Questions</h3>
                          <p className="text-xs text-slate-500">Quick answers to common queries</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {[
                          { q: "How do I book a service?", icon: CalendarCheck2 },
                          { q: "What payment methods are accepted?", icon: Lock },
                          { q: "How can I cancel my booking?", icon: XCircle },
                          { q: "How do I contact my service provider?", icon: MessageCircle },
                          { q: "What is the refund policy?", icon: FileText },
                        ].map((item, index) => {
                          const Icon = item.icon;
                          return (
                            <motion.div
                              key={item.q}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                              className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-primary-50 border border-transparent hover:border-primary-200 cursor-pointer transition-all duration-300"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 group-hover:bg-primary-500 group-hover:text-white shadow-sm transition-all duration-300">
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-primary-700">{item.q}</span>
                              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                            </motion.div>
                          );
                        })}
                      </div>

                      <Button variant="secondary" className="w-full mt-4 border-2 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 transition-all duration-300">
                        <BookOpen className="h-4 w-4 mr-2" />
                        View All FAQs
                      </Button>
                    </div>
                  </motion.div>

                  {/* Help Resources Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative overflow-hidden rounded-2xl bg-white border border-white/80 shadow-xl shadow-slate-200/50"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-bold text-slate-900">Help Resources</h3>
                          <p className="text-xs text-slate-500">Guides and tutorials for you</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {[
                          { title: "Getting Started Guide", desc: "Learn how to use EventMitra", icon: Sparkles },
                          { title: "Booking Tutorial", desc: "Step-by-step booking process", icon: CalendarCheck2 },
                          { title: "Payment Guide", desc: "Understanding payments & refunds", icon: Lock },
                          { title: "Safety Tips", desc: "Stay safe while using our services", icon: Shield },
                          { title: "Video Tutorials", desc: "Watch helpful video guides", icon: Video },
                        ].map((item, index) => {
                          const Icon = item.icon;
                          return (
                            <motion.div
                              key={item.title}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 + index * 0.1 }}
                              className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-transparent hover:border-cyan-200 cursor-pointer transition-all duration-300"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 group-hover:bg-cyan-500 group-hover:text-white shadow-sm transition-all duration-300">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 group-hover:text-cyan-700">{item.title}</p>
                                <p className="text-xs text-slate-500">{item.desc}</p>
                              </div>
                              <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                            </motion.div>
                          );
                        })}
                      </div>

                      <Button variant="secondary" className="w-full mt-4 border-2 border-cyan-200 hover:border-cyan-300 text-cyan-700 hover:text-cyan-800 transition-all duration-300">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse All Resources
                      </Button>
                    </div>
                  </motion.div>
                </div>

                {/* Support Status Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 shadow-xl"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                          <CheckCircle className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-bold text-slate-900">Support Team Status</h3>
                          <p className="text-sm text-slate-600">Our team is ready to help you</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-200 shadow-sm">
                          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-sm font-bold text-emerald-700">All Systems Operational</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-200 shadow-sm">
                          <Users className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-bold text-emerald-700">50+ Agents Online</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-200 shadow-sm">
                          <Clock className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-bold text-emerald-700">Avg. 2 min response</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>

      <AvatarCropModal
        open={cropOpen}
        source={cropSource}
        saving={cropSaving}
        onClose={() => {
          setCropOpen(false);
          setCropSource("");
        }}
        onApply={handleApplyCrop}
      />

      <Modal
        open={editModalOpen}
        onClose={closeEditModal}
        title="Edit Profile"
        size="lg"
      >
        <form onSubmit={handleSaveProfile} className="space-y-5">
          {saveState.error ? (
            <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              <XCircle className="h-4 w-4" />
              {saveState.error}
            </div>
          ) : null}

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {draftAvatar ? (
                <img
                  src={draftAvatar}
                  alt="Avatar preview"
                  className="h-24 w-24 rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-blue-50 text-4xl font-bold text-primary-700">
                  {getInitial(formData.name)}
                </div>
              )}
              <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300">
                <ImagePlus className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
              </label>
            </div>
            <p className="text-xs text-slate-500">Click the icon to upload a new avatar</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={inputClassName}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className={inputClassName}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your address"
                rows={3}
                className={inputClassName}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closeEditModal}
              className="flex-1 border-2 border-slate-200 hover:border-primary-300 text-slate-700 hover:text-primary-700 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveState.saving}
              className="flex-1 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300"
            >
              {saveState.saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
