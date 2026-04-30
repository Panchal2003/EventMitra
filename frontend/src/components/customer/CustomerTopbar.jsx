import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LogOut,
  Menu,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/currency";
import logo from "/logo.png";

export function CustomerTopbar({ onMenuClick, isCartOpen, setIsCartOpen }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { cart, provider, getCartTotal, removeFromCart, clearCart } = useCart();
  const cartProvider = provider || cart[0]?.provider;
  const firstName = user?.name?.trim()?.split(" ")[0] || "Guest";
  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="relative shrink-0 overflow-hidden border-b border-slate-200/60 bg-white">
      <div className="relative flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Left Section - Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 150, damping: 20 }}
          className="flex items-center gap-3"
        >
           <Link to="/" className="flex items-center gap-3 group flex-1 min-w-0">
  
  <motion.div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-md">
    <img src={logo} className="h-10 w-10 object-contain" />
  </motion.div>

  <div className="flex-1 min-w-0">
    <p className="text-[15px] font-bold tracking-[0.24em] text-primary-600">
      EventMitra
    </p>

    <p className="truncate font-display text-lg font-bold text-slate-900">
      Client Dashboard
    </p>
  </div>

</Link>
        </motion.div>

        {/* Right Section - Cart & Profile */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 20 }}
          className="flex items-center gap-3"
        >
          {/* Cart Button - Desktop */}
          {isAuthenticated && user?.role === "customer" && cart.length > 0 && (
            <motion.button
              type="button"
              onClick={() => setIsCartOpen(true)}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="relative hidden items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/70 bg-white px-4 py-2.5 shadow-md transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-lg sm:flex"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 shadow-md shadow-primary-500/20">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
                <div className="text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-700">
                    Cart
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {cart.length} items · {formatCurrency(getCartTotal())}
                  </p>
                </div>
              <div className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1 text-[9px] font-bold text-white shadow-md">
                {cart.length}
              </div>
            </motion.button>
          )}

          {/* Cart Button - Mobile */}
          {isAuthenticated && user?.role === "customer" && cart.length > 0 && (
            <motion.button
              type="button"
              onClick={() => setIsCartOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 text-white shadow-lg shadow-primary-500/25 sm:hidden"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary-700 shadow-md">
                {cart.length}
              </span>
            </motion.button>
          )}

          {/* Profile/Login Section */}
          <AnimatePresence mode="wait">
            {isAuthenticated ? (
              <motion.div
                key="profile"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  to="/customer/profile"
                  className="group flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white px-3 py-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
                >
                  {user?.avatar ? (
                    <motion.img
                      src={user.avatar}
                      alt={user?.name || "Profile"}
                      className="h-9 w-9 rounded-lg object-cover ring-2 ring-primary-100"
                      whileHover={{ scale: 1.05 }}
                    />
                  ) : (
                    <motion.div
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 text-sm font-bold text-white shadow-md"
                      whileHover={{ scale: 1.05 }}
                    >
                      {userInitial}
                    </motion.div>
                  )}
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-600">
                      Welcome Back
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {firstName}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="login"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  to="/login"
                  className="group flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-blue-600 px-4 py-2.5 text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-semibold">Login</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </header>
  );
}