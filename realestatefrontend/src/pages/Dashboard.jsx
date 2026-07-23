import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../api/admin';
import { getProperties } from '../api/properties'; // Only import what exists
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
  GitCompare
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, Area, AreaChart, CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];
const GRADIENT_COLORS = ['#3b82f6', '#6366f1'];

// ─── Enhanced Stat Card ──────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = 'primary', trend, trendLabel, subtitle }) {
  const colorMap = {
    primary: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600 border-blue-100',
    green: 'from-emerald-500 to-emerald-600 bg-emerald-50 text-emerald-600 border-emerald-100',
    yellow: 'from-amber-500 to-amber-600 bg-amber-50 text-amber-600 border-amber-100',
    blue: 'from-indigo-500 to-indigo-600 bg-indigo-50 text-indigo-600 border-indigo-100',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-600 border-purple-100',
    pink: 'from-pink-500 to-pink-600 bg-pink-50 text-pink-600 border-pink-100',
    teal: 'from-teal-500 to-teal-600 bg-teal-50 text-teal-600 border-teal-100',
  };

  const shadowColor = color === 'primary' ? 'shadow-blue-500/20' :
    color === 'green' ? 'shadow-emerald-500/20' :
      color === 'yellow' ? 'shadow-amber-500/20' :
        color === 'blue' ? 'shadow-indigo-500/20' :
          color === 'purple' ? 'shadow-purple-500/20' :
            color === 'pink' ? 'shadow-pink-500/20' :
              'shadow-teal-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-transparent hover:-translate-y-1"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-gray-50 to-transparent rounded-full -translate-y-24 translate-x-24 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg ${shadowColor} group-hover:scale-110 transition-transform duration-300 relative`}>
            <Icon className="w-7 h-7 text-white" />
            {subtitle && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
              {trend && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Enhanced Property Card ──────────────────────────────────────────
function PropertyCard({ property, featured = false, compact = false }) {
  const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://realepro.onrender.com';

  const rawPath = property.images?.[0]?.path;
  const img = rawPath
    ? (rawPath.startsWith('http://') || rawPath.startsWith('https://')
      ? rawPath
      : `${BASE}${rawPath}`)
    : null;

  if (compact) {
    return (
      <Link to={`/properties/${property._id}`} className="group block">
        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02]">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow">
            {img ? (
              <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            ) : (
              <Building2 className="w-6 h-6 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            )}
            {featured && (
              <div className="absolute top-1 right-1 bg-yellow-400 text-white rounded-full p-0.5 shadow-lg">
                <Star className="w-2.5 h-2.5 fill-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {property.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-500 truncate">{property.location?.city || 'Unknown'}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-blue-600">₹{property.price?.toLocaleString()}</span>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-500">{property.bedrooms || 0} BHK</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/properties/${property._id}`} className="group block">
      <div className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${featured ? 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100/50 shadow-sm' : 'hover:bg-gray-50'
        }`}>
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow">
          {img ? (
            <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
          ) : (
            <Building2 className="w-8 h-8 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          )}
          {featured && (
            <div className="absolute top-1 right-1 bg-yellow-400 text-white rounded-full p-0.5 shadow-lg">
              <Star className="w-3 h-3 fill-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
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
            <span className="text-sm font-bold text-blue-600">₹{property.price?.toLocaleString()}</span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs text-gray-500">{property.bedrooms || 0} BHK</span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs text-gray-500">{property.area || 0} sq.ft</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}

// ─── Quick Action Card ──────────────────────────────────────────────
function QuickAction({ icon: Icon, label, description, color, link, onClick }) {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600 hover:shadow-blue-500/30 text-blue-600',
    green: 'from-emerald-500 to-emerald-600 hover:shadow-emerald-500/30 text-emerald-600',
    purple: 'from-purple-500 to-purple-600 hover:shadow-purple-500/30 text-purple-600',
    orange: 'from-orange-500 to-orange-600 hover:shadow-orange-500/30 text-orange-600',
    pink: 'from-pink-500 to-pink-600 hover:shadow-pink-500/30 text-pink-600',
    teal: 'from-teal-500 to-teal-600 hover:shadow-teal-500/30 text-teal-600',
  };

  return (
    <Link to={link} onClick={onClick} className="group block h-full">
      <motion.div
        whileHover={{ y: -4 }}
        className="relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-transparent h-full"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>

        <div className="relative z-10">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]} flex items-center justify-center shadow-lg mb-4 group-hover:shadow-xl transition-all group-hover:scale-110`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 group-hover:text-white transition-colors">{label}</h4>
          <p className="text-sm text-gray-500 group-hover:text-white/80 transition-colors mt-1">{description}</p>
          <div className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:text-white transition-colors">
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
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    yellow: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    pink: 'bg-pink-50 text-pink-600',
  };

  return (
    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
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

export default function Dashboard() {
  const { user, isAdmin, isAgent, isBuyer } = useAuth();
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [totalAgents, setTotalAgents] = useState(0);

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
          console.log('BUYER propsRes:', propsRes);
          console.log('BUYER statsRes:', statsRes);
          
          // Fix: Properly access the data
          setProperties(propsRes.data?.data || propsRes.data || []);
          setTotalProperties(statsRes.data?.data?.totalProperties || statsRes.data?.totalProperties || 0);
          setTotalAgents(statsRes.data?.data?.totalAgents || statsRes.data?.totalAgents || 0);
        } else {
          // agent or other roles
          const { data } = await getProperties({ limit: 5 });
          console.log('Agent properties data:', data);
          setProperties(data?.data || data || []);
          setTotalProperties(data?.pagination?.total || data?.total || 0);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
        // Set fallback values
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
        <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="w-8 h-8 text-blue-600 animate-pulse" />
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
      className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl shadow-blue-600/20"
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
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            <span className="text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
              {greeting}
            </span>
            <span className="text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-blue-100 text-sm md:text-base max-w-xl">
            Here's what's happening with your properties today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
            <Activity className="w-4 h-4 text-blue-200" />
            <span className="text-sm text-white/90">All Systems Operational</span>
          </div>
          {!isAdmin && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
              <Building2 className="w-4 h-4 text-blue-200" />
              <span className="text-sm text-white/90">{properties.length} {properties.length === 1 ? 'Listing' : 'Listings'}</span>
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
      <div className="space-y-8 pb-8">
        <WelcomeSection />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statData.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Properties by Type</h3>
                <p className="text-xs text-gray-400 mt-0.5">Distribution across categories</p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Last 30 days</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.propertiesByType.map(d => ({ name: d._id, count: d.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {stats.propertiesByType.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Properties by Status</h3>
                <p className="text-xs text-gray-400 mt-0.5">Current status distribution</p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Current</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
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
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Recent Properties</h3>
                <p className="text-xs text-gray-400 mt-0.5">Latest additions</p>
              </div>
              <Link to="/properties" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.recentProperties.slice(0, 4).map(p => (
                <PropertyCard key={p._id} property={p} compact />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Recent Users</h3>
                <p className="text-xs text-gray-400 mt-0.5">Newest members</p>
              </div>
              <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {stats.recentUsers.slice(0, 4).map(u => (
                <div key={u._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${u.role === 'admin' ? 'bg-red-50 text-red-700 border border-red-200' :
                    u.role === 'agent' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                    {u.role}
                  </span>
                </div>
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

    return (
      <div className="space-y-8 pb-8">
        <WelcomeSection />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard icon={Building2} label="My Listings" value={properties.length} color="blue" trend={10} trendLabel="This month" />
          <StatCard icon={Eye} label="Total Views" value={totalViews} color="primary" />
          <StatCard icon={ThumbsUp} label="Approved Properties" value={approvedCount} color="green" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <QuickAction
            icon={Plus}
            label="Add New Listing"
            description="List your property and reach thousands of buyers"
            color="blue"
            link="/agent/my-listings/new"
          />
          <QuickAction
            icon={Eye}
            label="View All Listings"
            description="Manage and track your property listings"
            color="purple"
            link="/agent/my-listings"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Recent Listings</h3>
              <p className="text-xs text-gray-400 mt-0.5">Your latest property listings</p>
            </div>
            <Link to="/agent/my-listings" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {properties.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium text-lg">No listings yet</p>
              <p className="text-gray-400 text-sm mt-1">Start by adding your first property</p>
              <Link to="/agent/my-listings/new" className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium shadow-lg shadow-blue-500/20">
                <Plus className="w-4 h-4" /> Add Listing
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {properties.slice(0, 5).map(p => (
                <PropertyCard key={p._id} property={p} featured={p.isApproved} />
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
      <div className="space-y-8 pb-8">
        <WelcomeSection />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <StatCard icon={Building2} label="Available Properties" value={totalProperties} color="blue" />
          <StatCard icon={Users} label="Total Agents" value={totalAgents} color="primary" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-600/20"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="text-sm font-medium text-emerald-100 bg-white/10 backdrop-blur-sm px-3 py-0.5 rounded-full">Featured</span>
              </div>
              <h3 className="text-2xl font-bold">Find Your Dream Property</h3>
              <p className="text-emerald-100 mt-1">Browse through verified listings from trusted agents</p>
            </div>
            <Link to="/properties" className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors shadow-lg hover:shadow-xl flex-shrink-0">
              <Eye className="w-5 h-5" /> Browse Properties
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Latest Listings</h3>
              <p className="text-xs text-gray-400 mt-0.5">Newest properties available</p>
            </div>
            <Link to="/properties" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mb-4">
                <Home className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium text-lg">No properties available</p>
              <p className="text-gray-400 text-sm mt-1">Check back later for new listings</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {properties.slice(0, 5).map(p => (
                <PropertyCard key={p._id} property={p} featured={true} />
              ))}
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <QuickAction
            icon={Heart}
            label="Your Favorites"
            description="View and manage your saved properties"
            color="pink"
            link="/favorites"
          />
          <QuickAction
            icon={GitCompare}
            label="Compare Properties"
            description="Compare properties side by side"
            color="teal"
            link="/compare"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Building2 className="w-12 h-12 text-gray-300" />
      </div>
      <p className="text-gray-500 font-medium">No dashboard available</p>
      <p className="text-gray-400 text-sm mt-1">Please contact support for assistance</p>
    </div>
  );
}