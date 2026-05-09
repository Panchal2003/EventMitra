import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  CalendarCheck2,
  Home,
  Info,
  Phone,
  Image,
  User,
  LogOut
} from "lucide-react";
import logo from "/logo.png";

export function CustomerSidebar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Navigation items for everyone
  const publicNavItems = [
    { to: "/", icon: Home, label: "Home", end: true, color: "from-orange-500 to-red-500" },
    { to: "/services", icon: CalendarCheck2, label: "Services", color: "from-pink-500 to-rose-500" },
    { to: "/about", icon: Info, label: "About Us", color: "from-blue-500 to-indigo-500" },
    { to: "/contact", icon: Phone, label: "Contact", color: "from-emerald-500 to-teal-500" },
    { to: "/gallery", icon: Image, label: "Gallery", color: "from-violet-500 to-purple-500" },
  ];

  // Navigation items for logged-in customers only
  const privateNavItems = [
    { to: "/customer/profile", icon: User, label: "Profile", color: "from-cyan-500 to-blue-500" },
  ];

  return (
    <>
      {/* Sidebar - Completely hidden on mobile, shown on md+ only */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-slate-200/80 bg-gradient-to-b from-orange-500/5 via-pink-500/5 to-blue-500/5 shadow-2xl backdrop-blur-xl md:relative md:flex"
      >
        <div className="flex h-full flex-col">
          <div className="relative flex shrink-0 items-center border-b border-slate-100 px-5 py-5">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary-100 via-blue-100 to-amber-50 opacity-60 blur-2xl"></div>
            <div className="relative flex w-full items-center gap-3">
              <motion.div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg"
                whileHover={{ rotate: 5, scale: 1.05 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 p-1 shadow-md">
                  <img src={logo} alt="EventMitra" className="relative h-full w-full object-contain" />
                </div>
              </motion.div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-bold text-slate-950 lg:text-lg">
                  EventMitra
                </p>
                <p className="hidden truncate text-xs text-slate-600 lg:block">
                  {isAuthenticated ? `Welcome, ${user?.name?.split(" ")[0] || "User"}` : "Event Planning"}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <p className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Menu
            </p>
            <ul className="space-y-1">
              {publicNavItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                        isActive
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-${item.color
                              .split(" ")
                              .map((c) => c.replace("from-", "").replace("to-", ""))
                              .join("/")}/20`
                          : `bg-${item.color
                              .split(" ")
                              .map((c) => c.replace("from-", "").replace("to-", ""))
                              .join("/")}/20 text-slate-600 hover:text-black hover:shadow-lg`
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? "text-white" : item.color
                            .split(" ")
                            .map((c) => c.replace("from-", "text-").replace("to-", "text-"))
                            .join(" ")}`} />
                        {item.label}
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="ml-auto h-2 w-2 rounded-full bg-white"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Private Navigation */}
            {isAuthenticated && (
              <>
                <p className="mb-2 mt-6 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  My Account
                </p>
                <ul className="space-y-1">
                  {privateNavItems.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                            isActive
                              ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-${item.color
                                  .split(" ")
                                  .map((c) => c.replace("from-", "").replace("to-", ""))
                                  .join("/")}/20`
                              : `bg-${item.color
                                  .split(" ")
                                  .map((c) => c.replace("from-", "").replace("to-", ""))
                                  .join("/")}/20 text-slate-600 hover:text-white hover:shadow-lg`
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? "text-white" : item.color
                                .split(" ")
                                .map((c) => c.replace("from-", "text-").replace("to-", "text-"))
                                .join(" ")}`} />
                            {item.label}
                            {isActive && (
                              <motion.div
                                layoutId="activeIndicatorPrivate"
                                className="ml-auto h-2 w-2 rounded-full bg-white"
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </nav>

          {isAuthenticated && (
            <div className="border-t border-slate-100 p-4">
              <div className="mb-4 rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-blue-50 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 text-sm font-bold text-white shadow-md">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email || "Customer account"}</p>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 px-4 py-3 text-sm font-medium text-red-600 transition-all hover:from-red-100 hover:to-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </motion.button>
            </div>
          )}

          <div className="border-t border-slate-100 p-4">
            <p className="text-center text-xs text-slate-400">
              EventMitra v1.0.0
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
