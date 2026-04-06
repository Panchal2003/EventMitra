import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, User, Briefcase, Mail, Lock, Eye, EyeOff, Phone, UserPlus, LogIn, Sparkles, ArrowRight, CheckCircle2, Zap, Star, Calendar, Users, Award } from "lucide-react";
import logo from "/logo.png";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { useAuth } from "../context/AuthContext";
import { authApi, publicApi } from "../services/api";

const roleOptions = [
  { id: "customer", label: "Customer", icon: User, desc: "Book services", color: "from-violet-500 to-purple-600", bgColor: "bg-violet-50", textColor: "text-violet-600" },
  { id: "provider", label: "Provider", icon: Briefcase, desc: "Offer services", color: "from-emerald-500 to-teal-600", bgColor: "bg-emerald-50", textColor: "text-emerald-600" },
];

export function LoginPage({ adminBackdoor = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const query = new URLSearchParams(location.search);
  const initialAdminMode = adminBackdoor || query.get("admin") === "true";

  const [selectedRole, setSelectedRole] = useState(initialAdminMode ? "admin" : "customer");
  const [isAdminMode, setIsAdminMode] = useState(initialAdminMode);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState("");

  useEffect(() => {
    if (selectedRole === "provider") {
      publicApi.getServiceCategories()
        .then(res => {
          if (res.data?.data) {
            setServiceCategories(res.data.data);
          }
        })
        .catch(err => console.error("Failed to load categories:", err));
    }
  }, [selectedRole]);

  const emailIsValid = (email) => /^\S+@\S+\.\S+$/.test(email);
  const passwordIsValid = (password) =>
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password) &&
    password.length >= 8;
  const phoneIsValid = (phone) => /^\d{10}$/.test(phone);

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setLoginForm({ email: "", password: "" });
    setError("");
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    if (name === "password" && value === "ADMIN-SHIFT-2026") {
      setIsAdminMode(true);
      setSelectedRole("admin");
    }
    setLoginForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!emailIsValid(loginForm.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!passwordIsValid(loginForm.password)) {
      setError("Password must have at least 8 characters, one uppercase letter, one number and one symbol.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authApi.login(loginForm);
      const { token, user } = response.data.data;

      const roleMap = { customer: "customer", provider: "serviceProvider", admin: "admin" };
      const expectedRole = roleMap[selectedRole];
      
      if (user.role !== expectedRole) {
        setError(`Please login as ${selectedRole} or use credentials for ${selectedRole}.`);
        return;
      }

      login({ token, user });
      
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (user.role === "serviceProvider") {
        navigate("/provider", { replace: true });
      } else {
        navigate(location.state?.from || "/", { replace: true });
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to sign in. Check your credentials and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!registerForm.firstName || !registerForm.lastName || !registerForm.phone || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (!emailIsValid(registerForm.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!phoneIsValid(registerForm.phone)) {
      setError("Phone number must be 10 digits.");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!passwordIsValid(registerForm.password)) {
      setError("Password must be at least 8 characters, one uppercase letter, one number and one symbol.");
      return;
    }

    setIsSubmitting(true);

    try {
      const roleMap = { customer: "customer", provider: "serviceProvider", admin: "admin" };
      const registerData = {
        name: `${registerForm.firstName} ${registerForm.lastName}`.trim(),
        phone: registerForm.phone,
        email: registerForm.email,
        password: registerForm.password,
        role: roleMap[selectedRole] || selectedRole,
      };
      if (selectedRole === "provider" && selectedServiceCategory) {
        registerData.serviceCategory = selectedServiceCategory;
      }
      const response = await authApi.register(registerData);

      const { token, user } = response.data.data;

      login({ token, user });
      
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (user.role === "serviceProvider") {
        navigate("/provider", { replace: true });
      } else {
        navigate(location.state?.from || "/", { replace: true });
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to register. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 h-[600px] w-[600px] bg-gradient-to-br from-pink-500/30 via-rose-500/20 to-transparent rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 h-[600px] w-[600px] bg-gradient-to-tr from-cyan-500/30 via-blue-500/20 to-transparent rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 left-1/4 h-96 w-96 bg-gradient-to-r from-amber-500/20 to-orange-500/10 rounded-full blur-3xl" 
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
      </div>

      {/* Left Side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-16 py-12"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 mb-10"
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-xl shadow-2xl shadow-black/20 p-3 flex items-center justify-center border border-white/30"
          >
            <img src={logo} alt="EventMitra Logo" className="h-full w-full object-contain" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white drop-shadow-lg">EventMitra</h1>
            <p className="text-sm text-white/70 font-medium flex items-center gap-1">
              <Zap className="h-4 w-4" />
              Your Event Partner
            </p>
          </div>
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="inline-flex items-center gap-2 mb-5 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg"
          >
            <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
            <span className="text-xs font-bold text-white tracking-wider">WELCOME</span>
            <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
          </motion.div>
          <h2 className="text-5xl lg:text-6xl font-display font-bold text-white mb-5 drop-shadow-lg leading-tight">
            {isRegistering ? "Create\nAccount" : "Welcome\nBack"}
          </h2>
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            {isRegistering 
              ? "Join EventMitra and start your journey to amazing events" 
              : "Sign in to continue to your account and manage your events"}
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {[
            { icon: Calendar, text: "Book events seamlessly", color: "from-amber-400 to-orange-500" },
            { icon: Users, text: "Connect with top providers", color: "from-emerald-400 to-teal-500" },
            { icon: Award, text: "Premium event services", color: "from-pink-400 to-rose-500" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <span className="text-white font-medium">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col relative z-10"
      >
        {/* Mobile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden relative pt-6 pb-4 px-6"
        >
          <div className="flex items-center justify-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-xl shadow-lg p-2 flex items-center justify-center border border-white/30"
            >
              <img src={logo} alt="EventMitra Logo" className="h-full w-full object-contain" />
            </motion.div>
            <div>
              <h1 className="text-xl font-display font-bold text-white">EventMitra</h1>
              <p className="text-xs text-white/70 font-medium">Your Event Partner</p>
            </div>
          </div>
        </motion.div>

        {/* Form Container - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 lg:py-12 lg:px-16 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Mobile Welcome Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:hidden text-center mb-6"
            >
              <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/30">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span className="text-xs font-bold text-white tracking-wider">WELCOME</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                {isRegistering ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-sm text-white/80">
                {isRegistering 
                  ? "Join EventMitra and start your journey" 
                  : "Sign in to continue to your account"}
              </p>
            </motion.div>

            {/* Main Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/20 border border-white/50 overflow-hidden"
            >
              {/* Role Selection */}
              <div className="p-6 pb-4">
                <div className="grid grid-cols-2 gap-3">
                  {roleOptions.map((role, index) => {
                    const Icon = role.icon;
                    return (
                      <motion.button
                        key={role.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleRoleChange(role.id)}
                        className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-300 overflow-hidden ${
                          selectedRole === role.id
                            ? `bg-gradient-to-r ${role.color} text-white shadow-lg`
                            : `${role.bgColor} border border-slate-200 ${role.textColor} hover:shadow-md`
                        }`}
                      >
                        {selectedRole === role.id && (
                          <motion.div
                            layoutId="roleHighlight"
                            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${
                          selectedRole === role.id 
                            ? "bg-white/20 shadow-lg" 
                            : "bg-white shadow-md"
                        }`}>
                          <Icon className={`h-5 w-5 ${selectedRole === role.id ? "text-white" : role.textColor}`} />
                        </div>
                        <span className="relative text-sm font-bold">{role.label}</span>
                        <span className="relative text-[10px] opacity-80">{role.desc}</span>
                        {selectedRole === role.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2"
                          >
                            <CheckCircle2 className="h-5 w-5 text-white drop-shadow-md" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="px-6 pb-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-2 bg-slate-100 rounded-2xl p-1.5"
                >
                  <button
                    onClick={() => { setIsRegistering(false); setError(""); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 text-sm font-semibold ${
                      !isRegistering
                        ? "bg-white text-violet-600 shadow-lg shadow-violet-500/20"
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    }`}
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </button>
                  <button
                    onClick={() => { setIsRegistering(true); setError(""); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 text-sm font-semibold ${
                      isRegistering
                        ? "bg-white text-violet-600 shadow-lg shadow-violet-500/20"
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    }`}
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </button>
                </motion.div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="mx-6 mb-4 rounded-xl bg-rose-50 border border-rose-200 p-4"
                  >
                    <p className="text-sm text-rose-700 font-medium">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forms */}
              <div className="px-6 pb-6">
                <AnimatePresence mode="wait">
                  {!isRegistering ? (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleLoginSubmit}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
                          <div className="relative flex items-center">
                            <Mail className="absolute left-4 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                            <input
                              type="email"
                              name="email"
                              placeholder="your@email.com"
                              value={loginForm.email}
                              onChange={handleLoginChange}
                              className="w-full rounded-xl border-2 border-slate-200 bg-white pl-12 pr-4 py-3.5 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
                          <div className="relative flex items-center">
                            <Lock className="absolute left-4 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                            <input
                              type={showLoginPassword ? "text" : "password"}
                              name="password"
                              placeholder="••••••••"
                              value={loginForm.password}
                              onChange={handleLoginChange}
                              className="w-full rounded-xl border-2 border-slate-200 bg-white pl-12 pr-12 py-3.5 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute right-4 text-slate-400 hover:text-violet-600 transition-colors"
                            >
                              {showLoginPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        isLoading={isSubmitting}
                        className="mt-6 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300 rounded-xl py-4"
                      >
                        <span className="flex items-center gap-2">
                          Sign In
                          <ArrowRight className="h-5 w-5" />
                        </span>
                      </Button>

                      <p className="text-center text-sm text-slate-500 mt-4">
                        Demo credentials available for testing
                      </p>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="register"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleRegisterSubmit}
                      className="space-y-4"
                    >
                      {/* Name Fields - 2 in a row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            placeholder="John"
                            value={registerForm.firstName}
                            onChange={handleRegisterChange}
                            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            placeholder="Doe"
                            value={registerForm.lastName}
                            onChange={handleRegisterChange}
                            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20"
                            required
                          />
                        </div>
                      </div>

                      {/* Phone & Email - 2 in a row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
                            <div className="relative flex items-center">
                              <Phone className="absolute left-4 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                              <input
                                type="tel"
                                name="phone"
                                placeholder="9876543210"
                                value={registerForm.phone}
                                onChange={handleRegisterChange}
                                className="w-full rounded-xl border-2 border-slate-200 bg-white pl-12 pr-4 py-3 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
                            <div className="relative flex items-center">
                              <Mail className="absolute left-4 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                              <input
                                type="email"
                                name="email"
                                placeholder="your@email.com"
                                value={registerForm.email}
                                onChange={handleRegisterChange}
                                className="w-full rounded-xl border-2 border-slate-200 bg-white pl-12 pr-4 py-3 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Password & Confirm Password - 2 in a row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
                            <div className="relative flex items-center">
                              <Lock className="absolute left-4 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                              <input
                                type={showRegisterPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                value={registerForm.password}
                                onChange={handleRegisterChange}
                                className="w-full rounded-xl border-2 border-slate-200 bg-white pl-12 pr-12 py-3 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                className="absolute right-4 text-slate-400 hover:text-violet-600 transition-colors"
                              >
                                {showRegisterPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
                            <div className="relative flex items-center">
                              <Lock className="absolute left-4 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                              <input
                                type={showRegisterConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={registerForm.confirmPassword}
                                onChange={handleRegisterChange}
                                className="w-full rounded-xl border-2 border-slate-200 bg-white pl-12 pr-12 py-3 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                                className="absolute right-4 text-slate-400 hover:text-violet-600 transition-colors"
                              >
                                {showRegisterConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        {selectedRole === "provider" && (
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Service Category</label>
                            <div className="relative group">
                              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
                              <div className="relative flex items-center">
                                <Briefcase className="absolute left-4 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                                <select
                                  name="serviceCategory"
                                  value={selectedServiceCategory}
                                  onChange={(e) => setSelectedServiceCategory(e.target.value)}
                                  className="w-full rounded-xl border-2 border-slate-200 bg-white pl-12 pr-12 py-3 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20"
                                  required
                                >
                                  <option value="">Select your service type</option>
                                  {serviceCategories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        isLoading={isSubmitting}
                        className="mt-6 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300 rounded-xl py-4"
                      >
                        <span className="flex items-center gap-2">
                          Create Account
                          <ArrowRight className="h-5 w-5" />
                        </span>
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative mt-6"
            >
              <p className="text-center text-xs text-white/60">
                By signing in, you agree to our{" "}
                <a href="#" className="text-white hover:text-amber-300 font-medium underline decoration-white/30 hover:decoration-amber-300 transition-colors">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-white hover:text-amber-300 font-medium underline decoration-white/30 hover:decoration-amber-300 transition-colors">Privacy Policy</a>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
