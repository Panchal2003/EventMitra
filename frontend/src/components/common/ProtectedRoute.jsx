import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="glass-panel flex items-center gap-3 px-5 py-4 text-sm text-slate-600">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary-500" />
          Restoring your session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

