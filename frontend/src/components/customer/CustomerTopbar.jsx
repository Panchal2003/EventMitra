import { motion } from "framer-motion";
import { LogOut, Menu, Sparkles, Bell, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../common/Button";

export function CustomerTopbar({ onMenuClick }) {
  const { logout, user } = useAuth();
  const firstName = user?.name?.trim()?.split(" ")[0] || "Guest";
  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="relative mb-6 overflow-hidden rounded-2xl border border-white/60 bg-white/80 backdrop-blur-2xl shadow-xl shadow-slate-200/20"
    >
      {/* Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 h-40 w-40 bg-gradient-to-br from-primary-200/30 via-blue-200/20 to-indigo-200/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 bg-gradient-to-tr from-purple-200/20 via-pink-200/10 to-rose-200/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative flex h-full items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={onMenuClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 text-white shadow-lg shadow-primary-500/20 transition hover:shadow-xl hover:shadow-primary-500/30 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </motion.button>

          <div className="min-w-0 flex-1">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-1 px-3 py-1 rounded-full bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100"
            >
              <Sparkles className="h-3 w-3 text-primary-600" />
              <span className="text-[10px] font-bold text-primary-700 tracking-widest uppercase">Customer Dashboard</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-xl font-black tracking-tight text-slate-950 sm:text-2xl"
            >
              Customer Spac
            </motion.h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 text-slate-600 shadow-lg shadow-slate-200/20 hover:bg-white hover:text-primary-600 transition-all duration-300"
          >
            <Search className="h-4 w-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 text-slate-600 shadow-lg shadow-slate-200/20 hover:bg-white hover:text-primary-600 transition-all duration-300"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
              3
            </span>
          </motion.button>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 rounded-xl border border-white/60 bg-white/90 backdrop-blur-sm px-4 py-2.5 shadow-lg shadow-slate-200/20"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || "Customer"}
                className="h-10 w-10 rounded-xl object-cover ring-2 ring-primary-200"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 text-sm font-bold text-white shadow-lg shadow-primary-500/25">
                {userInitial}
              </div>
            )}

            <div className="hidden sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Welcome Back
              </p>
              <p className="font-bold text-slate-900">{firstName}</p>
            </div>
          </motion.div>

          <div className="shrink-0">
            <Button variant="secondary" size="sm" onClick={logout} className="shadow-md hover:shadow-lg transition-all duration-300">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
