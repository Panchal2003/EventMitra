import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminNavigation } from "./adminNavigation";
import logo from "/logo.png";

export function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Sidebar - Hidden on mobile, shown on md+ only */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col bg-white shadow-2xl md:relative md:flex"
      >
        <div className="flex h-full flex-col">
          {/* Logo Header */}
          <div className="relative flex h-16 shrink-0 items-center border-b border-slate-100 px-5">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 opacity-50 blur-2xl"></div>
            <div className="relative flex w-full items-center gap-3">
              <motion.div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg"
                whileHover={{ rotate: 5, scale: 1.05 }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 p-1 shadow-md">
                  <img src={logo} alt="EventMitra Logo" className="h-full w-full object-contain" />
                </div>
              </motion.div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-bold text-slate-950 lg:text-lg">
                  EventMitra
                </p>
                <p className="hidden truncate text-xs text-slate-500 lg:block">
                  Admin Control
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Menu
            </p>
            <ul className="space-y-1">
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <NavLink
                      to={item.path}
                      end={item.end}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? "text-white" : item.color || ""}`} />
                          {item.label}
                          {isActive && (
                            <motion.div
                              layoutId="adminActiveIndicator"
                              className="ml-auto h-2 w-2 rounded-full bg-white"
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="border-t border-slate-100 p-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-50 to-red-100 px-4 py-3 text-sm font-medium text-red-600 transition-all hover:from-red-100 hover:to-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </motion.button>
          </div>

          {/* Version */}
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
