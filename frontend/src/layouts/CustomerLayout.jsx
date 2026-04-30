import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { CustomerSidebar } from "../components/customer/CustomerSidebar";
import { CustomerTopbar } from "../components/customer/CustomerTopbar";
import { BottomNav } from "../components/common/BottomNav";
import { Modal } from "../components/common/Modal";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  ArrowRight,
  ShoppingCart,
  Trash2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency } from "../utils/currency";

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
         className="customer-shell flex h-screen overflow-hidden bg-slate-50"
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
          <CustomerTopbar
            onMenuClick={() => {}}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
          />

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
