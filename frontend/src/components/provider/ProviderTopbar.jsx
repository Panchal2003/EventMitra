import { motion } from "framer-motion";
import { LogOut, Menu, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../common/Button";

export function ProviderTopbar({ onMenuClick }) {
  const { logout, user } = useAuth();
  const firstName = user?.name?.trim()?.split(" ")[0] || "Provider";
  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "P";

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

      <div className="relative flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
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
              <span className="text-[10px] font-bold text-primary-700 tracking-widest uppercase">Provider Dashboard</span>
            </div>
            <h1 className="font-display text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
              Daily Booking Workspace
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Accept requests, manage live jobs, verify OTPs, and track your earnings.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 px-4 py-2.5 text-white shadow-lg shadow-primary-500/20">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || "Provider"}
                className="h-10 w-10 rounded-xl object-cover ring-2 ring-white/20"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white ring-1 ring-white/20 backdrop-blur-sm">
                {userInitial}
              </div>
            )}
            <div>
              <p className="text-[10px] text-primary-100 font-medium">Welcome</p>
              <p className="font-bold text-sm">{user?.businessName || user?.name}</p>
              <p className="text-[10px] text-primary-100/90">{firstName}</p>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={logout} className="shadow-md hover:shadow-lg transition-all duration-300">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
