import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Building2, CheckCircle, Clock, Eye, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPropertiesByAgent } from '../../api/properties';
import toast from 'react-hot-toast';

function Metric({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

export default function AgentAnalytics() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await getPropertiesByAgent(user?._id || user?.id);
        const payload = response?.data || response;
        const items = Array.isArray(payload)
          ? payload
          : payload?.data || payload?.properties || payload?.items || [];
        if (active) setProperties(items);
      } catch (error) {
        if (active) toast.error(error?.response?.data?.message || 'Unable to load analytics');
      } finally {
        if (active) setLoading(false);
      }
    };

    if (user?._id || user?.id) load();
    return () => { active = false; };
  }, [user?._id, user?.id]);

  const metrics = useMemo(() => ({
    listings: properties.length,
    views: properties.reduce((sum, property) => sum + (property.views || 0), 0),
    approved: properties.filter((property) => property.isApproved).length,
    pending: properties.filter((property) => !property.isApproved).length,
  }), [properties]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Analytics</h1>
          <p className="text-sm text-gray-500">Track the performance of your property listings.</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500">Loading analytics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Metric icon={Building2} label="Total listings" value={metrics.listings} color="bg-blue-100 text-blue-600" />
            <Metric icon={Eye} label="Total views" value={metrics.views} color="bg-indigo-100 text-indigo-600" />
            <Metric icon={CheckCircle} label="Approved listings" value={metrics.approved} color="bg-emerald-100 text-emerald-600" />
            <Metric icon={Clock} label="Pending approval" value={metrics.pending} color="bg-amber-100 text-amber-600" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Listing performance</h2>
            </div>
            {properties.length === 0 ? (
              <p className="text-sm text-gray-500">Create a listing to start tracking performance.</p>
            ) : (
              <div className="space-y-4">
                {properties.slice(0, 8).map((property) => (
                  <div key={property._id} className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <p className="font-medium text-gray-800 truncate">{property.title || 'Untitled property'}</p>
                    <span className="text-sm text-gray-500 flex-shrink-0">{property.views || 0} views</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
