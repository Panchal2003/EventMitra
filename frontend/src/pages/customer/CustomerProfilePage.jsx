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
  CheckCircle,
  Clock4,
  Users,
  Globe,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
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
  const { user, updateUser, isBootstrapping } = useAuth();
  const { hideBottomNav, showBottomNav } = useUI();
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
  const handleSearchFocus = () => hideBottomNav();
  const handleInputBlur = () => showBottomNav();
  const [cropSource, setCropSource] = useState("");
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSaving, setCropSaving] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackBooking, setFeedbackBooking] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ rating: 5, comment: "" });

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
            className="rounded-3xl border border-white/70 bg-white/90 p-2 shadow-xl backdrop-blur-2xl"
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
                    className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3 text-sm font-bold transition-all ${
                      isActive
                        ? "bg-gradient-to-br from-primary-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-primary-500/20"
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
                    className={`relative flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                      isActive
                        ? "bg-gradient-to-br from-primary-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-primary-500/20"
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
                          Clean booking cards, OTP updates, and partner status in one organized view.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <CustomerBookingsPage embedded />
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
                                alt={user?.name || "Client"}
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
                            <span className="text-xs font-bold text-primary-700 tracking-wide">PREMIUM CLIENT</span>
                          </div>
                          <h2 className="text-2xl font-black text-slate-900">{user?.name || "Client"}</h2>
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
                          <span className="text-xs font-bold text-white">Client</span>
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
                          { q: "How do I contact my service partner?", icon: MessageCircle },
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
                onFocus={handleSearchFocus}
                onBlur={handleInputBlur}
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
                onFocus={handleSearchFocus}
                onBlur={handleInputBlur}
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
                onFocus={handleSearchFocus}
                onBlur={handleInputBlur}
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

      {feedbackModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setFeedbackModalOpen(false);
            }
          }}
        >
          <div 
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">Rate Your Experience</h2>
              <p className="mt-2 text-sm text-slate-600">
                Please rate your experience before making payment.
              </p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-slate-700">Rating</label>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= feedbackData.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700">Comment (optional)</label>
              <textarea
                value={feedbackData.comment}
                onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                placeholder="Share your experience..."
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none"
                rows={3}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                onClick={() => {
                  setFeedbackModalOpen(false);
                  setFeedbackBooking(null);
                  setFeedbackData({ rating: 5, comment: "" });
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:from-amber-600 hover:to-orange-700 transition-all"
                onClick={() => {
                  // Navigate to payment page with feedback data
                  localStorage.setItem("pendingFeedback", JSON.stringify({
                    bookingId: feedbackBooking._id,
                    feedback: feedbackData
                  }));
                  setFeedbackModalOpen(false);
                  setFeedbackBooking(null);
                  setFeedbackData({ rating: 5, comment: "" });
                  navigate(`/customer/payment/${feedbackBooking._id}`);
                }}
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
