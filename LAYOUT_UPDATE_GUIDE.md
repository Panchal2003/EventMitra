# Mobile-First Layout Components Update Guide

This guide provides templates and instructions for updating the layout files to support mobile-first responsive design.

## 🎯 File Locations to Update

1. `src/layouts/CustomerLayout.jsx`
2. `src/layouts/AdminLayout.jsx`
3. `src/layouts/ProviderLayout.jsx`

## 📱 CustomerLayout.jsx - Mobile Drawer Navigation

[CURRENT STATE]: Desktop-first sidebar with top bar

[TARGET STATE]: Mobile-first with drawer navigation on mobile, sidebar on desktop

### Key Improvements:
- Drawer/Modal navigation on mobile
- Responsive top bar
- Better safe area handling
- Touch-friendly controls
- Professional styling

### Implementation:
```jsx
import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Button } from "../components/common/Button";
import logo from "/logo.png";

export function CustomerLayout() {
  const { isAuthenticated, user } = useAuth();
  const { cart } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const firstName = user?.name?.trim()?.split(" ")[0] || "Guest";

  return (
    <>
      <div className="min-h-screen flex flex-col bg-slate-50">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-elevation-1 safe-area-top">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <img src={logo} alt="Logo" className="h-full w-full p-1 object-contain" />
              </div>
              <span className="hidden sm:inline font-display font-bold text-slate-950">EventMitra</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Link to="/" className="px-4 py-2 text-slate-700 hover:text-primary-600 font-medium transition-colors">
                Home
              </Link>
              <Link to="/services" className="px-4 py-2 text-slate-700 hover:text-primary-600 font-medium transition-colors">
                Services
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {isAuthenticated && (
                <>
                  {/* Cart */}
                  <Link to="/cart" className="relative p-2 text-slate-600 hover:text-primary-600">
                    <ShoppingCart className="h-5 w-5" />
                    {cart.length > 0 && (
                      <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-danger-600 text-white text-xs flex items-center justify-center font-bold">
                        {cart.length}
                      </span>
                    )}
                  </Link>
                  
                  {/* Avatar */}
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {isDrawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDrawerOpen(false)}
                className="fixed inset-0 bg-black/50 z-30 md:hidden"
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed left-0 top-0 bottom-0 w-64 bg-white z-40 md:hidden flex flex-col"
              >
                {/* Close Button */}
                <div className="p-4 border-b border-slate-200">
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg w-full"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-4 space-y-2 px-4">
                  <Link
                    to="/"
                    onClick={() => setIsDrawerOpen(false)}
                    className="block px-4 py-2 rounded-lg hover:bg-slate-100 font-medium"
                  >
                    Home
                  </Link>
                  <Link
                    to="/services"
                    onClick={() => setIsDrawerOpen(false)}
                    className="block px-4 py-2 rounded-lg hover:bg-slate-100 font-medium"
                  >
                    Services
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setIsDrawerOpen(false)}
                    className="block px-4 py-2 rounded-lg hover:bg-slate-100 font-medium"
                  >
                    About Us
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setIsDrawerOpen(false)}
                    className="block px-4 py-2 rounded-lg hover:bg-slate-100 font-medium"
                  >
                    Contact
                  </Link>
                </nav>

                {/* User Section */}
                {isAuthenticated && (
                  <div className="border-t border-slate-200 p-4 space-y-2">
                    <p className="text-sm font-semibold text-slate-900">Hello, {firstName}!</p>
                    <Link
                      to="/customer/profile"
                      onClick={() => setIsDrawerOpen(false)}
                      className="block w-full"
                    >
                      <Button fullWidth variant="secondary" size="sm">
                        My Profile
                      </Button>
                    </Link>
                    <Link
                      to="/logout"
                      onClick={() => setIsDrawerOpen(false)}
                      className="block w-full"
                    >
                      <Button fullWidth variant="ghost" size="sm">
                        Logout
                      </Button>
                    </Link>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-24 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNav />
    </>
  );
}
```

## 🏢 AdminLayout.jsx -  Responsive Admin Dashboard

[TARGET]: Desktop sidebar + mobile drawer, responsive top bar

```jsx
import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, BarChart3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const adminMenuItems = [
  { to: "/admin", icon: BarChart3, label: "Dashboard", end: true },
  // ... add other menu items
];

export function AdminLayout() {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isActive = (path) => pathname === path || pathname.startsWith(path + "/");

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 h-screen sticky top-0 flex-col bg-white border-r border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h1 className="font-display font-bold text-xl text-slate-950">Admin Panel</h1>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-4">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                end={item.end}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  isActive(item.to)
                    ? "bg-primary-100 text-primary-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 shadow-elevation-1">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="font-display font-bold text-slate-950">Admin Panel</h1>
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              {isDrawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDrawerOpen(false)}
                className="fixed inset-0 bg-black/50 z-20 md:hidden"
              />

              <motion.nav
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="fixed left-0 top-12 bottom-0 w-64 bg-white z-30 md:hidden py-6 space-y-2 px-4 overflow-y-auto"
              >
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all ${
                        isActive(item.to)
                          ? "bg-primary-100 text-primary-700"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

## 🎤 ProviderLayout.jsx - Provider Dashboard Layout

Similar structure to AdminLayout but with provider-specific navigation and styling.

```jsx
// Use same pattern as AdminLayout but with provider menu items
// Replace "Admin Panel" with "Provider Dashboard"
// Update menu items to provider-specific routes
```

## ✨ Key Improvements Template

### Mobile-First Principles:
1. **Header**: Sticky, shadow, responsive
2. **Navigation**:
   - Mobile: Drawer/Modal
   - Desktop: Sidebar
3. **Safe Areas**: Implement env(safe-area-*)
4. **Touch Targets**: All minimum 44px
5. **Performance**: Smooth animations, optimized renders

### Responsive Breakpoints:
- **Mobile**: < 768px (drawer navigation)
- **Desktop**: ≥ 768px (sidebar + desktop layout)

### Animation Patterns:
- Drawer slides from left
- Overlay fades in/out
- Spring physics for smooth UX

## 🔄 Migration Checklist

- [ ] Update CustomerLayout with drawer navigation
- [ ] Update AdminLayout with responsive sidebar
- [ ] Update ProviderLayout with responsive design
- [ ] Add safe area support to all layouts
- [ ] Ensure navigation works on all devices
- [ ] Test on mobile, tablet, desktop
- [ ] Verify drawer opens/closes properly
- [ ] Check accessibility of navigation
- [ ] Test with keyboard navigation
- [ ] Verify animations are smooth
- [ ] Check mobile menu doesn't interfere with content
- [ ] Ensure proper z-index stacking

## 📊 Before & After Comparison

### Before (Desktop-First)
- Fixed desktop layout
- Mobile unfriendly
- No drawer navigation
- Poor touch UX
- Limited responsiveness

### After (Mobile-First)
- ✓ Mobile drawer navigation
- ✓ Responsive design
- ✓ Touch-friendly (44px+ targets)
- ✓ Smooth animations
- ✓ Professional UI
- ✓ Better UX on all devices
- ✓ Improved accessibility

## 🎯 Implementation Order

1. Update `CustomerLayout.jsx` first (most used)
2. Update `AdminLayout.jsx` second
3. Update `ProviderLayout.jsx` third
4. Test all navigation paths
5. Fine-tune animations and spacing

## 🚀 Quick Tips

- Use `hidden md:flex` for desktop-only
- Use `md:hidden` for mobile-only
- Always include safe area classes
- Add proper z-index for overlays/drawers
- Use AnimatePresence for enter/exit animations
- Test drawer gesture on actual mobile devices
- Consider keyboard navigation
