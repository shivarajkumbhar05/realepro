import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home, Building2, Users, CheckSquare, User, Settings,
  LogOut, Menu, X, ChevronDown, Bell, Search, ShoppingBag,
  ShieldCheck, Briefcase, HeartHandshake, PlusCircle,
  Star, MessageCircle, Calendar, FileText, BarChart3,
  Sun, Moon, ChevronRight, Sparkles,
  GitCompare, LayoutDashboard, Clock, TrendingUp, Eye,
  ThumbsUp, Crown, Zap, Rocket, Layers, Target
} from 'lucide-react';
import ChatbotWidget from '../chat/ChatbotWidget';
import { WhatsAppFloatingButton } from '../chat/WhatsAppButton';
import AuthFooter from '../layout/AuthFooter';
import { getNotifications } from '../../api/notifications';

const navConfig = {
  admin: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: null },
    { label: 'All Properties', path: '/properties', icon: Building2, badge: null },
    { label: 'Pending Approval', path: '/admin/pending', icon: Clock, badge: '12' },
    { label: 'Users', path: '/admin/users', icon: Users, badge: null },
    { label: 'Purchase Requests', path: '/purchases', icon: ShoppingBag, badge: '3' },
    { label: 'Analytics', path: '/admin/analytics', icon: TrendingUp, badge: null },
  ],
  agent: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: null },
    { label: 'Browse Listings', path: '/properties', icon: Search, badge: null },
    { label: 'My Listings', path: '/agent/my-listings', icon: Building2, badge: null },
    { label: 'Add Property', path: '/agent/my-listings/new', icon: PlusCircle, badge: 'new' },
    { label: 'Purchase Requests', path: '/purchases', icon: ShoppingBag, badge: null },
    { label: 'Analytics', path: '/agent/analytics', icon: BarChart3, badge: null },
  ],
  buyer: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: null },
    { label: 'Browse Properties', path: '/properties', icon: Building2, badge: null },
    { label: 'My Purchases', path: '/purchases', icon: ShoppingBag, badge: null },
    { label: 'Favorites', path: '/favorites', icon: Star, badge: null },
    { label: 'Compare', path: '/compare', icon: GitCompare, badge: null },
  ],
};

const portalMeta = {
  admin: {
    theme: 'theme-admin',
    label: 'Admin Control Room',
    Icon: ShieldCheck,
    gradient: 'from-indigo-600 to-purple-600',
    gradientLight: 'from-indigo-50 to-purple-50',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    shadow: 'shadow-indigo-500/20',
    badge: 'bg-indigo-100 text-indigo-700',
    hover: 'hover:bg-indigo-50',
    border: 'border-indigo-200/50'
  },
  agent: {
    theme: 'theme-agent',
    label: 'Agent Workspace',
    Icon: Briefcase,
    gradient: 'from-blue-600 to-cyan-600',
    gradientLight: 'from-blue-50 to-cyan-50',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    shadow: 'shadow-blue-500/20',
    badge: 'bg-blue-100 text-blue-700',
    hover: 'hover:bg-blue-50',
    border: 'border-blue-200/50'
  },
  buyer: {
    theme: 'theme-buyer',
    label: 'Buyer Portal',
    Icon: HeartHandshake,
    gradient: 'from-emerald-600 to-teal-600',
    gradientLight: 'from-emerald-50 to-teal-50',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    shadow: 'shadow-emerald-500/20',
    badge: 'bg-emerald-100 text-emerald-700',
    hover: 'hover:bg-emerald-50',
    border: 'border-emerald-200/50'
  },
};

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const nav = navConfig[user?.role] || navConfig.buyer;
  const meta = portalMeta[user?.role] || portalMeta.buyer;
  const PortalIcon = meta.Icon;

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let active = true;
    const loadNotifications = async () => {
      try {
        const { data } = await getNotifications();
        if (active) setNotifications(data.unreadCount || 0);
      } catch {
        if (active) setNotifications(0);
      }
    };
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

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
      user?.role === 'admin' ? 'bg-indigo-100 text-indigo-700' :
      user?.role === 'agent' ? 'bg-blue-100 text-blue-700' :
      'bg-emerald-100 text-emerald-700'
    }`}>
      {user?.role}
    </span>
  );

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    const segments = path.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    if (last === 'new') return 'Add New';
    return last?.charAt(0).toUpperCase() + last?.slice(1) || 'Dashboard';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 bg-gradient-to-r ${meta.gradient} rounded-2xl flex items-center justify-center shadow-lg ${meta.shadow} relative overflow-hidden group`}>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Building2 className="w-5 h-5 text-white relative z-10" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full blur-xl"></div>
          </div>
          <div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">PropEstate</span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              <PortalIcon className={`w-3 h-3 ${meta.text}`} />
              <span>{meta.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Summary */}
      <div className={`mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-r ${meta.gradientLight} dark:from-gray-800 dark:to-gray-700/50 border ${meta.border} dark:border-gray-700`}>
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-full bg-gradient-to-r ${meta.gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg ${meta.shadow} relative`}>
            {user?.name?.[0]?.toUpperCase()}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
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
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-3">
          Main Menu
        </p>
        {nav.map(({ label, path, icon: Icon, badge }) => {
          const active = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.75 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                active
                  ? `bg-gradient-to-r ${meta.gradient} text-white shadow-lg ${meta.shadow}`
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${
                active ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
              }`} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  active ? 'bg-white/20 text-white' : `${meta.badge}`
                }`}>
                  {badge}
                </span>
              )}
              {active && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}

        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700 my-4"></div>

        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-3">
          Account
        </p>
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            location.pathname === '/profile'
              ? `bg-gradient-to-r ${meta.gradient} text-white shadow-lg ${meta.shadow}`
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
          }`}
        >
          <User className="w-5 h-5" />
          Profile
        </Link>
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Logout
        </button>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">All systems go</span>
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            v2.0.0
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${meta.theme} flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-800/50 flex-shrink-0 shadow-2xl shadow-black/5">
        <SidebarContent />
      </aside>

      {/* Sidebar - mobile */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-white/20 dark:border-gray-800/50 z-40 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top bar */}
        <header className={`sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-800/50 px-4 py-3 flex items-center justify-between flex-shrink-0 transition-all duration-300 ${
          isScrolled ? 'shadow-lg shadow-black/5' : ''
        }`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {getPageTitle()}
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors relative"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg shadow-red-500/30 animate-pulse">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-gray-200/50 dark:border-gray-700/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                <RoleTag />
              </div>
              <div className="relative group">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${meta.gradient} flex items-center justify-center text-white font-bold shadow-lg ${meta.shadow} cursor-pointer transition-transform group-hover:scale-110 relative`}>
                  {user?.name?.[0]?.toUpperCase()}
                  <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gradient-to-br from-gray-50/50 via-white/50 to-gray-100/50 dark:from-gray-950/50 dark:via-gray-900/50 dark:to-gray-950/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t border-white/20 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-4 lg:px-6 py-4">
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