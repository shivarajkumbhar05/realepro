import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home, Building2, Users, CheckSquare, User, Settings,
  LogOut, Menu, X, ChevronDown, Bell, Search, ShoppingBag, 
  ShieldCheck, Briefcase, HeartHandshake, PlusCircle,
  Star, MessageCircle, Calendar, FileText, BarChart3,
  Sun, Moon, ChevronRight, Sparkles,
  GitCompare // ✅ Add this import
} from 'lucide-react';
import ChatbotWidget from '../chat/ChatbotWidget';
import { WhatsAppFloatingButton } from '../chat/WhatsAppButton';
import AuthFooter from '../layout/AuthFooter';

const navConfig = {
  admin: [
    { label: 'Dashboard', path: '/dashboard', icon: Home, badge: null },
    { label: 'All Properties', path: '/properties', icon: Building2, badge: null },
    { label: 'Pending Approval', path: '/admin/pending', icon: CheckSquare, badge: 'new' },
    { label: 'Users', path: '/admin/users', icon: Users, badge: null },
    { label: 'Purchase Requests', path: '/purchases', icon: ShoppingBag, badge: null },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, badge: null },
  ],
  agent: [
    { label: 'Dashboard', path: '/dashboard', icon: Home, badge: null },
    { label: 'Browse Listings', path: '/properties', icon: Search, badge: null },
    { label: 'My Listings', path: '/agent/my-listings', icon: Building2, badge: null },
    { label: 'Add Property', path: '/agent/my-listings/new', icon: PlusCircle, badge: 'new' },
    { label: 'Purchase Requests', path: '/purchases', icon: ShoppingBag, badge: null },
    { label: 'Analytics', path: '/agent/analytics', icon: BarChart3, badge: null },
  ],
  buyer: [
    { label: 'Dashboard', path: '/dashboard', icon: Home, badge: null },
    { label: 'Browse Properties', path: '/properties', icon: Building2, badge: null },
    { label: 'My Purchases', path: '/purchases', icon: ShoppingBag, badge: null },
    { label: 'Favorites', path: '/favorites', icon: Star, badge: null },
    { label: 'Compare', path: '/compare', icon: GitCompare, badge: null }, // ✅ Now GitCompare is defined
  ],
};

const portalMeta = {
  admin: { 
    theme: 'theme-admin', 
    label: 'Admin Control Room', 
    Icon: ShieldCheck,
    gradient: 'from-red-600 to-red-700',
    bg: 'bg-red-50',
    text: 'text-red-600'
  },
  agent: { 
    theme: 'theme-agent', 
    label: 'Agent Workspace', 
    Icon: Briefcase,
    gradient: 'from-blue-600 to-blue-700',
    bg: 'bg-blue-50',
    text: 'text-blue-600'
  },
  buyer: { 
    theme: 'theme-buyer', 
    label: 'Buyer Portal', 
    Icon: HeartHandshake,
    gradient: 'from-emerald-600 to-emerald-700',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600'
  },
};

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const location = useLocation();
  const navigate = useNavigate();

  const nav = navConfig[user?.role] || navConfig.buyer;
  const meta = portalMeta[user?.role] || portalMeta.buyer;
  const PortalIcon = meta.Icon;

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const RoleTag = () => (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
      user?.role === 'admin' ? 'bg-red-100 text-red-700' :
      user?.role === 'agent' ? 'bg-blue-100 text-blue-700' :
      'bg-emerald-100 text-emerald-700'
    }`}>
      {user?.role}
    </span>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${meta.gradient} rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30`}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">PropEstate</span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary-700 dark:text-primary-400">
              <PortalIcon className="w-3 h-3" />
              {meta.label}
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Summary */}
      <div className="mx-4 mt-4 p-3 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-gray-800 dark:to-gray-700/50 border border-primary-200/50 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${meta.gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <RoleTag />
              <span className="text-xs text-gray-400 dark:text-gray-500">• Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
          Main Menu
        </p>
        {nav.map(({ label, path, icon: Icon, badge }) => {
          const active = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? `bg-gradient-to-r ${meta.gradient} text-white shadow-lg shadow-primary-500/30`
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${
                active ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
              }`} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  active ? 'bg-white/20 text-white' : 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
                }`}>
                  {badge}
                </span>
              )}
              {active && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}

        <div className="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>

        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
          Account
        </p>
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            location.pathname === '/profile'
              ? `bg-gradient-to-r ${meta.gradient} text-white shadow-lg`
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <User className="w-5 h-5" />
          Profile
        </Link>
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <div className="flex justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span>v2.0.0</span>
            <span>•</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${meta.theme} flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0 shadow-lg">
        <SidebarContent />
      </aside>

      {/* Sidebar - mobile */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <button 
          onClick={() => setSidebarOpen(false)} 
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
              {location.pathname === '/' ? 'Dashboard' : 
                location.pathname.split('/').pop()?.charAt(0).toUpperCase() + 
                location.pathname.split('/').pop()?.slice(1) || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 ml-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <RoleTag />
              </div>
              <div className="relative">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${meta.gradient} flex items-center justify-center text-white font-bold shadow-lg cursor-pointer`}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-950">
          {children}
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 lg:px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <AuthFooter dark={isDark} />
          </div>
        </footer>
      </div>

      {/* Global AI chatbot + WhatsApp support */}
      <ChatbotWidget />
      <WhatsAppFloatingButton />
    </div>
  );
}