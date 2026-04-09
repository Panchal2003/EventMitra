import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { AdminLayout } from "./layouts/AdminLayout";
import { CustomerLayout } from "./layouts/CustomerLayout";
import { ProviderLayout } from "./layouts/ProviderLayout";
import { LoginPage } from "./pages/LoginPage";
import { CartProvider } from "./context/CartContext";
import { UIProvider } from "./context/UIContext";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    window.scrollTo(0, 0);
    
    const main = document.querySelector('main');
    if (main) {
      main.scrollTop = 0;
    }
    
    const scrollable = document.querySelector('.overflow-y-auto');
    if (scrollable) {
      scrollable.scrollTop = 0;
    }
  }, [pathname]);
  
  return null;
}

// Public Pages (now with CustomerLayout - sidebar)
import { HomePage } from "./pages/HomePage";
import { ServicesPage } from "./pages/public/ServicesPage";
import { ServiceDetailPage } from "./pages/public/ServiceDetailPage";
import { AboutPage } from "./pages/public/AboutPage";
import { ContactPage } from "./pages/public/ContactPage";
import { GalleryPage } from "./pages/public/GalleryPage";

// Admin Pages
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminServicesPage } from "./pages/admin/AdminServicesPage";
import { AdminProvidersPage } from "./pages/admin/AdminProvidersPage";
import { AdminCustomersPage } from "./pages/admin/AdminCustomersPage";
import { AdminBookingsPage } from "./pages/admin/AdminBookingsPage";
import { AdminPaymentsPage } from "./pages/admin/AdminPaymentsPage";
import { AdminGalleryPage } from "./pages/admin/AdminGalleryPage";

// Customer Pages
import { CustomerProfilePage } from "./pages/customer/CustomerProfilePage";
import { CustomerProviderServicesPage } from "./pages/customer/CustomerProviderServicesPage";
import { CustomerSupportPage } from "./pages/customer/CustomerSupportPage";

// Provider Pages
import { ProviderDashboardPage } from "./pages/provider/ProviderDashboardPage";
import { ProviderProfilePage } from "./pages/provider/ProviderProfilePage";
import { ProviderBookingsPage } from "./pages/provider/ProviderBookingsPage";
import { ProviderEarningsPage } from "./pages/provider/ProviderEarningsPage";
import { ProviderServicesPage } from "./pages/provider/ProviderServicesPage";

import { getDashboardPath } from "./utils/dashboardPath";

function HomeRedirect() {
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="glass-panel px-5 py-4 text-sm text-slate-600">Restoring your session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={getDashboardPath(user?.role)} replace />;
}

export default function App() {
  return (
    <UIProvider>
      <CartProvider>
        <ScrollToTop />
          <Routes>
        {/* Login Page - No Layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-login" element={<LoginPage adminBackdoor />} />

        {/* Main Site with Sidebar - All pages use CustomerLayout */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:serviceName" element={<ServiceDetailPage />} />
          <Route path="/provider/:providerId" element={<CustomerProviderServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          
          {/* Customer protected routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Navigate to="/customer/profile?tab=dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/services"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Navigate to="/customer/profile?tab=services" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/bookings"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Navigate to="/customer/profile?tab=bookings" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/support"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerSupportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Navigate to="/customer/profile" replace />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="providers" element={<AdminProvidersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="gallery" element={<AdminGalleryPage />} />
        </Route>

        {/* Provider Routes */}
        <Route
          path="/provider"
          element={
            <ProtectedRoute allowedRoles={["serviceProvider"]}>
              <ProviderLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProviderDashboardPage />} />
          <Route path="profile" element={<ProviderProfilePage />} />
          <Route path="bookings" element={<ProviderBookingsPage />} />
          <Route path="earnings" element={<ProviderEarningsPage />} />
          <Route path="services" element={<ProviderServicesPage />} />
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
      </CartProvider>
    </UIProvider>
  );
}
