import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, updateUser, deleteUser, createUser, getUserDetail } from '../../api/admin';
import { 
  UserPlus, Edit, Trash2, X, Check, Eye, Mail, Phone, Calendar, 
  Building2, ShoppingBag, Star, ExternalLink, Users, Search,
  Filter, ChevronLeft, ChevronRight, Shield, Award, Clock,
  UserCheck, UserX, MoreVertical, Sparkles, Activity, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://realepro.onrender.com';

// ─── User Detail Modal ──────────────────────────────────────────────────
function UserDetailModal({ userId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    getUserDetail(userId)
      .then(({ data }) => setDetail(data.data))
      .catch(() => toast.error('Failed to load user details'))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm flex items-center justify-between px-6 py-4 border-b border-gray-100 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">User Profile</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-600 animate-pulse" />
              </div>
            </div>
          </div>
        ) : !detail ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500">Could not load user details</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* ─── Header ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-primary-50 to-indigo-50 rounded-2xl border border-primary-100/50">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary-500/30">
                {detail.user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold text-gray-900 truncate">{detail.user.name}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    detail.user.role === 'admin' ? 'bg-red-100 text-red-700' : 
                    detail.user.role === 'agent' ? 'bg-blue-100 text-blue-700' : 
                    'bg-green-100 text-green-700'
                  }`}>
                    {detail.user.role}
                  </span>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    detail.user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {detail.user.isActive ? '🟢 Active' : '🔴 Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Joined {new Date(detail.user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* ─── Contact Info ────────────────────────────────────────── */}
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-primary-500" />
                <span className="text-gray-700">{detail.user.email}</span>
              </div>
              {detail.user.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-primary-500" />
                  <span className="text-gray-700">{detail.user.phone}</span>
                </div>
              )}
            </div>

            {/* ─── Stats ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Listings', value: detail.summary.totalListings, sub: `${detail.summary.approvedListings} approved`, icon: Building2, color: 'blue' },
                { label: 'Offers Made', value: detail.summary.totalPurchasesMade, sub: 'purchase offers', icon: ShoppingBag, color: 'purple' },
                { label: 'Reviews', value: detail.summary.totalReviews, sub: 'written', icon: Star, color: 'amber' },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-${stat.color}-50 rounded-xl p-4 text-center border border-${stat.color}-100/50`}
                >
                  <stat.icon className={`w-5 h-5 mx-auto text-${stat.color}-500 mb-1`} />
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  {stat.sub && <p className="text-[10px] text-gray-400 mt-0.5">{stat.sub}</p>}
                </motion.div>
              ))}
            </div>

            {/* ─── Listed Properties ───────────────────────────────────── */}
            {detail.listedProperties.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary-500" />
                  Listed Properties ({detail.listedProperties.length})
                </h3>
                <div className="space-y-2">
                  {detail.listedProperties.map((p) => (
                    <Link 
                      key={p._id} 
                      to={`/properties/${p._id}`} 
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-gray-50 border border-gray-100 text-sm transition-all group"
                    >
                      <span className="truncate flex-1 group-hover:text-primary-600 transition-colors">{p.title}</span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        p.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.isApproved ? '✅ Approved' : '⏳ Pending'}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Purchases Made ───────────────────────────────────────── */}
            {detail.purchasesMade.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-purple-500" />
                  Purchase Offers ({detail.purchasesMade.length})
                </h3>
                <div className="space-y-2">
                  {detail.purchasesMade.map((p) => (
                    <div key={p._id} className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-100 text-sm">
                      <span className="truncate flex-1">{p.property?.title || 'Property removed'}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full ${
                        p.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Reviews Written ──────────────────────────────────────── */}
            {detail.reviewsWritten.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Reviews ({detail.reviewsWritten.length})
                </h3>
                <div className="space-y-2">
                  {detail.reviewsWritten.map((r) => (
                    <div key={r._id} className="px-4 py-2.5 rounded-xl border border-gray-100 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium group-hover:text-primary-600 transition-colors">
                          {r.property?.title || 'Property removed'}
                        </span>
                        <span className="text-xs font-semibold text-amber-600">★ {r.rating}/5</span>
                      </div>
                      {r.comment && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.summary.totalListings === 0 && 
             detail.summary.totalPurchasesMade === 0 && 
             detail.summary.totalReviews === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Activity className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm">No activity on the platform yet</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── User Modal ─────────────────────────────────────────────────────────
function UserModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer', phone: '' });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUser(form);
      toast.success('User created successfully! 🎉');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Create User</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {[
            { field: 'name', label: 'Full Name', type: 'text', required: true },
            { field: 'email', label: 'Email', type: 'email', required: true },
            { field: 'phone', label: 'Phone', type: 'text', required: false },
            { field: 'password', label: 'Password', type: 'password', required: true },
          ].map(({ field, label, type, required }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <input 
                type={type} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                value={form[field]} 
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} 
                required={required} 
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
              value={form.role} 
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            >
              {['buyer', 'agent', 'admin'].map(r => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-70"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  const load = async (pg = 1, role = roleFilter, search = searchTerm) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 15 };
      if (role) params.role = role;
      if (search) params.search = search;
      const { data } = await getUsers(params);
      setUsers(data.data || []);
      setTotalPages(data.pages || 1);
      setTotalUsers(data.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(page, roleFilter, searchTerm); }, [page, roleFilter, searchTerm]);

  const handleUpdate = async (id, updates) => {
    try {
      await updateUser(id, updates);
      toast.success('User updated successfully! ✅');
      setEditing(null);
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deactivated');
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate user');
    }
  };

  // ─── Stats ────────────────────────────────────────────────────────────
  const stats = {
    total: totalUsers,
    admins: users.filter(u => u.role === 'admin').length,
    agents: users.filter(u => u.role === 'agent').length,
    buyers: users.filter(u => u.role === 'buyer').length,
    active: users.filter(u => u.isActive).length,
  };

  return (
    <div className="space-y-6 pb-8">
      {showModal && <UserModal onClose={() => setShowModal(false)} onSuccess={() => load(page)} />}
      {viewingId && <UserDetailModal userId={viewingId} onClose={() => setViewingId(null)} />}

      {/* ─── Header ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl shadow-blue-600/20"
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
                <Users className="w-6 h-6 text-blue-200" />
              </div>
              <span className="text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                User Management
              </span>
              <span className="text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                {totalUsers} Total Users
              </span>
            </div>
            <h1 className="text-3xl font-bold">Manage Users</h1>
            <p className="text-blue-100 mt-1">View, edit, and manage all platform users</p>
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
          >
            <UserPlus className="w-5 h-5" />
            Add User
          </button>
        </div>
      </motion.div>

      {/* ─── Stats Cards ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
          { label: 'Admins', value: stats.admins, icon: Shield, color: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-600' },
          { label: 'Agents', value: stats.agents, icon: Building2, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-600' },
          { label: 'Buyers', value: stats.buyers, icon: UserCheck, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
          { label: 'Active', value: stats.active, icon: Activity, color: 'from-green-500 to-green-600', bg: 'bg-green-50', text: 'text-green-600' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.text} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
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
            placeholder="Search by name or email..."
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
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all w-full sm:w-auto"
          >
            <option value="">All Roles</option>
            {['admin', 'agent', 'buyer'].map(r => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}s</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {users.length} of {totalUsers} users
        </span>
      </motion.div>

      {/* ─── User Table ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-500 mt-4 text-sm">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">No Users Found</h3>
          <p className="text-gray-500 mt-2">
            {searchTerm || roleFilter ? 'Try adjusting your search or filter' : 'Start by adding your first user'}
          </p>
          {(searchTerm || roleFilter) && (
            <button 
              onClick={() => { setSearchTerm(''); setRoleFilter(''); }}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="text-right px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {users.map((u, index) => (
                    <motion.tr 
                      key={u._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${
                            u.role === 'admin' ? 'from-red-500 to-red-600' :
                            u.role === 'agent' ? 'from-blue-500 to-blue-600' :
                            'from-emerald-500 to-emerald-600'
                          } flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-${u.role}-500/20 flex-shrink-0`}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell text-gray-500">{u.email}</td>
                      <td className="px-4 py-3.5">
                        {editing?.id === u._id ? (
                          <select 
                            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500" 
                            value={editing.role} 
                            onChange={e => setEditing(ed => ({ ...ed, role: e.target.value }))}
                          >
                            {['admin', 'agent', 'buyer'].map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            u.role === 'admin' ? 'bg-red-100 text-red-700' : 
                            u.role === 'agent' ? 'bg-blue-100 text-blue-700' : 
                            'bg-green-100 text-green-700'
                          }`}>
                            {u.role}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        {editing?.id === u._id ? (
                          <select 
                            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500" 
                            value={editing.isActive ? 'true' : 'false'} 
                            onChange={e => setEditing(ed => ({ ...ed, isActive: e.target.value === 'true' }))}
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        ) : (
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {u.isActive ? '🟢 Active' : '🔴 Inactive'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-gray-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {editing?.id === u._id ? (
                            <>
                              <button 
                                onClick={() => handleUpdate(u._id, { role: editing.role, isActive: editing.isActive })} 
                                className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all"
                                title="Save changes"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setEditing(null)} 
                                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-all"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => setViewingId(u._id)} 
                                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-all"
                                title="View full profile"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setEditing({ id: u._id, role: u.role, isActive: u.isActive })} 
                                className="p-2 rounded-xl hover:bg-blue-50 text-blue-500 transition-all"
                                title="Edit user"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(u._id)} 
                                className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-all"
                                title="Deactivate user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ─── Pagination ────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 bg-white rounded-2xl p-3 shadow-sm border border-gray-100"
        >
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
            className="w-9 h-9 rounded-xl hover:bg-gray-100 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pg;
            if (totalPages <= 7) {
              pg = i + 1;
            } else if (page <= 4) {
              pg = i + 1;
            } else if (page >= totalPages - 3) {
              pg = totalPages - 6 + i;
            } else {
              pg = page - 3 + i;
            }
            return (
              <button 
                key={pg} 
                onClick={() => setPage(pg)} 
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                  pg === page 
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {pg}
              </button>
            );
          })}

          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            disabled={page === totalPages}
            className="w-9 h-9 rounded-xl hover:bg-gray-100 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ─── Footer Stats ────────────────────────────────────────────── */}
      {users.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              Showing <strong className="text-gray-900">{users.length}</strong> of{' '}
              <strong className="text-gray-900">{totalUsers}</strong> users
            </span>
            <span className="w-px h-4 bg-gray-200"></span>
            <span className="text-gray-500">
              <strong className="text-gray-900">{stats.active}</strong> active users
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>All users are verified</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}