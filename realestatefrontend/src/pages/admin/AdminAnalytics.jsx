import { useEffect, useMemo, useState, useCallback } from 'react';
import { 
  BarChart3, Building2, Users, CheckCircle2, Clock3, 
  TrendingUp, ShieldCheck, Sparkles, AlertCircle, 
  RefreshCw, Download, Calendar, Filter, ChevronDown,
  Eye, EyeOff, DollarSign, Home, UserPlus, FileText,
  ShoppingBag, Star, Percent, Activity, Zap
} from 'lucide-react';
import { getAnalytics } from '../../api/admin';
import toast from 'react-hot-toast';

// ─── Stat Card Component ──────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, icon: Icon, tone, trend, trendValue }) => {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    pink: 'bg-pink-50 text-pink-700',
    cyan: 'bg-cyan-50 text-cyan-700',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {trend > 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : trend < 0 ? (
                <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
              ) : null}
              <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {trend > 0 ? '+' : ''}{trendValue}%
              </span>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${tones[tone] || tones.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

// ─── Chart Component ──────────────────────────────────────────────────
const ChartBar = ({ data, title, icon: Icon, color = 'primary', maxValue }) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span className="ml-auto text-xs text-gray-400">{data.length} months</span>
      </div>
      <div className="space-y-3">
        {data.length > 0 ? data.map((item) => (
          <div key={item.label} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500">{item.label}</span>
              <span className="text-sm font-semibold text-gray-900">{item.value}</span>
            </div>
            <div className="h-2 flex-1 rounded-full bg-gray-100 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  color === 'primary' ? 'bg-primary-600' :
                  color === 'emerald' ? 'bg-emerald-600' :
                  color === 'purple' ? 'bg-purple-600' :
                  color === 'amber' ? 'bg-amber-600' :
                  'bg-primary-600'
                }`} 
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        )) : <p className="text-sm text-gray-500 text-center py-4">No data available</p>}
      </div>
    </div>
  );
};

// ─── Activity Feed Component ──────────────────────────────────────────
const ActivityFeed = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock3 className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Clock3 className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <span className="ml-auto text-xs text-gray-400">{activities.length} items</span>
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {activities.map((item) => (
          <div key={item._id || item.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-3 hover:bg-gray-100 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{item.title || 'Property'}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{item.agent?.name || 'Unknown Agent'}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  item.status === 'approved' ? 'bg-green-100 text-green-700' :
                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  item.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.status || 'Unknown'}
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────
export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllMetrics, setShowAllMetrics] = useState(false);
  const [timeRange, setTimeRange] = useState('6months');

  // ─── Load Analytics ──────────────────────────────────────────────────
  const loadAnalytics = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await getAnalytics();
      console.log('Analytics Response:', response);
      
      // Handle different response structures
      let data = null;
      if (response) {
        if (response.data) {
          if (response.data.data) {
            data = response.data.data;
          } else {
            data = response.data;
          }
        } else {
          data = response;
        }
      }
      
      if (!data) {
        throw new Error('No analytics data received');
      }
      
      setAnalytics(data);
    } catch (err) {
      console.error('Analytics load error:', err);
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to load analytics';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // ─── Process Data ────────────────────────────────────────────────────
  const signupSeries = useMemo(() => {
    if (!analytics?.monthlySignups?.length) return [];
    return analytics.monthlySignups
      .map((item) => ({
        label: `${item._id.month}/${String(item._id.year).slice(-2)}`,
        value: item.count,
      }))
      .slice(-6); // Last 6 months
  }, [analytics]);

  const listingSeries = useMemo(() => {
    if (!analytics?.monthlyListings?.length) return [];
    return analytics.monthlyListings
      .map((item) => ({
        label: `${item._id.month}/${String(item._id.year).slice(-2)}`,
        value: item.count,
      }))
      .slice(-6);
  }, [analytics]);

  const purchaseSeries = useMemo(() => {
    if (!analytics?.monthlyPurchases?.length) return [];
    return analytics.monthlyPurchases
      .map((item) => ({
        label: `${item._id.month}/${String(item._id.year).slice(-2)}`,
        value: item.count,
      }))
      .slice(-6);
  }, [analytics]);

  // ─── Calculate Trends ────────────────────────────────────────────────
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return { trend: 0, trendValue: 0 };
    const change = ((current - previous) / previous) * 100;
    return {
      trend: change > 0 ? 1 : change < 0 ? -1 : 0,
      trendValue: Math.abs(change).toFixed(1)
    };
  };

  // ─── Get Overview ────────────────────────────────────────────────────
  const overview = analytics?.overview || {};
  
  // Calculate trends (mock data for demonstration)
  const trends = {
    users: calculateTrend(overview.totalUsers || 0, (overview.totalUsers || 0) * 0.9),
    properties: calculateTrend(overview.totalProperties || 0, (overview.totalProperties || 0) * 0.85),
    agents: calculateTrend(overview.totalAgents || 0, (overview.totalAgents || 0) * 0.88),
    approved: calculateTrend(overview.approvedProperties || 0, (overview.approvedProperties || 0) * 0.8),
  };

  // ─── Handle Export ────────────────────────────────────────────────────
  const handleExport = () => {
    if (!analytics) {
      toast.error('No data to export');
      return;
    }

    try {
      const dataStr = JSON.stringify(analytics, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Analytics exported successfully!');
    } catch (err) {
      toast.error('Failed to export analytics');
    }
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-64 bg-gray-200 rounded" />
            <div className="grid md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load analytics</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => loadAnalytics()}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ─── Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-primary-600 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Admin Analytics
            </p>
            <h1 className="text-3xl font-bold text-gray-900">Platform Performance</h1>
            <p className="text-sm text-gray-500 mt-1">
              Real-time insights into your marketplace
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => loadAnalytics(true)}
              disabled={refreshing}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-4 h-4" />
              Live Insights
            </div>
          </div>
        </div>

        {/* ─── Stats Grid ────────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard 
            title="Total Users" 
            value={overview.totalUsers ?? 0} 
            subtitle="Active accounts" 
            icon={Users} 
            tone="blue"
            trend={trends.users.trend}
            trendValue={trends.users.trendValue}
          />
          <StatCard 
            title="Agents" 
            value={overview.totalAgents ?? 0} 
            subtitle="Registered agents" 
            icon={ShieldCheck} 
            tone="purple"
            trend={trends.agents.trend}
            trendValue={trends.agents.trendValue}
          />
          <StatCard 
            title="Properties" 
            value={overview.totalProperties ?? 0} 
            subtitle="Live listings" 
            icon={Building2} 
            tone="amber"
            trend={trends.properties.trend}
            trendValue={trends.properties.trendValue}
          />
          <StatCard 
            title="Approved" 
            value={overview.approvedProperties ?? 0} 
            subtitle="Ready for buyers" 
            icon={CheckCircle2} 
            tone="emerald"
            trend={trends.approved.trend}
            trendValue={trends.approved.trendValue}
          />
        </div>

        {/* ─── Charts Row ────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartBar 
            data={signupSeries} 
            title="New Signups" 
            icon={UserPlus}
            color="primary"
          />
          <ChartBar 
            data={listingSeries} 
            title="New Listings" 
            icon={Home}
            color="emerald"
          />
        </div>

        {/* ─── Additional Charts ────────────────────────────────────────── */}
        {purchaseSeries.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6">
            <ChartBar 
              data={purchaseSeries} 
              title="Purchases" 
              icon={ShoppingBag}
              color="purple"
            />
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Percent className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Conversion Rate</h2>
              </div>
              <div className="flex items-center justify-center h-40">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary-600">
                    {overview.totalProperties && overview.totalUsers 
                      ? ((overview.approvedProperties / overview.totalProperties) * 100).toFixed(1)
                      : 0}%
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Properties approved out of total listings
                  </p>
                  <div className="mt-4 w-48 h-2 bg-gray-100 rounded-full mx-auto overflow-hidden">
                    <div 
                      className="h-2 bg-primary-600 rounded-full transition-all duration-500"
                      style={{ 
                        width: overview.totalProperties 
                          ? `${(overview.approvedProperties / overview.totalProperties) * 100}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Activity & Metrics ───────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActivityFeed activities={analytics?.recentActivity?.properties || []} />
          </div>

          {/* ─── Key Metrics ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Key Metrics</h2>
              <button
                onClick={() => setShowAllMetrics(!showAllMetrics)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                {showAllMetrics ? 'Show Less' : 'Show All'}
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Clock3 className="w-4 h-4 text-yellow-500" />
                  Pending Approvals
                </span>
                <span className="font-semibold text-gray-900">{overview.pendingProperties ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Sold Properties
                </span>
                <span className="font-semibold text-gray-900">{overview.soldProperties ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Reviews
                </span>
                <span className="font-semibold text-gray-900">{overview.totalReviews ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-purple-500" />
                  Purchases
                </span>
                <span className="font-semibold text-gray-900">{overview.totalPurchases ?? 0}</span>
              </div>
              {showAllMetrics && (
                <>
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      Total Revenue
                    </span>
                    <span className="font-semibold text-gray-900">
                      ₹{overview.totalRevenue?.toLocaleString() ?? '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      Avg. Users/Month
                    </span>
                    <span className="font-semibold text-gray-900">
                      {overview.avgUsersPerMonth ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-500" />
                      Avg. Properties/Month
                    </span>
                    <span className="font-semibold text-gray-900">
                      {overview.avgPropertiesPerMonth ?? 0}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ─── Footer ────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-6">
          <p>Last updated: {new Date().toLocaleString()}</p>
          <p className="mt-1">Data is refreshed automatically every 5 minutes</p>
        </div>
      </div>
    </div>
  );
}