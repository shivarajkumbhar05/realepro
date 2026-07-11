import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { Loader2, Shield, AlertCircle, Home } from 'lucide-react';

// Loading component for route transitions
const RouteLoading = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Shield className="w-6 h-6 text-blue-600 animate-pulse" />
      </div>
    </div>
    <p className="text-gray-600 mt-4 text-sm font-medium">Verifying access...</p>
  </div>
);

// Access Denied Component
const AccessDenied = ({ role }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-red-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
          {role && <span className="block text-sm mt-1">Required role: <span className="font-semibold text-red-600 uppercase">{role}</span></span>}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-300"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Protected Route
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsChecking(false);
    }
  }, [loading]);

  if (loading || isChecking) {
    return <RouteLoading />;
  }

  if (!user) {
    // Save the attempted location for redirect after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// Admin Route - Only for Admin users
export function AdminRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsChecking(false);
    }
  }, [loading]);

  if (loading || isChecking) {
    return <RouteLoading />;
  }

  if (!user) {
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    return <AccessDenied role="Admin" />;
  }

  return <Outlet />;
}

// Agent Route - For Admin and Agent users
export function AgentRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsChecking(false);
    }
  }, [loading]);

  if (loading || isChecking) {
    return <RouteLoading />;
  }

  if (!user) {
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!['admin', 'agent'].includes(user.role)) {
    return <AccessDenied role="Agent or Admin" />;
  }

  return <Outlet />;
}

// Buyer Route - For Buyer, Agent, and Admin users
export function BuyerRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsChecking(false);
    }
  }, [loading]);

  if (loading || isChecking) {
    return <RouteLoading />;
  }

  if (!user) {
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Allow all authenticated users for buyer routes
  return <Outlet />;
}

// Public Only Route - Redirects to dashboard if already logged in
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsChecking(false);
    }
  }, [loading]);

  if (loading || isChecking) {
    return <RouteLoading />;
  }

  // Check if there's a redirect destination saved
  const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
  
  if (user) {
    // Clear the redirect after use
    sessionStorage.removeItem('redirectAfterLogin');
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}

// Route Guard with Permission Levels
export function RouteGuard({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsChecking(false);
    }
  }, [loading]);

  if (loading || isChecking) {
    return <RouteLoading />;
  }

  if (!user) {
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <AccessDenied role={allowedRoles.join(' or ')} />;
  }

  return children;
}

// Role-based Route Component
export const RoleRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteLoading />;
  }

  if (!user) {
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!roles.includes(user.role)) {
    return <AccessDenied role={roles.join(' or ')} />;
  }

  return children;
};

// Redirect based on user role
export function RoleBasedRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <RouteLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'agent':
      return <Navigate to="/agent/dashboard" replace />;
    case 'buyer':
    default:
      return <Navigate to="/buyer/dashboard" replace />;
  }
}

// Check if user has permission
export function useHasPermission(requiredRoles = []) {
  const { user } = useAuth();
  
  if (!user) return false;
  if (requiredRoles.length === 0) return true;
  
  return requiredRoles.includes(user.role);
}

// Export all routes as named exports
export default {
  ProtectedRoute,
  AdminRoute,
  AgentRoute,
  BuyerRoute,
  PublicOnlyRoute,
  RouteGuard,
  RoleRoute,
  RoleBasedRedirect,
  useHasPermission,
};