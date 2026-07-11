import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPendingProperties } from '../../api/admin';
import { approveProperty, deleteProperty } from '../../api/properties';
import { 
  Building2, CheckCircle, Trash2, Eye, MapPin, Clock, 
  Users, Calendar, AlertCircle, Sparkles, Shield, 
  ChevronRight, User, Phone, Mail, Star, Award,
  Filter, Search, X, Check, Ban, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://realepro.onrender.com';

export default function AdminPending() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState(null);

  const load = async () => {
    try {
      const { data } = await getPendingProperties();
      setProperties(data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    try {
      await approveProperty(id);
      toast.success('Property approved successfully! 🎉');
      setProperties(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to reject this property?')) return;
    try {
      await deleteProperty(id);
      toast.success('Property rejected and removed');
      setProperties(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  // ─── Filter Properties ──────────────────────────────────────────────
  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.agent?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || p.propertyType === filterType;
    return matchesSearch && matchesType;
  });

  // ─── Stats ────────────────────────────────────────────────────────────
  const stats = {
    total: properties.length,
    apartments: properties.filter(p => p.propertyType === 'apartment').length,
    houses: properties.filter(p => p.propertyType === 'house').length,
    villas: properties.filter(p => p.propertyType === 'villa').length,
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary-600 animate-pulse" />
        </div>
      </div>
      <p className="text-gray-500 mt-4 text-sm">Loading pending approvals...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl p-8 text-white shadow-2xl shadow-amber-500/20"
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

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Clock className="w-6 h-6 text-yellow-200" />
              </div>
              <span className="text-sm font-medium text-amber-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                Awaiting Review
              </span>
              <span className="text-sm font-medium text-amber-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                {properties.length} Properties
              </span>
            </div>
            <h1 className="text-3xl font-bold">Pending Approvals</h1>
            <p className="text-amber-100 mt-1">Review and approve new property listings</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
              <Sparkles className="w-4 h-4 text-yellow-200 animate-pulse" />
              <span className="text-sm">{properties.length} waiting</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Cards ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Apartments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.apartments}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Houses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.houses}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Villas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.villas}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
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
            placeholder="Search by title, city, or agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all w-full sm:w-auto"
          >
            <option value="all">All Types</option>
            <option value="apartment">Apartments</option>
            <option value="house">Houses</option>
            <option value="villa">Villas</option>
            <option value="plot">Plots</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {filteredProperties.length} of {properties.length} properties
        </span>
      </motion.div>

      {/* ─── Property List ────────────────────────────────────────────── */}
      {properties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">All Caught Up! 🎉</h3>
          <p className="text-gray-500 mt-2">No properties waiting for approval</p>
          <p className="text-gray-400 text-sm mt-1">All properties have been reviewed</p>
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
        <AnimatePresence>
          <div className="grid gap-4">
            {filteredProperties.map((p, index) => {
              const img = p.images?.[0] ? `${BASE}${p.images[0].path}` : null;
              return (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* ─── Image ─────────────────────────────────────────── */}
                    <div className="lg:w-56 h-48 lg:h-auto bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 relative overflow-hidden">
                      {img ? (
                        <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-500/90 backdrop-blur-sm text-white shadow-lg">
                          ⏳ Pending
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded-full text-white text-xs">
                        <Clock className="w-3 h-3" />
                        {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* ─── Content ───────────────────────────────────────── */}
                    <div className="flex-1 p-5 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                            {p.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-500 truncate">
                              {p.location?.city}, {p.location?.state}
                            </span>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-primary-600 whitespace-nowrap">
                          ₹{p.price?.toLocaleString()}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {p.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">
                            {p.agent?.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700">{p.agent?.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(p.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 capitalize">
                          {p.propertyType}
                        </span>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 capitalize">
                          {p.bedrooms || 0} BHK
                        </span>
                      </div>

                      {/* ─── Actions ─────────────────────────────────────── */}
                      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                        <Link
                          to={`/properties/${p._id}`}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </Link>
                        <button
                          onClick={() => handleApprove(p._id)}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-xl"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200"
                        >
                          <Ban className="w-4 h-4" />
                          Reject
                        </button>
                        <Link
                          to={`/properties/${p._id}`}
                          className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          View Details
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {/* ─── Floating Stats ────────────────────────────────────────────── */}
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
              Need to review <strong className="text-amber-600">{properties.length}</strong> properties
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>All properties are verified</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}