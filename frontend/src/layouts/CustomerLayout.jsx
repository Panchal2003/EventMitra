import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CustomerSidebar } from "../components/customer/CustomerSidebar";
import { BottomNav } from "../components/common/BottomNav";
import { Modal } from "../components/common/Modal";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  ArrowRight,
  LogIn,
  ShoppingCart,
  Trash2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency } from "../utils/currency";
import logo from "/logo.png";

export function CustomerLayout() {
  const { isAuthenticated, user } = useAuth();
  const { cart, provider, getCartTotal, removeFromCart, clearCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartProvider = provider || cart[0]?.provider;
  const firstName = user?.name?.trim()?.split(" ")[0] || "Guest";
  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <div 
        className="customer-shell flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        {/* Sidebar - Hidden on mobile, shown on md+ */}
        <CustomerSidebar />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <header className="relative shrink-0 overflow-hidden border-b border-slate-200/60 bg-white/95 backdrop-blur-xl">
            {/* Decorative gradient background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-primary-100/50 via-blue-100/40 to-indigo-100/30 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-gradient-to-tr from-violet-100/40 via-purple-100/30 to-pink-100/20 blur-3xl" />
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary-400/60 to-transparent" />
            </div>

            <div className="relative flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 150, damping: 20 }}
                className="flex items-center gap-3"
              >
                <Link to="/" className="flex items-center gap-3 group">
                  <motion.div
                    className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg shadow-slate-200/50 border border-slate-100"
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <img src={logo} alt="EventMitra" className="relative h-8 w-8 object-contain" />
                  </motion.div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary-700">
                      EventMitra
                    </p>
                    <p className="hidden font-display text-lg font-bold text-slate-950 sm:block">
                      Customer Space
                    </p>
                    <p className="text-xs font-medium text-slate-500 sm:hidden">Bookings, profile and cart</p>
                  </div>
                </Link>
              </motion.div>

              {/* Right Section */}
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
                    className="relative hidden items-center gap-3 overflow-hidden rounded-2xl border border-primary-200/60 bg-gradient-to-r from-primary-50 via-white to-blue-50 px-4 py-2.5 shadow-md transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-lg sm:flex"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 shadow-md shadow-primary-500/20">
                      <ShoppingCart className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-600">
                        Cart
                      </p>
                      <p className="text-sm font-bold text-slate-800">
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
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Welcome back
                          </p>
                          <p className="text-sm font-bold text-slate-950">
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
                        <LogIn className="h-4 w-4" />
                        <span className="text-sm font-semibold">Login</span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
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

      <Modal
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Your Cart"
        description={
          cart.length > 0
            ? `${cart.length} service${cart.length !== 1 ? "s" : ""} selected for booking`
            : "No services added yet"
        }
        footer={
          cart.length > 0 ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={clearCart}
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                Clear Cart
              </button>

              {cartProvider?._id ? (
                <Link
                  to={`/provider/${cartProvider._id}`}
                  onClick={() => setIsCartOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Continue Booking
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          ) : null
        }
      >
        {cart.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 shadow-lg shadow-primary-500/25">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <p className="mt-4 text-base font-semibold text-slate-900">Your cart is empty</p>
            <p className="mt-2 text-sm text-slate-500">
              Add services from a provider page and they will appear here for quick checkout.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartProvider ? (
              <div className="rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-blue-50 px-4 py-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
                      Provider
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {cartProvider.businessName || cartProvider.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">All selected services are grouped under one provider.</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 shadow-md">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex items-start justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-950">{item.name}</p>
                    {item.category?.name ? (
                      <p className="mt-1 text-xs font-medium text-primary-700">
                        {item.category.name}
                      </p>
                    ) : null}
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
                      <Sparkles className="h-3.5 w-3.5 text-primary-600" />
                      Ready for booking
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-sm font-semibold text-slate-950">
                      {formatCurrency(item.startingPrice)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item._id)}
                      className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Total</span>
                <span className="font-display text-2xl font-black text-slate-950">
                  {formatCurrency(getCartTotal())}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
