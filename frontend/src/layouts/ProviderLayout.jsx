import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ProviderSidebar } from "../components/provider/ProviderSidebar";
import { BottomNav } from "../components/common/BottomNav";
import { useAuth } from "../context/AuthContext";
import logo from "/logo.png";

export function ProviderLayout() {
  const { user } = useAuth();
  const firstName = user?.name?.trim()?.split(" ")[0] || "Profile";
  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "P";

  return (
    <div 
      className="flex h-screen overflow-hidden bg-slate-50"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Sidebar - Hidden on mobile, shown on md+ */}
      <ProviderSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="relative flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 shadow-sm backdrop-blur-lg">
          {/* Background Glow */}
          <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 opacity-30 blur-3xl"></div>
          
          <div className="relative flex w-full items-center justify-between">
            {/* Left: Logo - Always visible */}
            <Link to="/provider" className="flex items-center gap-2">
              <motion.div
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg sm:h-10 sm:w-10 sm:rounded-2xl"
                whileHover={{ rotate: 5, scale: 1.05 }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 p-1 shadow-md sm:h-10 sm:w-10">
                  <img src={logo} alt="EventMitra Logo" className="h-full w-full object-contain" />
                </div>
              </motion.div>
              <span className="font-display text-base font-bold text-slate-950 sm:text-xl">
                Expert Desk
              </span>
            </Link>

            {/* Right: Profile button */}
            <div className="flex items-center gap-2">
              <Link
                to="/provider/profile"
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 px-2 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:shadow-md sm:rounded-2xl sm:px-4 sm:py-2"
              >
                {user?.avatar ? (
                  <motion.img
                    src={user.avatar}
                    alt={user?.name || "Provider"}
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200 sm:h-9 sm:w-9"
                    whileHover={{ scale: 1.04 }}
                  />
                ) : (
                  <motion.div
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white sm:h-7 sm:w-7"
                    whileHover={{ rotate: 10 }}
                  >
                    <span className="text-[10px] font-bold sm:text-xs">
                      {userInitial}
                    </span>
                  </motion.div>
                )}
                <span className="hidden sm:inline">
                  {firstName}
                </span>
              </Link>
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
