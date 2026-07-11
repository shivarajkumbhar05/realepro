import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProperties, deleteProperty } from '../../api/properties';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, Plus, Edit, Trash2, Eye, MapPin, 
  Home, Clock, CheckCircle, XCircle, Sparkles,
  TrendingUp, Users, DollarSign, Calendar,
  ChevronRight, Filter, Search, Grid3x3, List,
  Star, Heart, Share2, MessageCircle, Phone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://realepro.onrender.com';

export default function MyListings() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const load = async () => {
    try {
      const { data } = await getProperties({ limit: 50 });
      const mine = (data.data || []).filter(p => {
        const agentId = typeof p.agent === 'object' ? p.agent?._id : p.agent;
        return agentId === user?.id;
      });
      setProperties(mine);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await deleteProperty(id);
      toast.success('Property deleted successfully! 🗑️');
      setProperties(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete property');
    }
  };

  // ─── Stats ────────────────────────────────────────────────────────────
  const stats = {
    total: properties.length,
    approved: properties.filter(p => p.isApproved).length,
    pending: properties.filter(p => !p.isApproved).length,
    totalViews: properties.reduce((acc, p) => acc + (p.views || 0), 0),
  };

  // ─── Filter Properties ──────────────────────────────────────────────
  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.location?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'approved' && p.isApproved) ||
                         (filterStatus === 'pending' && !p.isApproved);
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary-600 animate-pulse" />
        </div>
      </div>
      <p className="text-gray-500 mt-4 text-sm">Loading your listings...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-600/20"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-24 translate-x-24"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                top: `${10 + Math.random() * 80}%`,
                left: `${10 + Math.random() * 80}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Building2 className="w-6 h-6 text-blue-200" />
              </div>
              <span className="text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                Agent Dashboard
              </span>
              <span className="text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                {properties.length} Properties
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">My Listings</h1>
            <p className="text-blue-100 mt-1">Manage all your properties from one place</p>
          </div>

          <Link
            to="/agent/my-listings/new"
            className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
            Add Property
          </Link>
        </div>

        {/* ─── Stats Row ────────────────────────────────────────────────── */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Total Properties', value: stats.total, icon: Building2, color: 'bg-white/10' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'bg-emerald-500/30' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-amber-500/30' },
            { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'bg-blue-500/30' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className={`flex items-center gap-3 ${stat.color} backdrop-blur-sm rounded-xl px-4 py-3`}
            >
              <stat.icon className="w-5 h-5 text-white/80" />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-blue-100">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ─── Search & Filter ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
      >
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all w-full sm:w-auto"
          >
            <option value="all">All Status</option>
            <option value="approved">✅ Approved</option>
            <option value="pending">⏳ Pending</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        <span className="text-xs text-gray-400 whitespace-nowrap">
          {filteredProperties.length} of {properties.length}
        </span>
      </motion.div>

      {/* ─── Empty State ────────────────────────────────────────────────── */}
      {properties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-12 h-12 text-indigo-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">No Properties Yet</h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Create your first listing and start getting customers.
          </p>
          <Link
            to="/agent/my-listings/new"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Listing
          </Link>
        </motion.div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No matching properties</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        /* ─── Property Grid ────────────────────────────────────────────── */
        <AnimatePresence>
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredProperties.map((p, index) => {
              const img = p.images?.[0] ? `${BASE}${p.images[0].path}` : null;
              
              if (viewMode === 'list') {
                return (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 h-48 sm:h-auto bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 relative overflow-hidden">
                        {img ? (
                          <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            p.status === 'sale' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                          }`}>
                            {p.status === 'sale' ? 'For Sale' : 'For Rent'}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          {p.isApproved ? (
                            <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-lg">
                              ✅ Approved
                            </span>
                          ) : (
                            <span className="bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-lg">
                              ⏳ Pending
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 p-5 flex flex-col">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                              {p.title}
                            </h3>
                            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                              <MapPin className="w-4 h-4" />
                              {p.location?.city}, {p.location?.state}
                            </div>
                          </div>
                          <div className="text-xl font-bold text-primary-600">
                            ₹{p.price?.toLocaleString()}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.description}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 capitalize">
                            {p.propertyType}
                          </span>
                          <span className="text-xs text-gray-400">
                            {p.bedrooms || 0} BHK • {p.area || 0} sq.ft
                          </span>
                          <span className="text-xs text-gray-400">
                            👁️ {p.views || 0} views
                          </span>
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                          <Link to={`/properties/${p._id}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all">
                            <Eye className="w-4 h-4" /> View
                          </Link>
                          <Link to={`/agent/my-listings/${p._id}/edit`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-sm font-medium transition-all">
                            <Edit className="w-4 h-4" /> Edit
                          </Link>
                          <button onClick={() => handleDelete(p._id)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-sm font-medium transition-all">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              // ─── Grid View ──────────────────────────────────────────────
              return (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {img ? (
                      <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full shadow-lg ${
                        p.status === 'sale' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                      }`}>
                        {p.status === 'sale' ? '🔵 For Sale' : '🟣 For Rent'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      {p.isApproved ? (
                        <span className="bg-emerald-500/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Approved
                        </span>
                      ) : (
                        <span className="bg-amber-500/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded-full text-white text-xs flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {p.views || 0} views
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{p.location?.city}, {p.location?.state}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Price</p>
                        <p className="text-xl font-bold text-primary-600">₹{p.price?.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Type</p>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                          {p.propertyType}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                      <span>{p.bedrooms || 0} BHK</span>
                      <span>•</span>
                      <span>{p.area || 0} sq.ft</span>
                      <span>•</span>
                      <span>{p.bathrooms || 0} Bath</span>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <Link to={`/properties/${p._id}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all">
                        <Eye className="w-4 h-4" /> View
                      </Link>
                      <Link to={`/agent/my-listings/${p._id}/edit`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-sm font-medium transition-all">
                        <Edit className="w-4 h-4" /> Edit
                      </Link>
                      <button onClick={() => handleDelete(p._id)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-sm font-medium transition-all">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {/* ─── Floating Stats Bar ────────────────────────────────────────── */}
      {properties.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              Showing <strong className="text-gray-900">{filteredProperties.length}</strong> of{' '}
              <strong className="text-gray-900">{properties.length}</strong> properties
            </span>
            <span className="w-px h-4 bg-gray-200"></span>
            <span className="text-gray-500">
              <strong className="text-emerald-600">{stats.approved}</strong> approved
            </span>
            <span className="text-gray-500">
              <strong className="text-amber-600">{stats.pending}</strong> pending
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Manage your listings efficiently</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}