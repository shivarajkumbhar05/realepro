import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyPurchases, getReceivedPurchases, updatePurchaseStatus } from '../api/purchases';
import { 
  ShoppingBag, Inbox, Check, X, Ban, MapPin, Building2, 
  Filter, ChevronDown, ChevronUp, Search, Calendar, 
  TrendingUp, TrendingDown, DollarSign, Users, Clock,
  Download, RefreshCw, PieChart, BarChart3, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://realepro.onrender.com';

const STATUS_STYLE = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

const STATUS_ICONS = {
  pending: <Clock className="w-3 h-3" />,
  accepted: <Check className="w-3 h-3" />,
  rejected: <X className="w-3 h-3" />,
  cancelled: <Ban className="w-3 h-3" />,
};

// Analytics Card Component
function AnalyticsCard({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {trend > 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : trend < 0 ? (
                <TrendingDown className="w-3 h-3 text-red-500" />
              ) : null}
              <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {trend > 0 ? '+' : ''}{trendValue}%
              </span>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// Enhanced Purchase Card with Analytics
function PurchaseCard({ p, mode, onAction, onViewDetails }) {
  const img = p.property?.images?.[0] ? `${BASE}${p.property.images[0].path}` : null;
  const otherParty = mode === 'sent' ? p.agent : p.buyer;
  const [expanded, setExpanded] = useState(false);

  const getStatusBadge = (status) => (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLE[status]}`}>
      {STATUS_ICONS[status]} {status}
    </span>
  );

  return (
    <div className="card p-4 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image Section */}
        <div 
          className="w-full sm:w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer relative group"
          onClick={() => onViewDetails?.(p._id)}
        >
          {img ? (
            <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-gray-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <Link 
              to={`/properties/${p.property?._id}`} 
              className="font-semibold text-gray-900 hover:text-primary-600 truncate transition-colors"
            >
              {p.property?.title || 'Property'}
            </Link>
            {getStatusBadge(p.status)}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{p.property?.location?.city || 'Location not specified'}</span>
            {p.property?.location?.area && (
              <span className="text-gray-400">· {p.property.location.area}</span>
            )}
          </div>

          {/* Price Information */}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <div>
              <span className="text-xs text-gray-500">Offer Price</span>
              <p className="font-bold text-primary-600">₹{p.offerPrice?.toLocaleString('en-IN')}</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <span className="text-xs text-gray-500">Listed Price</span>
              <p className="font-semibold text-gray-700">₹{p.property?.price?.toLocaleString('en-IN')}</p>
            </div>
            {p.property?.price && p.offerPrice && (
              <div className="ml-auto">
                <span className="text-xs text-gray-500">Difference</span>
                <p className={`font-medium text-sm ${p.offerPrice <= p.property.price ? 'text-green-600' : 'text-red-600'}`}>
                  {((p.offerPrice - p.property.price) / p.property.price * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          {/* Message */}
          {p.message && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 italic">"{p.message}"</p>
            </div>
          )}

          {/* Party Information */}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-400">
            <span>{mode === 'sent' ? 'To' : 'From'}: {otherParty?.name || 'Unknown'}</span>
            {otherParty?.phone && <span>· {otherParty.phone}</span>}
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">Created: {new Date(p.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {mode === 'received' && p.status === 'pending' && (
              <>
                <button 
                  onClick={() => onAction(p._id, 'accepted')} 
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 hover:scale-105 transition-transform"
                >
                  <Check className="w-3.5 h-3.5" /> Accept
                </button>
                <button 
                  onClick={() => onAction(p._id, 'rejected')} 
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 hover:scale-105 transition-transform"
                >
                  <X className="w-3.5 h-3.5" /> Decline
                </button>
              </>
            )}
            {mode === 'sent' && p.status === 'pending' && (
              <button 
                onClick={() => onAction(p._id, 'cancelled')} 
                className="text-xs text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <Ban className="w-3.5 h-3.5" /> Cancel request
              </button>
            )}
            <button 
              onClick={() => onViewDetails?.(p._id)}
              className="text-xs text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1 ml-auto"
            >
              <Eye className="w-3.5 h-3.5" /> View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Filter and Sort Component
function FilterBar({ filters, onFilterChange, onReset }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filters & Sorting</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <button
          onClick={onReset}
          className="text-xs text-gray-500 hover:text-primary-600 transition-colors"
        >
          Reset All
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {/* Search */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => onFilterChange('startDate', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => onFilterChange('endDate', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="createdAt">Date</option>
              <option value="offerPrice">Offer Price</option>
              <option value="property.price">Listed Price</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => onFilterChange('sortOrder', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Price Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => onFilterChange('minPrice', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= delta) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <ChevronDown className="h-5 w-5 rotate-90" />
            </button>
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  page === currentPage
                    ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                } ${typeof page !== 'number' ? 'cursor-default' : ''}`}
                disabled={typeof page !== 'number'}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <ChevronDown className="h-5 w-5 -rotate-90" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function Purchases() {
  const { user } = useAuth();
  const canReceive = user?.role === 'agent' || user?.role === 'admin';
  const [tab, setTab] = useState('sent');
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    minPrice: '',
    maxPrice: '',
  });

  // Load data
  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [sentRes, receivedRes] = await Promise.all([
        getMyPurchases(),
        canReceive ? getReceivedPurchases() : Promise.resolve({ data: { data: [] } }),
      ]);
      setSent(sentRes.data.data || []);
      setReceived(receivedRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Handle actions
  const handleAction = async (id, status) => {
    try {
      await updatePurchaseStatus(id, status);
      toast.success(`Request ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update request');
    }
  };

  // Filter and sort data
  const filterAndSortData = (data) => {
    let filtered = [...data];

    // Search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.property?.title?.toLowerCase().includes(search) ||
        p.property?.location?.city?.toLowerCase().includes(search) ||
        p.buyer?.name?.toLowerCase().includes(search) ||
        p.agent?.name?.toLowerCase().includes(search)
      );
    }

    // Status
    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    // Date range
    if (filters.startDate) {
      filtered = filtered.filter(p => 
        new Date(p.createdAt) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(p => 
        new Date(p.createdAt) <= new Date(filters.endDate)
      );
    }

    // Price range
    if (filters.minPrice) {
      filtered = filtered.filter(p => 
        p.offerPrice >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => 
        p.offerPrice <= parseFloat(filters.maxPrice)
      );
    }

    // Sort
    const sortField = filters.sortBy;
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'property.price') {
        aVal = a.property?.price || 0;
        bVal = b.property?.price || 0;
      }
      
      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal) * sortOrder;
      }
      return (aVal - bVal) * sortOrder;
    });

    return filtered;
  };

  // Get current list
  const list = useMemo(() => {
    const data = tab === 'sent' ? sent : received;
    return filterAndSortData(data);
  }, [tab, sent, received, filters]);

  // Pagination
  const totalPages = Math.ceil(list.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return list.slice(start, end);
  }, [list, currentPage, itemsPerPage]);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      minPrice: '',
      maxPrice: '',
    });
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Calculate analytics
  const analytics = useMemo(() => {
    const activeData = tab === 'sent' ? sent : received;
    const total = activeData.length;
    const pending = activeData.filter(p => p.status === 'pending').length;
    const accepted = activeData.filter(p => p.status === 'accepted').length;
    const rejected = activeData.filter(p => p.status === 'rejected').length;
    const cancelled = activeData.filter(p => p.status === 'cancelled').length;
    
    const totalOfferValue = activeData.reduce((sum, p) => sum + (p.offerPrice || 0), 0);
    const avgOfferValue = total > 0 ? totalOfferValue / total : 0;
    
    const acceptedValue = activeData
      .filter(p => p.status === 'accepted')
      .reduce((sum, p) => sum + (p.offerPrice || 0), 0);
    
    const conversionRate = total > 0 ? (accepted / total) * 100 : 0;

    return {
      total,
      pending,
      accepted,
      rejected,
      cancelled,
      avgOfferValue,
      totalOfferValue,
      acceptedValue,
      conversionRate,
    };
  }, [tab, sent, received]);

  // Handle view details
  const handleViewDetails = (id) => {
    // Navigate to detail page or open modal
    console.log('View details for purchase:', id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary-600" />
            My Purchases
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track offers you've sent, and manage offers on your listings.
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Analytics Cards */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <AnalyticsCard
            title="Total Requests"
            value={analytics.total}
            icon={ShoppingBag}
            color="primary"
          />
          <AnalyticsCard
            title="Pending"
            value={analytics.pending}
            icon={Clock}
            color="yellow"
          />
          <AnalyticsCard
            title="Accepted"
            value={analytics.accepted}
            icon={Check}
            color="green"
          />
          <AnalyticsCard
            title="Conversion Rate"
            value={`${analytics.conversionRate.toFixed(1)}%`}
            icon={TrendingUp}
            color="purple"
          />
          <AnalyticsCard
            title="Avg Offer"
            value={`₹${analytics.avgOfferValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            icon={DollarSign}
            color="green"
          />
        </div>
      )}

      {/* Tabs */}
      {canReceive && (
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => { setTab('sent'); setCurrentPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'sent' 
                ? 'border-primary-600 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Sent ({sent.length})
          </button>
          <button
            onClick={() => { setTab('received'); setCurrentPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'received' 
                ? 'border-primary-600 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Inbox className="w-4 h-4" /> Received ({received.length})
          </button>
        </div>
      )}

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
      />

      {/* Results Count */}
      {!loading && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Showing {paginatedData.length} of {list.length} results</span>
          <span>{tab === 'sent' ? 'Sent' : 'Received'} offers</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="mt-4 text-gray-500">Loading your purchases...</p>
          </div>
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="card p-12 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">
            No {tab === 'sent' ? 'offers sent' : 'offers received'} yet
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {tab === 'sent' 
              ? 'Start exploring properties and make an offer!' 
              : 'When buyers make offers on your properties, they\'ll appear here.'}
          </p>
          {tab === 'sent' && (
            <Link to="/properties" className="btn-primary mt-4 inline-block">
              Browse Properties
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedData.map((p) => (
              <PurchaseCard
                key={p._id}
                p={p}
                mode={tab}
                onAction={handleAction}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}