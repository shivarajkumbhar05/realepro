import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Building2, Users, CheckCircle2, Clock3, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';
import { getAnalytics } from '../../api/admin';

const StatCard = ({ title, value, subtitle, icon: Icon, tone }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${tone}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const { data } = await getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Analytics load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const signupSeries = useMemo(() => {
    if (!analytics?.monthlySignups?.length) return [];
    return analytics.monthlySignups.map((item) => ({
      label: `${item._id.month}/${String(item._id.year).slice(-2)}`,
      value: item.count,
    }));
  }, [analytics]);

  const listingSeries = useMemo(() => {
    if (!analytics?.monthlyListings?.length) return [];
    return analytics.monthlyListings.map((item) => ({
      label: `${item._id.month}/${String(item._id.year).slice(-2)}`,
      value: item.count,
    }));
  }, [analytics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const overview = analytics?.overview || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-primary-600 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Admin analytics
            </p>
            <h1 className="text-3xl font-bold text-gray-900">Platform performance overview</h1>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-4 h-4" />
            Live marketplace insights
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total users" value={overview.totalUsers ?? 0} subtitle="Active accounts" icon={Users} tone="bg-blue-50 text-blue-700" />
          <StatCard title="Agents" value={overview.totalAgents ?? 0} subtitle="Registered agents" icon={ShieldCheck} tone="bg-purple-50 text-purple-700" />
          <StatCard title="Properties" value={overview.totalProperties ?? 0} subtitle="Live listings" icon={Building2} tone="bg-amber-50 text-amber-700" />
          <StatCard title="Approved listings" value={overview.approvedProperties ?? 0} subtitle="Ready for buyers" icon={CheckCircle2} tone="bg-emerald-50 text-emerald-700" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">New signups</h2>
            </div>
            <div className="space-y-3">
              {signupSeries.length > 0 ? signupSeries.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <div className="flex items-center gap-3 flex-1 ml-4">
                    <div className="h-2 flex-1 rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-primary-600" style={{ width: `${Math.min((item.value / Math.max(...signupSeries.map((s) => s.value), 1)) * 100, 100)}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                </div>
              )) : <p className="text-sm text-gray-500">No signup data yet.</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">New listings</h2>
            </div>
            <div className="space-y-3">
              {listingSeries.length > 0 ? listingSeries.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <div className="flex items-center gap-3 flex-1 ml-4">
                    <div className="h-2 flex-1 rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${Math.min((item.value / Math.max(...listingSeries.map((s) => s.value), 1)) * 100, 100)}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  </div>
                </div>
              )) : <p className="text-sm text-gray-500">No listing data yet.</p>}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Clock3 className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recent activity</h2>
            </div>
            <div className="space-y-4">
              {analytics?.recentActivity?.properties?.length ? analytics.recentActivity.properties.map((item) => (
                <div key={item._id} className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.agent?.name || 'Agent'} • {item.status}</p>
                  </div>
                  <span className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              )) : <p className="text-sm text-gray-500">No recent property activity.</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key metrics</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                <span className="text-sm text-gray-500">Pending approvals</span>
                <span className="font-semibold text-gray-900">{overview.pendingProperties ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                <span className="text-sm text-gray-500">Sold properties</span>
                <span className="font-semibold text-gray-900">{overview.soldProperties ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                <span className="text-sm text-gray-500">Reviews</span>
                <span className="font-semibold text-gray-900">{overview.totalReviews ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                <span className="text-sm text-gray-500">Purchases</span>
                <span className="font-semibold text-gray-900">{overview.totalPurchases ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
