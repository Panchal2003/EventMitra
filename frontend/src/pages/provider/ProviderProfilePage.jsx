import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProviderDashboardData } from "../../hooks/useProviderDashboardData";
import { GlassCard } from "../../components/admin/GlassCard";
import { AvatarCropModal } from "../../components/customer/AvatarCropModal";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { formatCurrency } from "../../utils/currency";
import { 
  User, 
  BriefcaseBusiness, 
  Mail, 
  Phone, 
  MapPin, 
  Star,
  LogOut,
  ShieldCheck,
  Clock,
  TrendingUp,
  Award,
  Settings,
  Bell,
  Lock,
  CreditCard,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarCheck2,
  Wallet,
  ImagePlus,
  Loader2,
  Sparkles,
  Zap,
  Target,
  Activity,
  Edit3,
  Camera,
  BadgeCheck,
  Heart,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function getInitial(name) {
  return name?.charAt(0)?.toUpperCase() || "P";
}

function formatCompactAmount(amount) {
  if (!amount) {
    return "Rs 0";
  }

  if (amount >= 1000) {
    return `Rs ${(amount / 1000).toFixed(1)}k`;
  }

  return `Rs ${Math.round(amount)}`;
}

export function ProviderProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const {
    bookings = [],
    error: hookError,
    profile = {},
    updateProfile,
  } = useProviderDashboardData();

  const [showAvatarCrop, setShowAvatarCrop] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [cropSaving, setCropSaving] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    avatar: user?.avatar || "",
  });
  const [saveState, setSaveState] = useState({
    saving: false,
    error: "",
    success: "",
  });

  const [paymentFormData, setPaymentFormData] = useState({
    providerBankAccount: {
      bankName: user?.providerBankAccount?.bankName || "",
      accountNumber: user?.providerBankAccount?.accountNumber || "",
      ifscCode: user?.providerBankAccount?.ifscCode || "",
      accountHolderName: user?.providerBankAccount?.accountHolderName || "",
    },
    upiId: user?.upiId || "",
  });
  const [paymentSaveState, setPaymentSaveState] = useState({
    saving: false,
    error: "",
    success: "",
  });

  // Calculate profile stats
  const completedBookings = bookings.filter(b => b.status === "completed").length;
  const totalGrossRevenue = bookings
    .filter(b => b.status === "completed")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalEarnings = bookings
    .filter(b => b.status === "completed")
    .reduce((sum, b) => sum + (b.providerAmount || Math.round((b.totalAmount || 0) * 0.89)), 0);
  const totalAdminProfit = bookings
    .filter(b => b.status === "completed")
    .reduce((sum, b) => sum + (b.adminProfit || Math.round((b.totalAmount || 0) * 0.11)), 0);

  const providerRatingCount = Number(profile?.ratingCount || 0);
  const providerRatingValue = Number(profile?.rating || 0);
  const providerRatingLabel = providerRatingCount > 0 ? providerRatingValue.toFixed(1) : "New";
  const providerRatingMeta = providerRatingCount > 0
    ? `${providerRatingCount} review${providerRatingCount === 1 ? "" : "s"}`
    : "No reviews yet";

  const summaryItems = [
    { icon: CalendarCheck2, label: "Completed Jobs", value: completedBookings },
    { icon: Wallet, label: "Your Earnings", value: formatCurrency(totalEarnings) },
    { icon: TrendingUp, label: "Admin Fee (11%)", value: formatCurrency(totalAdminProfit) },
  ];

  const overviewItems = [
    { icon: User, label: "Full Name", value: formData.name || "Not set" },
    { icon: Mail, label: "Email Address", value: user?.email || "Not set" },
    { icon: Phone, label: "Phone Number", value: formData.phone || "Not set" },
    { icon: MapPin, label: "Saved Address", value: formData.address || "Not set" },
  ];

  const paymentDetailsItems = [
    { label: "Bank Name", value: paymentFormData.providerBankAccount?.bankName || "Not set" },
    { label: "Account Number", value: paymentFormData.providerBankAccount?.accountNumber ? "••••" + paymentFormData.providerBankAccount.accountNumber.slice(-4) : "Not set" },
    { label: "IFSC Code", value: paymentFormData.providerBankAccount?.ifscCode || "Not set" },
    { label: "Account Holder", value: paymentFormData.providerBankAccount?.accountHolderName || "Not set" },
    { label: "UPI ID", value: paymentFormData.upiId || "Not set" },
  ];

  const heroSummaryItems = [
    { icon: CalendarCheck2, label: "Completed Jobs", value: completedBookings },
    { icon: Wallet, label: "Your Earnings", value: formatCurrency(totalEarnings) },
    { icon: TrendingUp, label: "Admin Fee (11%)", value: formatCurrency(totalAdminProfit) },
  ];

  const heroHighlights = [
    { icon: ShieldCheck, label: "Verified provider" },
    { icon: Sparkles, label: profile?.serviceCategory?.name || "Service specialist" },
    { icon: Activity, label: completedBookings ? `${completedBookings} jobs delivered` : "Ready for new bookings" },
  ];

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      avatar: user?.avatar || "",
    });
    setPaymentFormData({
      providerBankAccount: {
        bankName: user?.providerBankAccount?.bankName || "",
        accountNumber: user?.providerBankAccount?.accountNumber || "",
        ifscCode: user?.providerBankAccount?.ifscCode || "",
        accountHolderName: user?.providerBankAccount?.accountHolderName || "",
      },
      upiId: user?.upiId || "",
    });
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
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

  const openPaymentModal = () => {
    setPaymentFormData({
      providerBankAccount: {
        bankName: user?.providerBankAccount?.bankName || "",
        accountNumber: user?.providerBankAccount?.accountNumber || "",
        ifscCode: user?.providerBankAccount?.ifscCode || "",
        accountHolderName: user?.providerBankAccount?.accountHolderName || "",
      },
      upiId: user?.upiId || "",
    });
    setPaymentSaveState({ saving: false, error: "", success: "" });
    setPaymentModalOpen(true);
  };

  const handlePaymentInputChange = (event) => {
    const { name, value } = event.target;
    if (name.startsWith("providerBankAccount.")) {
      const field = name.replace("providerBankAccount.", "");
      setPaymentFormData((prev) => ({
        ...prev,
        providerBankAccount: { ...prev.providerBankAccount, [field]: value },
      }));
    } else {
      setPaymentFormData((prev) => ({ ...prev, [name]: value }));
    }
    setPaymentSaveState((prev) => ({ ...prev, error: "", success: "" }));
  };

  const handleSavePayment = async (event) => {
    event.preventDefault();
    setPaymentSaveState({ saving: true, error: "", success: "" });
    try {
      const response = await updateProfile(paymentFormData);
      if (response.data?.success) {
        updateUser(response.data.data);
        setPaymentSaveState({ saving: false, error: "", success: "Payment details saved successfully!" });
        setPaymentModalOpen(false);
      }
    } catch (err) {
      setPaymentSaveState({ saving: false, error: err.response?.data?.message || "Failed to save payment details", success: "" });
    }
  };

  const closeEditModal = () => {
    syncFormWithUser();
    setSaveState((previous) => ({
      ...previous,
      error: "",
    }));
    setEditModalOpen(false);
  };

  const handleAvatarFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(String(reader.result || ""));
      setShowAvatarCrop(true);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleAvatarApply = async (croppedImage) => {
    setCropSaving(true);
    setFormData((previous) => ({
      ...previous,
      avatar: croppedImage,
    }));
    setCropSaving(false);
    setShowAvatarCrop(false);
    setAvatarPreview(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    if (name.startsWith("providerBankAccount.")) {
      const field = name.replace("providerBankAccount.", "");
      setFormData((previous) => ({
        ...previous,
        providerBankAccount: {
          ...previous.providerBankAccount,
          [field]: value,
        },
      }));
    } else {
      setFormData((previous) => ({
        ...previous,
        [name]: value,
      }));
    }
    
    setSaveState((previous) => ({
      ...previous,
      error: "",
      success: "",
    }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    setSaveState({
      saving: true,
      error: "",
      success: "",
    });

    try {
      const response = await updateProfile(formData);
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

  const profileAvatar = user?.avatar || "";
  const draftAvatar = formData.avatar || "";

  const inputClassName =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100";

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden px-4 pb-8 pt-4">
        {/* Premium Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] bg-gradient-to-br from-primary-200/40 via-blue-200/30 to-indigo-200/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] bg-gradient-to-tr from-purple-200/30 via-pink-200/20 to-rose-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/4 left-1/4 h-32 w-32 bg-gradient-to-r from-emerald-200/30 to-teal-200/20 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '8s' }} />
          <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-white/50" />
        </div>

        <div className="relative mx-auto max-w-6xl space-y-5">
          {/* Error/Notice Messages */}
          {hookError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              <AlertCircle className="h-4 w-4" />
              {hookError}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
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
                              alt={user?.name || "Provider"}
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
                          <span className="text-xs font-bold text-primary-700 tracking-wide">PREMIUM PROVIDER</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">{user?.name || "Provider"}</h2>
                        <p className="mt-1 text-sm text-slate-500 flex items-center gap-2 justify-center sm:justify-start">
                          <Mail className="h-4 w-4" />
                          {user?.email || "No email added"}
                        </p>
                        <p className="mt-2 flex items-center gap-2 justify-center text-sm font-medium text-amber-600 sm:justify-start">
                          <Star className="h-4 w-4 fill-current" />
                          {providerRatingLabel} rating
                          <span className="text-slate-400">|</span>
                          <span className="text-slate-500">{providerRatingMeta}</span>
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verified Provider
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                            <Star className="h-3.5 w-3.5" />
                            {providerRatingMeta}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-xs font-bold text-violet-700">
                            <BriefcaseBusiness className="h-3.5 w-3.5" />
                            {profile?.serviceCategory?.name || "Service Provider"}
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

              {/* Provider Stats */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Provider Status Card */}
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
                      <h3 className="font-display text-lg font-bold text-white">Provider Status</h3>
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
                        <span className="text-xs font-bold text-white">Provider</span>
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

                {/* Account Settings Card */}
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
                        <Settings className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-slate-900">Account Settings</h3>
                        <p className="text-xs text-slate-500">Manage your account preferences</p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        { icon: Bell, label: "Notifications", description: "Manage notification preferences" },
                        { icon: Lock, label: "Privacy & Security", description: "Password and security settings" },
                        { icon: CreditCard, label: "Payment Settings", description: "Bank details and payouts", action: openPaymentModal },
                        { icon: HelpCircle, label: "Help & Support", description: "FAQs and customer support" },
                      ].map((setting, index) => (
                        <motion.button
                          key={setting.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={setting.action || undefined}
                          className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50/80 to-white border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all duration-300 group ${setting.action ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <setting.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-bold text-slate-900">{setting.label}</p>
                            <p className="text-xs text-slate-500">{setting.description}</p>
                          </div>
                          {setting.action && <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary-500 transition-colors" />}
                        </motion.button>
                      ))}
                    </div>

                    {/* Sign Out Button */}
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogout}
                      className="mt-6 flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 hover:border-rose-200 hover:shadow-lg transition-all duration-300 group w-full"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <LogOut className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-900">Sign Out</p>
                        <p className="text-xs text-slate-500">Log out of your account</p>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              </div>

              {/* App Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="relative overflow-hidden rounded-2xl bg-white border border-white/80 shadow-xl shadow-slate-200/50"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300" />
                <div className="p-6">
                  <h3 className="font-display text-lg font-semibold text-slate-950 mb-4">About</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">App Version</span>
                      <span className="font-semibold text-slate-900">1.0.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Terms of Service</span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Privacy Policy</span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <Modal
        open={editModalOpen}
        onClose={closeEditModal}
        title="Edit provider profile"
        description="Update your business-facing details and manage the provider profile image from one focused modal."
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} isLoading={saveState.saving}>
              Save Changes
            </Button>
          </div>
        }
      >
        <form className="space-y-5" onSubmit={handleSaveProfile}>
          {saveState.error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {saveState.error}
            </div>
          ) : null}

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative">
                {draftAvatar ? (
                  <img
                    src={draftAvatar}
                    alt="Profile draft preview"
                    className="h-24 w-24 rounded-2xl object-cover shadow-soft"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-pink-100 text-4xl font-bold text-indigo-700">
                    {getInitial(formData.name)}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-slate-900">Profile image</p>
                <p className="mt-1 text-sm text-slate-500">
                  Upload a square portrait, crop it neatly, or remove the current image for a clean initial-based avatar.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                    <ImagePlus className="h-4 w-4" />
                    Upload & Crop
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarFile}
                    />
                  </label>
                  {draftAvatar ? (
                    <button
                      type="button"
                      onClick={() => setFormData((previous) => ({ ...previous, avatar: "" }))}
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                    >
                      <XCircle className="h-4 w-4" />
                      Remove Image
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Full Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={inputClassName}
                placeholder="Enter your full name"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Phone</span>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={inputClassName}
                placeholder="Add a working number"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              value={user?.email || ""}
              className={`${inputClassName} cursor-not-allowed bg-slate-50 text-slate-500`}
              disabled
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Address</span>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={inputClassName}
              rows={4}
              placeholder="Add your address"
            />
          </label>
        </form>
      </Modal>

      <AvatarCropModal
        open={showAvatarCrop}
        source={avatarPreview}
        onClose={() => {
          setShowAvatarCrop(false);
          setAvatarPreview(null);
        }}
        onApply={handleAvatarApply}
        busy={cropSaving}
      />

      <Modal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Payment Settings"
        description="Add your bank details to receive payouts"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePayment} isLoading={paymentSaveState.saving}>
              Save Payment Details
            </Button>
          </div>
        }
      >
        <form className="space-y-5" onSubmit={handleSavePayment}>
          {paymentSaveState.error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {paymentSaveState.error}
            </div>
          )}
          {paymentSaveState.success && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
              {paymentSaveState.success}
            </div>
          )}

          <div className="rounded-2xl border border-violet-100 bg-violet-50/80 p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-violet-600" />
              <p className="font-semibold text-violet-900">Bank Account Details</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Bank Name</span>
                <input
                  type="text"
                  name="providerBankAccount.bankName"
                  value={paymentFormData.providerBankAccount?.bankName || ""}
                  onChange={handlePaymentInputChange}
                  className={inputClassName}
                  placeholder="e.g., HDFC Bank"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Account Number</span>
                <input
                  type="text"
                  name="providerBankAccount.accountNumber"
                  value={paymentFormData.providerBankAccount?.accountNumber || ""}
                  onChange={handlePaymentInputChange}
                  className={inputClassName}
                  placeholder="Enter account number"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">IFSC Code</span>
                <input
                  type="text"
                  name="providerBankAccount.ifscCode"
                  value={paymentFormData.providerBankAccount?.ifscCode || ""}
                  onChange={handlePaymentInputChange}
                  className={inputClassName}
                  placeholder="e.g., HDFC0001234"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Account Holder Name</span>
                <input
                  type="text"
                  name="providerBankAccount.accountHolderName"
                  value={paymentFormData.providerBankAccount?.accountHolderName || ""}
                  onChange={handlePaymentInputChange}
                  className={inputClassName}
                  placeholder="Name as per bank records"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-violet-50/80 p-5">
            <div className="flex items-center gap-2 mb-4">
              <p className="font-semibold text-violet-900">Alternative Payment</p>
            </div>
            
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">UPI ID (Optional)</span>
              <input
                type="text"
                name="upiId"
                value={paymentFormData.upiId || ""}
                onChange={handlePaymentInputChange}
                className={inputClassName}
                placeholder="e.g., mobilenumber@upi"
              />
            </label>
          </div>
        </form>
      </Modal>
    </>
  );
}
