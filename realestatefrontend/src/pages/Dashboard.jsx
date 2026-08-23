import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../api/admin';
import { getProperties } from '../api/properties';
import {
  Building2,
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  Plus,
  Eye,
  Home,
  UserPlus,
  ThumbsUp,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Activity,
  Calendar,
  MapPin,
  DollarSign,
  Star,
  ChevronRight,
  Heart,
  Shield,
  Award,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Settings,
  Bell,
  Search,
  Filter,
  Grid3x3,
  List,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  GitCompare,
  TrendingUp as TrendingUpIcon,
  Target,
  Rocket,
  Layers,
  Crown,
  Briefcase,
  CalendarDays,
  Clock as ClockIcon,
  BarChart,
  PieChart,
  LineChart,
  AreaChart,
  CreditCard,
  ShieldCheck,
  Store,
  Lightbulb,
  FileText,
  UsersRound,
  Handshake,
  Megaphone,
  BadgeCheck,
  CircleDollarSign
} from 'lucide-react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  LineChart as ReLineChart,
  Line,
  Area,
  AreaChart as ReAreaChart,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];
const GRADIENT_COLORS = ['#6366f1', '#8b5cf6'];

// ─── Theme Configuration ──────────────────────────────────────────────
const THEME = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryLight: '#818cf8',
  secondary: '#8b5cf6',
  accent: '#a855f7',
  gradient: 'from-indigo-500 via-purple-500 to-pink-500',
  gradientLight: 'from-indigo-50 via-purple-50 to-pink-50',
  shadow: 'shadow-indigo-500/20',
  cardBg: 'bg-white/80 backdrop-blur-xl',
  border: 'border-white/20',
  text: {
    primary: '#1e1b4b',
    secondary: '#6b7280',
    light: '#9ca3af',
  }
};

// ─── Enhanced Stat Card ──────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = 'primary', trend, trendLabel, subtitle, delay = 0 }) {
  const colorMap = {
    primary: 'from-indigo-500 to-purple-600 bg-indigo-50 text-indigo-600 border-indigo-100',
    green: 'from-emerald-500 to-teal-600 bg-emerald-50 text-emerald-600 border-emerald-100',
    yellow: 'from-amber-500 to-orange-600 bg-amber-50 text-amber-600 border-amber-100',
    blue: 'from-sky-500 to-blue-600 bg-sky-50 text-sky-600 border-sky-100',
    purple: 'from-purple-500 to-pink-600 bg-purple-50 text-purple-600 border-purple-100',
    pink: 'from-pink-500 to-rose-600 bg-pink-50 text-pink-600 border-pink-100',
    teal: 'from-teal-500 to-cyan-600 bg-teal-50 text-teal-600 border-teal-100',
    orange: 'from-orange-500 to-amber-600 bg-orange-50 text-orange-600 border-orange-100',
  };

  const shadowColor = color === 'primary' ? 'shadow-indigo-500/20' :
    color === 'green' ? 'shadow-emerald-500/20' :
      color === 'yellow' ? 'shadow-amber-500/20' :
        color === 'blue' ? 'shadow-sky-500/20' :
          color === 'purple' ? 'shadow-purple-500/20' :
            color === 'pink' ? 'shadow-pink-500/20' :
              color === 'orange' ? 'shadow-orange-500/20' :
                'shadow-teal-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="dashboard-stat group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-white/20 hover:border-indigo-200/50 hover:-translate-y-1"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-50 to-transparent rounded-full -translate-y-24 translate-x-24 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`dashboard-stat-icon w-14 h-14 rounded-2xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg ${shadowColor} group-hover:scale-110 transition-transform duration-300 relative`}>
            <Icon className="w-7 h-7 text-white" />
            {subtitle && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <div className="flex items-end gap-3">
              <p className="dashboard-stat-value text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {value ?? '—'}
              </p>
              {trend && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                  {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </span>
              )}
            </div>
            {trendLabel && (
              <p className="text-xs text-gray-400 mt-0.5">{trendLabel}</p>
            )}
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Enhanced Property Card ──────────────────────────────────────────
function PropertyCard({ property, featured = false, compact = false, onClick }) {
  const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://realepro.onrender.com';

  const rawPath = property.images?.[0]?.path;
  const img = rawPath
    ? (rawPath.startsWith('http://') || rawPath.startsWith('https://')
      ? rawPath
      : `${BASE}${rawPath}`)
    : null;

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(property);
    }
  };

  if (compact) {
    return (
      <Link to={`/properties/${property._id}`} className="group block" onClick={handleClick}>
        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-indigo-50/50 transition-all duration-300 hover:scale-[1.02]">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0 overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow">
            {img ? (
              <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            ) : (
              <Building2 className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            )}
            {featured && (
              <div className="absolute top-1 right-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full p-0.5 shadow-lg">
                <Star className="w-2.5 h-2.5 fill-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
              {property.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-500 truncate">{property.location?.city || 'Unknown'}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-indigo-600">₹{property.price?.toLocaleString()}</span>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-500">{property.bedrooms || 0} BHK</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/properties/${property._id}`} className="group block" onClick={handleClick}>
      <div className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${featured ? 'bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-200/50 shadow-sm' : 'hover:bg-indigo-50/30'
        }`}>
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0 overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow">
          {img ? (
            <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
          ) : (
            <Building2 className="w-8 h-8 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          )}
          {featured && (
            <div className="absolute top-1 right-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full p-0.5 shadow-lg">
              <Star className="w-3 h-3 fill-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                {property.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-500 truncate">{property.location?.city || 'Unknown'}</p>
              </div>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${property.isApproved
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
              {property.isApproved ? '✓ Approved' : '⏳ Pending'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-sm font-bold text-indigo-600">₹{property.price?.toLocaleString()}</span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs text-gray-500">{property.bedrooms || 0} BHK</span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs text-gray-500">{property.area || 0} sq.ft</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}

// ─── Quick Action Card ──────────────────────────────────────────────
function QuickAction({ icon: Icon, label, description, color, link, onClick, gradient }) {
  const colorMap = {
    blue: 'from-indigo-500 to-blue-600 hover:shadow-indigo-500/30 text-indigo-600',
    green: 'from-emerald-500 to-teal-600 hover:shadow-emerald-500/30 text-emerald-600',
    purple: 'from-purple-500 to-pink-600 hover:shadow-purple-500/30 text-purple-600',
    orange: 'from-orange-500 to-amber-600 hover:shadow-orange-500/30 text-orange-600',
    pink: 'from-pink-500 to-rose-600 hover:shadow-pink-500/30 text-pink-600',
    teal: 'from-teal-500 to-cyan-600 hover:shadow-teal-500/30 text-teal-600',
    indigo: 'from-indigo-600 to-purple-600 hover:shadow-indigo-500/30 text-indigo-600',
  };

  const gradientBg = gradient || colorMap[color]?.split(' ')[0] + ' ' + colorMap[color]?.split(' ')[1];

  return (
    <Link to={link} onClick={onClick} className="group block h-full">
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-white/20 hover:border-indigo-200/50 h-full"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientBg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>

        <div className="relative z-10">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]?.split(' ')[0] || 'from-indigo-500 to-purple-600'} ${colorMap[color]?.split(' ')[1] || ''} flex items-center justify-center shadow-lg mb-4 group-hover:shadow-xl transition-all group-hover:scale-110`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 group-hover:text-white transition-colors">{label}</h4>
          <p className="text-sm text-gray-500 group-hover:text-white/80 transition-colors mt-1">{description}</p>
          <div className="mt-3 flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:text-white transition-colors">
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ─── Activity Feed Item ──────────────────────────────────────────────
function ActivityItem({ icon: Icon, title, description, time, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-indigo-50 text-indigo-600',
    green: 'bg-emerald-50 text-emerald-600',
    yellow: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    pink: 'bg-pink-50 text-pink-600',
    teal: 'bg-teal-50 text-teal-600',
  };

  return (
    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-indigo-50/30 transition-all duration-200 group">
      <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <span className="text-xs text-gray-400 flex-shrink-0">{time}</span>
    </div>
  );
}

// ─── Dashboard Shell ──────────────────────────────────────────────────
export default function Dashboard() {
  const { user, isAdmin, isAgent, isBuyer } = useAuth();
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [totalAgents, setTotalAgents] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const dashboardRoleClass = isAdmin ? 'dashboard-admin' : isAgent ? 'dashboard-agent' : 'dashboard-buyer';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning 🌅');
    else if (hour < 17) setGreeting('Good Afternoon ☀️');
    else setGreeting('Good Evening 🌙');

    const load = async () => {
      try {
        if (isAdmin) {
          const { data } = await getDashboard();
          setStats(data.data);
        } else if (isBuyer) {
          const [propsRes, statsRes] = await Promise.all([
            getProperties({ limit: 5, sortBy: 'createdAt', order: 'desc' }),
            axios.get(`https://realepro.onrender.com/api/properties/stats`),
          ]);
          setProperties(propsRes.data?.data || propsRes.data || []);
          setTotalProperties(statsRes.data?.data?.totalProperties || statsRes.data?.totalProperties || 0);
          setTotalAgents(statsRes.data?.data?.totalAgents || statsRes.data?.totalAgents || 0);
        } else {
          const { data } = await getProperties({ limit: 5 });
          setProperties(data?.data || data || []);
          setTotalProperties(data?.pagination?.total || data?.total || 0);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
        setProperties([]);
        setTotalProperties(0);
        setTotalAgents(0);
      }
      setLoading(false);
    };
    load();
  }, [isAdmin, isBuyer]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="w-8 h-8 text-indigo-600 animate-pulse" />
        </div>
      </div>
      <p className="text-gray-500 mt-6 text-sm font-medium">Loading your dashboard...</p>
    </div>
  );

  // ─── Welcome Section ──────────────────────────────────────────────
  const WelcomeSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="dashboard-welcome relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-500/20"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-24 translate-x-24"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
        {/* Decorative circles */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-20 left-20 w-16 h-16 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            <span className="text-sm font-medium text-indigo-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
              {greeting}
            </span>
            <span className="text-sm font-medium text-indigo-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-indigo-100 text-sm md:text-base max-w-xl">
            Here's what's happening with your properties today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
            <Activity className="w-4 h-4 text-indigo-200" />
            <span className="text-sm text-white/90">All Systems Operational</span>
          </div>
          {!isAdmin && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
              <Building2 className="w-4 h-4 text-indigo-200" />
              <span className="text-sm text-white/90">{properties.length} {properties.length === 1 ? 'Listing' : 'Listings'}</span>
            </div>
          )}
          {isAdmin && stats && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
              <Users className="w-4 h-4 text-indigo-200" />
              <span className="text-sm text-white/90">{stats.stats.totalUsers} Users</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // ─── Admin Dashboard ──────────────────────────────────────────────
  if (isAdmin && stats) {
    const statData = [
      { icon: Users, label: 'Total Users', value: stats.stats.totalUsers, color: 'primary', trend: 12, trendLabel: 'vs last month' },
      { icon: Building2, label: 'Total Properties', value: stats.stats.totalProperties, color: 'blue', trend: 8, trendLabel: 'vs last month' },
      { icon: Clock, label: 'Pending Approvals', value: stats.stats.pendingApprovals, color: 'yellow', trend: -3, trendLabel: 'vs last month' },
      { icon: CheckCircle, label: 'Active Agents', value: stats.stats.totalAgents, color: 'green', trend: 5, trendLabel: 'vs last month' },
    ];

    return (
      <div className={`${dashboardRoleClass} dashboard-shell space-y-8 pb-8`}>
        <WelcomeSection />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statData.map((stat, index) => (
            <StatCard key={index} {...stat} delay={index * 0.1} />
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Properties by Type</h3>
                <p className="text-xs text-gray-400 mt-0.5">Distribution across categories</p>
              </div>
              <span className="text-xs text-gray-400 bg-indigo-50 px-3 py-1 rounded-full">Last 30 days</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <ReBarChart data={stats.propertiesByType.map(d => ({ name: d._id, count: d.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {stats.propertiesByType.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Properties by Status</h3>
                <p className="text-xs text-gray-400 mt-0.5">Current status distribution</p>
              </div>
              <span className="text-xs text-gray-400 bg-indigo-50 px-3 py-1 rounded-full">Current</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <RePieChart>
                <Pie
                  data={stats.propertiesByStatus.map(d => ({ name: d._id, value: d.count }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats.propertiesByStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </RePieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Recent Properties</h3>
                <p className="text-xs text-gray-400 mt-0.5">Latest additions</p>
              </div>
              <Link to="/properties" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.recentProperties.slice(0, 4).map((p, i) => (
                <PropertyCard key={p._id} property={p} compact />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Recent Users</h3>
                <p className="text-xs text-gray-400 mt-0.5">Newest members</p>
              </div>
              <Link to="/admin/users" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {stats.recentUsers.slice(0, 4).map((u, i) => (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${u.role === 'admin' ? 'bg-red-50 text-red-700 border border-red-200' :
                    u.role === 'agent' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                    {u.role}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Agent Dashboard ──────────────────────────────────────────────
  if (isAgent) {
    const totalViews = properties.reduce((acc, p) => acc + (p.views || 0), 0);
    const approvedCount = properties.filter(p => p.isApproved).length;
    const pendingCount = properties.filter(p => !p.isApproved).length;

    const quickActions = [
      {
        icon: Plus,
        label: 'Add New Listing',
        description: 'List your property and reach thousands of buyers',
        color: 'indigo',
        link: '/agent/my-listings/new'
      },
      {
        icon: Eye,
        label: 'View All Listings',
        description: 'Manage and track your property listings',
        color: 'purple',
        link: '/agent/my-listings'
      },
      {
        icon: BarChart3,
        label: 'Analytics',
        description: 'Track performance of your listings',
        color: 'teal',
        link: '/agent/analytics'
      },
      {
        icon: MessageCircle,
        label: 'Messages',
        description: 'Connect with potential buyers',
        color: 'pink',
        link: '/agent/messages'
      }
    ];

    return (
      <div className={`${dashboardRoleClass} dashboard-shell space-y-8 pb-8`}>
        <WelcomeSection />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon={Building2} label="My Listings" value={properties.length} color="blue" trend={10} trendLabel="This month" delay={0} />
          <StatCard icon={Eye} label="Total Views" value={totalViews} color="primary" delay={0.1} />
          <StatCard icon={ThumbsUp} label="Approved Properties" value={approvedCount} color="green" delay={0.2} />
          <StatCard icon={Clock} label="Pending Approval" value={pendingCount} color="yellow" delay={0.3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {quickActions.map((action, index) => (
            <QuickAction
              key={index}
              {...action}
              gradient={`from-${action.color}-500 to-${action.color === 'indigo' ? 'purple' : action.color === 'purple' ? 'pink' : action.color === 'teal' ? 'cyan' : 'rose'}-600`}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-2xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Recent Listings</h3>
              <p className="text-xs text-gray-400 mt-0.5">Your latest property listings</p>
            </div>
            <Link to="/agent/my-listings" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {properties.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-12 h-12 text-indigo-300" />
              </div>
              <p className="text-gray-500 font-medium text-lg">No listings yet</p>
              <p className="text-gray-400 text-sm mt-1">Start by adding your first property</p>
              <Link to="/agent/my-listings/new" className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors text-sm font-medium shadow-lg shadow-indigo-500/20">
                <Plus className="w-4 h-4" /> Add Listing
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {properties.slice(0, 5).map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <PropertyCard key={p._id} property={p} featured={p.isApproved} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // ─── Buyer Dashboard ──────────────────────────────────────────────
  if (isBuyer) {
    return (
      <div className={`${dashboardRoleClass} dashboard-shell space-y-6 pb-8`}>
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-emerald-950 p-6 text-white shadow-xl shadow-emerald-950/10 sm:p-8"
        >
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[36px] border-emerald-500/20" />
          <div className="absolute -bottom-28 right-24 h-56 w-56 rounded-full border-[28px] border-teal-400/10" />
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-emerald-200">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>{greeting}, {user?.name?.split(' ')[0] || 'there'}</span>
            </div>
            <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">A better place to begin your property search.</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-100/80 sm:text-base">Explore verified homes, compare your favourites, and connect with trusted agents in one place.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/properties" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-50">
                <Search className="h-4 w-4" /> Explore properties
              </Link>
              <Link to="/favorites" className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-900/50 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800">
                <Heart className="h-4 w-4" /> View favourites
              </Link>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard icon={Building2} label="Available Properties" value={totalProperties} color="green" delay={0} />
          <StatCard icon={Users} label="Trusted Agents" value={totalAgents} color="teal" delay={0.1} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.75fr)]">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Fresh on the market</p>
                <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Latest listings</h3>
              </div>
              <Link to="/properties" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400">
                See all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {properties.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-center dark:border-gray-700">
                <Home className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                <p className="font-medium text-gray-600 dark:text-gray-300">No properties available</p>
                <p className="mt-1 text-sm text-gray-400">Check back later for new listings.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {properties.slice(0, 5).map((property, index) => (
                  <motion.div key={property._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <PropertyCard property={property} featured />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/60 sm:p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Your shortcuts</p>
            <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Keep moving</h3>
            <div className="mt-5 space-y-3">
              <Link to="/compare" className="group flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition-transform hover:-translate-y-0.5 dark:bg-gray-900">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40"><GitCompare className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-gray-900 dark:text-white">Compare homes</span><span className="block text-xs text-gray-500">Make a confident choice</span></span>
                <ChevronRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/purchases" className="group flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition-transform hover:-translate-y-0.5 dark:bg-gray-900">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"><FileText className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-gray-900 dark:text-white">Purchase requests</span><span className="block text-xs text-gray-500">Track your activity</span></span>
                <ChevronRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/profile" className="group flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition-transform hover:-translate-y-0.5 dark:bg-gray-900">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/40"><UserIcon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-gray-900 dark:text-white">Complete your profile</span><span className="block text-xs text-gray-500">Help agents reach you</span></span>
                <ChevronRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.aside>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
        <Building2 className="w-12 h-12 text-indigo-300" />
      </div>
      <p className="text-gray-500 font-medium">No dashboard available</p>
      <p className="text-gray-400 text-sm mt-1">Please contact support for assistance</p>
    </div>
  );
}