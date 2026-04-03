import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Home, 
  Sparkles,
  Info, 
  Phone, 
  Image,
  CalendarCheck2, 
  User,
  LayoutDashboard,
  Users,
  UserCircle,
  BriefcaseBusiness,
  Wallet,
  Package,
 IndianRupee // Added Indian Rupee icon
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";

// Helper function to get colorful icon class based on icon type
const getIconColor = (icon, isActive) => {
  const iconName = icon?.displayName || icon?.name || "";
  const activeColors = {
    Home: "text-orange-500 drop-shadow-sm",
    Sparkles: "text-violet-500 drop-shadow-sm",
    Info: "text-blue-500 drop-shadow-sm",
    Phone: "text-emerald-500 drop-shadow-sm",
    Image: "text-cyan-500 drop-shadow-sm",
    User: "text-indigo-500 drop-shadow-sm",
    LayoutDashboard: "text-blue-500 drop-shadow-sm",
    Users: "text-green-500 drop-shadow-sm",
    UserCircle: "text-purple-500 drop-shadow-sm",
   IndianRupee: "text-amber-500 drop-shadow-sm", // Changed to yellow/amber
    BriefcaseBusiness: "text-amber-500 drop-shadow-sm",
    Wallet: "text-cyan-500 drop-shadow-sm",
    Package: "text-fuchsia-500 drop-shadow-sm",
    CalendarCheck2: "text-rose-500 drop-shadow-sm",
  };
  
  const inactiveColors = {
    Home: "text-orange-400",
    Sparkles: "text-violet-400",
    Info: "text-blue-400",
    Phone: "text-emerald-400",
    Image: "text-cyan-400",
    User: "text-indigo-400",
    LayoutDashboard: "text-blue-400",
    Users: "text-green-400",
    UserCircle: "text-purple-400",
   IndianRupee: "text-amber-400", // Changed to yellow/amber
    BriefcaseBusiness: "text-amber-400",
    Wallet: "text-cyan-400",
    Package: "text-fuchsia-400",
    CalendarCheck2: "text-rose-400",
  };
  
  const activeClass = activeColors[iconName] || "text-primary-600";
  const inactiveClass = inactiveColors[iconName] || "text-slate-500";
  
  return isActive ? activeClass : inactiveClass;
};

// Helper for background gradient on active state
const getActiveGradient = (icon) => {
  const iconName = icon?.displayName || icon?.name || "";
  const gradients = {
    Home: "from-orange-100 to-orange-50",
    Sparkles: "from-violet-100 to-violet-50",
    Info: "from-blue-100 to-blue-50",
    Phone: "from-emerald-100 to-emerald-50",
    Image: "from-cyan-100 to-cyan-50",
    User: "from-indigo-100 to-indigo-50",
    LayoutDashboard: "from-blue-100 to-blue-50",
    Users: "from-green-100 to-green-50",
    UserCircle: "from-purple-100 to-purple-50",
    IndianRupee: "from-amber-100 to-amber-50", // Changed to yellow/amber gradient
    BriefcaseBusiness: "from-amber-100 to-amber-50",
    Wallet: "from-cyan-100 to-cyan-50",
    Package: "from-fuchsia-100 to-fuchsia-50",
    CalendarCheck2: "from-rose-100 to-rose-50",
  };
  return gradients[iconName] || "from-primary-100 to-primary-50";
};

// Public navigation items
const publicNavItems = [
  { to: "/", icon: Home, label: "Home", end: true },
  { to: "/services", icon: Sparkles, label: "Services" },
  { to: "/about", icon: Info, label: "About" },
  { to: "/contact", icon: Phone, label: "Contact" },
  { to: "/gallery", icon: Image, label: "Gallery" },
];

// Customer navigation items
const customerNavItems = [
  { to: "/", icon: Home, label: "Home", end: true },
  { to: "/services", icon: Sparkles, label: "Services" },
  { to: "/about", icon: Info, label: "About" },
  { to: "/contact", icon: Phone, label: "Contact" },
  { to: "/gallery", icon: Image, label: "Gallery" },
  { to: "/customer/profile", icon: User, label: "Profile" },
];

// Admin navigation items
const adminNavItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/services", icon: Sparkles, label: "Services" },
  { to: "/admin/providers", icon: Users, label: "Providers" },
  { to: "/admin/customers", icon: UserCircle, label: "Customers" },
  { to: "/admin/bookings", icon: CalendarCheck2, label: "Bookings" },
  { to: "/admin/payments", icon:IndianRupee, label: "Payments" }, // Changed CircleIndianRupee toIndianRupee
];

// Provider navigation items
const providerNavItems = [
  { to: "/provider", icon: BriefcaseBusiness, label: "Dashboard", end: true },
  { to: "/provider/bookings", icon: CalendarCheck2, label: "Bookings" },
  { to: "/provider/services", icon: Package, label: "Services" },
  { to: "/provider/earnings", icon:IndianRupee, label: "Earnings" }, // Changed Wallet toIndianRupee
  { to: "/provider/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const { isAuthenticated, user } = useAuth();
  const { isBottomNavHidden } = useUI();
  
  // Determine which navigation items to show based on user role
  const getNavItems = () => {
    if (!isAuthenticated) {
      return publicNavItems;
    }
    
    const userRole = user?.role;
    
    if (userRole === "admin") {
      return adminNavItems;
    }
    
    if (userRole === "serviceProvider" || userRole === "provider") {
      return providerNavItems;
    }
    
    // Default to customer navigation
    return customerNavItems;
  };

  const navItems = getNavItems();
  const isDenseNav = navItems.length >= 5;
  const denseGridCols = navItems.length >= 6 ? "grid-cols-6" : "grid-cols-5";

  if (isBottomNavHidden) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom"
      style={{
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      }}
    >
      <div className="mx-2 mb-2 rounded-[1.65rem] border border-white/70 bg-white/88 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
      <div
        className={`px-2 py-1.5 ${
          isDenseNav
            ? `grid ${denseGridCols} gap-1`
            : "no-scrollbar flex items-center gap-1 overflow-x-auto"
        }`}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative flex ${isDenseNav ? "min-w-0 px-1" : "min-w-[4.6rem] shrink-0 px-2"} flex-col items-center gap-1 rounded-2xl py-1.5 transition-all duration-300 ${
                isActive
                  ? "text-primary-600"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  className="relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all"
                  whileTap={{ scale: 0.86 }}
                  whileHover={{ scale: 1.04 }}
                  animate={
                    isActive
                      ? { backgroundColor: "rgba(86, 103, 245, 0.15)", scale: 1.05 }
                      : { backgroundColor: "transparent", scale: 1 }
                  }
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavBg"
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${getActiveGradient(item.icon)}`}
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 28,
                      }}
                    />
                  )}
                  {item.label === "Profile" && user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || "Profile"}
                      className={`relative h-6 w-6 rounded-full object-cover border-2 transition-all ${
                        isActive ? `border-indigo-500 scale-110` : "border-slate-200 scale-100"
                      }`}
                    />
                  ) : (
                    <item.icon className={`relative h-4 w-4 transition-transform duration-200 ${isActive ? "scale-110" : "scale-100"} ${getIconColor(item.icon, isActive)}`} />
                  )}
                </motion.div>
                <span className={`max-w-full truncate ${isDenseNav ? "text-[9px]" : "text-[10px]"} font-medium transition-colors ${isActive ? `font-semibold ${getIconColor(item.icon, isActive)}` : getIconColor(item.icon, false)}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      </div>
    </motion.nav>
  );
}