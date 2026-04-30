import { motion } from "framer-motion";
import { Menu, LogOut, Shield, Sparkles, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export function AdminTopbar({ onMenuClick }) {
  const { logout, user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mb-6 overflow-hidden rounded-2xl border border-white/60 bg-white/80 backdrop-blur-2xl shadow-xl shadow-slate-200/20"
    >
      {/* Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 h-40 w-40 bg-gradient-to-br from-primary-200/30 via-blue-200/20 to-indigo-200/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 bg-gradient-to-tr from-purple-200/20 via-pink-200/10 to-rose-200/5 rounded-full blur-2xl" />
      </div>

      <div className="relative flex flex-col gap-4 px-4 py-4 sm:px-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 text-white shadow-lg shadow-primary-500/20 transition hover:shadow-xl hover:shadow-primary-500/30 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <div className="inline-flex items-center gap-2 mb-1 px-3 py-1 rounded-full bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100">
              <Sparkles className="h-3 w-3 text-primary-600" />
              <span className="text-[10px] font-bold text-primary-700 tracking-widest uppercase">Admin Panel</span>
            </div>
            <h1 className="font-display text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
              Operational Command Center
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
              A calm, modern workspace for services, approvals, bookings, and payouts.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 px-4 py-2.5 text-white shadow-lg shadow-primary-500/20 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                <Shield className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-primary-100 font-medium">Welcome</p>
                <p className="font-bold text-sm hidden sm:block">{user?.name}</p>
                <p className="font-bold text-xs sm:hidden">Admin</p>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Logout Button */}
          <button
            type="button"
            onClick={logout}
            className="flex lg:hidden items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </motion.div>
  );
}
