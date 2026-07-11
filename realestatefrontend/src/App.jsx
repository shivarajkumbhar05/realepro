// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { CompareProvider } from './context/CompareContext';
import { ProtectedRoute, AdminRoute, AgentRoute, PublicOnlyRoute } from './components/auth/RouteGuards';
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgetPassword';

// Dashboard
import Dashboard from './pages/Dashboard';

// Buyer Pages
import PropertyList from './pages/buyer/PropertyList';
import PropertyDetail from './pages/buyer/PropertyDetail';
import Favorites from './pages/buyer/Favorites';
import Compare from './pages/buyer/Compare';

// Agent Pages
import PropertyForm from './pages/agent/PropertyForm';
import MyListings from './pages/agent/MyListings';

// Admin Pages
import AdminUsers from './pages/admin/AdminUsers';
import AdminPending from './pages/admin/AdminPending';

// Shared Pages
import Profile from './pages/Profile';
import Purchases from './pages/Purchases';

// Public Pages
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Terms from './pages/public/Terms';
import Privacy from './pages/public/Privacy';
import Home from './pages/public/Home';

// Layout wrapper component
function AppLayout({ children }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <CompareProvider>
            <Toaster 
              position="top-right" 
              toastOptions={{ 
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }} 
            />
            
            <Routes>
              {/* Public Routes - Only accessible when NOT logged in */}
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>

              {/* Public Landing Page - Accessible to everyone */}
              <Route path="/" element={<Home />} />

              {/* Public Info Pages - Accessible to everyone */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />

              {/* Protected Routes - Require authentication */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
                <Route path="/purchases" element={<AppLayout><Purchases /></AppLayout>} />
                
                {/* Buyer Routes */}
                <Route path="/properties" element={<AppLayout><PropertyList /></AppLayout>} />
                <Route path="/properties/:id" element={<AppLayout><PropertyDetail /></AppLayout>} />
                <Route path="/favorites" element={<AppLayout><Favorites /></AppLayout>} />
                <Route path="/compare" element={<AppLayout><Compare /></AppLayout>} />

                {/* Agent Routes - Require agent or admin role */}
                <Route element={<AgentRoute />}>
                  <Route path="/agent/my-listings" element={<AppLayout><MyListings /></AppLayout>} />
                  <Route path="/agent/my-listings/new" element={<AppLayout><PropertyForm /></AppLayout>} />
                  <Route path="/agent/my-listings/:id/edit" element={<AppLayout><PropertyForm /></AppLayout>} />
                </Route>

                {/* Admin Routes - Require admin role */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin/users" element={<AppLayout><AdminUsers /></AppLayout>} />
                  <Route path="/admin/pending" element={<AppLayout><AdminPending /></AppLayout>} />
                </Route>
              </Route>

              {/* 404 - Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CompareProvider>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}