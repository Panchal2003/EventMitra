import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { BottomNav } from "../components/common/BottomNav";
import { useAuth } from "../context/AuthContext";
import { LogOut, Shield } from "lucide-react";
import logo from "/logo.png";

export function AdminLayout() {
  const { user, logout } = useAuth();
  const firstName = user?.name?.trim()?.split(" ")[0] || "Admin";

  return (
    <div 
      className="admin-shell flex h-screen overflow-hidden bg-slate-50"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Sidebar - Hidden on mobile, shown on md+ */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
          <header className="relative flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 shadow-sm backdrop-blur-lg">
          {/* Background Glow */}
          <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 opacity-30 blur-3xl"></div>
          
            <div className="relative flex w-full items-center justify-between gap-3">
            {/* Left: Logo - Always visible */}
            <Link to="/admin" className="flex items-center gap-2">
              <motion.div
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg sm:h-10 sm:w-10 sm:rounded-2xl"
                whileHover={{ rotate: 5, scale: 1.05 }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 p-1 shadow-md sm:h-10 sm:w-10">
                  <img src={logo} alt="EventMitra Logo" className="h-full w-full object-contain" />
                </div>
              </motion.div>
              <span className="font-display text-base font-bold text-slate-950 sm:text-xl">
                Admin Desk
              </span>
            </Link>

            {/* Right: Profile & Logout */}
            <div className="flex items-center gap-2">
              {/* Profile Display */}
              <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 px-3 py-2 sm:px-4 text-white shadow-lg">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] text-purple-200 font-medium">Admin</p>
                  <p className="font-bold text-sm">{firstName}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-red-200 bg-red-50 px-2.5 py-2 sm:px-3 text-red-600 font-semibold text-xs sm:text-sm shadow-sm hover:bg-red-100 hover:shadow-md transition-all duration-300"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>

        {/* Bottom Navigation for Mobile */}
        <BottomNav />
      </div>
    </div>
  );
}
