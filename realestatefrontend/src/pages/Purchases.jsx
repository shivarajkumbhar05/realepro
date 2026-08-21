// src/pages/buyer/Purchases.jsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyPurchases, getReceivedPurchases, updatePurchaseStatus } from '../api/purchases';
import { resolveImageUrl, getPlaceholderImage } from '../utils/imageUtils';
import { 
  ShoppingBag, Inbox, Check, X, Ban, MapPin, Building2, 
  Filter, ChevronDown, ChevronUp, Search, Calendar, 
  TrendingUp, TrendingDown, DollarSign, Users, Clock,
  Download, RefreshCw, PieChart, BarChart3, Eye, AlertCircle,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Status Styles ──────────────────────────────────────────────────────
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

// ─── Analytics Card ─────────────────────────────────────────────────────
function AnalyticsCard({ title, value, icon: Icon, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// ─── Purchase Card ──────────────────────────────────────────────────────
function PurchaseCard({ purchase, mode, onAction, onViewDetails }) {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  
  // Get image URL
  const imageUrl = useMemo(() => {
    if (imageError) return null;
    const img = purchase.property?.images?.[0];
    if (!img) return null;
    return resolveImageUrl(img);
  }, [purchase.property?.images, imageError]);

  const otherParty = mode === 'sent' ? purchase.agent : purchase.buyer;

  const getStatusBadge = (status) => (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLE[status] || 'bg-gray-100 text-gray-600'}`}>
      {STATUS_ICONS[status] || <Clock className="w-3 h-3" />} {status || 'pending'}
    </span>
  );

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCardClick = () => {
    if (purchase.property?._id) {
      navigate(`/properties/${purchase.property._id}`);
    } else {
      onViewDetails?.(purchase._id);
    }
  };

  const handleViewDetailsClick = (e) => {
    e.stopPropagation();
    if (purchase.property?._id) {
      navigate(`/properties/${purchase.property._id}`);
    } else {
      onViewDetails?.(purchase._id);
    }
  };

  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image Section */}
        <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative group">
          {imageUrl && !imageError ? (
            <img 
              src={imageUrl} 
              alt={purchase.property?.title || 'Property'} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={handleImageError}
            />
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
            <h3 className="font-semibold text-gray-900 truncate">
              {purchase.property?.title || 'Property'}
            </h3>
            {getStatusBadge(purchase.status)}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{purchase.property?.location?.city || 'Location not specified'}</span>
            {purchase.property?.location?.area && (
              <span className="text-gray-400">· {purchase.property.location.area}</span>
            )}
          </div>

          {/* Price Information */}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <div>
              <span className="text-xs text-gray-500">Offer Price</span>
              <p className="font-bold text-primary-600">
                ₹{purchase.offerPrice?.toLocaleString('en-IN') || 'N/A'}
              </p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <span className="text-xs text-gray-500">Listed Price</span>
              <p className="font-semibold text-gray-700">
                ₹{purchase.property?.price?.toLocaleString('en-IN') || 'N/A'}
              </p>
            </div>
            {purchase.property?.price && purchase.offerPrice && (
              <div className="ml-auto">
                <span className="text-xs text-gray-500">Difference</span>
                <p className={`font-medium text-sm ${purchase.offerPrice <= purchase.property.price ? 'text-green-600' : 'text-red-600'}`}>
                  {((purchase.offerPrice - purchase.property.price) / purchase.property.price * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          {/* Message */}
          {purchase.message && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 italic">"{purchase.message}"</p>
            </div>
          )}

          {/* Party Information */}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-400">
            <span>{mode === 'sent' ? 'To' : 'From'}: {otherParty?.name || 'Unknown'}</span>
            {otherParty?.phone && <span>· {otherParty.phone}</span>}
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">Created: {new Date(purchase.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {mode === 'received' && purchase.status === 'pending' && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction(purchase._id, 'accepted');
                  }} 
                  className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs flex items-center gap-1 transition-transform hover:scale-105"
                >
                  <Check className="w-3.5 h-3.5" /> Accept
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction(purchase._id, 'rejected');
                  }} 
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs flex items-center gap-1 transition-transform hover:scale-105"
                >
                  <X className="w-3.5 h-3.5" /> Decline
                </button>
              </>
            )}
            {mode === 'sent' && purchase.status === 'pending' && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(purchase._id, 'cancelled');
                }} 
                className="text-xs text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <Ban className="w-3.5 h-3.5" /> Cancel request
              </button>
            )}
            
            {/* View Property Button */}
            <button 
              onClick={handleViewDetailsClick}
              className="text-xs text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1 ml-auto"
            >
              <Eye className="w-3.5 h-3.5" /> View Property
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Filter Bar ─────────────────────────────────────────────────────────
function FilterBar({ filters, onFilterChange, onReset }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
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
        </div>
      )}
    </div>
  );
}

// ─── Pagination ─────────────────────────────────────────────────────────
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

// ─── Main Component ────────────────────────────────────────────────────
export default function Purchases() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canReceive = user?.role === 'agent' || user?.role === 'admin';
  const [tab, setTab] = useState('sent');
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // ─── Load Data ────────────────────────────────────────────────────────
  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [sentRes, receivedRes] = await Promise.all([
        getMyPurchases(),
        canReceive ? getReceivedPurchases() : Promise.resolve({ data: { data: [] } }),
      ]);
      
      // Handle different response structures
      const sentData = sentRes?.data?.data || sentRes?.data || sentRes || [];
      const receivedData = receivedRes?.data?.data || receivedRes?.data || receivedRes || [];
      
      setSent(Array.isArray(sentData) ? sentData : []);
      setReceived(Array.isArray(receivedData) ? receivedData : []);
    } catch (err) {
      console.error('Failed to load purchases:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load purchases';
      setError(errorMsg);
      toast.error(errorMsg);
      setSent([]);
      setReceived([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ─── Handle Actions ───────────────────────────────────────────────────
  const handleAction = async (id, status) => {
    try {
      await updatePurchaseStatus(id, status);
      toast.success(`Request ${status}`);
      load();
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to update request';
      toast.error(errorMsg);
    }
  };

  // ─── Handle View Details ──────────────────────────────────────────────
  const handleViewDetails = (purchaseId) => {
    // If you have a purchase detail page:
    // navigate(`/purchases/${purchaseId}`);
    
    // Or find the property and navigate to it
    const allPurchases = [...sent, ...received];
    const purchase = allPurchases.find(p => p._id === purchaseId);
    if (purchase?.property?._id) {
      navigate(`/properties/${purchase.property._id}`);
    } else {
      // If no property found, just go to properties list
      navigate('/properties');
    }
  };

  // ─── Filter and Sort Data ─────────────────────────────────────────────
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

  // ─── Get Current List ──────────────────────────────────────────────────
  const list = useMemo(() => {
    const data = tab === 'sent' ? sent : received;
    return filterAndSortData(data);
  }, [tab, sent, received, filters]);

  // ─── Pagination ────────────────────────────────────────────────────────
  const totalPages = Math.ceil(list.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return list.slice(start, end);
  }, [list, currentPage, itemsPerPage]);

  // ─── Reset Filters ────────────────────────────────────────────────────
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

  // ─── Handle Filter Change ─────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // ─── Calculate Analytics ──────────────────────────────────────────────
  const analytics = useMemo(() => {
    const activeData = tab === 'sent' ? sent : received;
    const total = activeData.length;
    const pending = activeData.filter(p => p.status === 'pending').length;
    const accepted = activeData.filter(p => p.status === 'accepted').length;
    const rejected = activeData.filter(p => p.status === 'rejected').length;
    const cancelled = activeData.filter(p => p.status === 'cancelled').length;
    
    const totalOfferValue = activeData.reduce((sum, p) => sum + (p.offerPrice || 0), 0);
    const avgOfferValue = total > 0 ? totalOfferValue / total : 0;
    
    const conversionRate = total > 0 ? (accepted / total) * 100 : 0;

    return {
      total,
      pending,
      accepted,
      rejected,
      cancelled,
      avgOfferValue,
      totalOfferValue,
      conversionRate,
    };
  }, [tab, sent, received]);

  // ─── Render ───────────────────────────────────────────────────────────
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
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading purchases</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => load()} 
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Analytics Cards */}
      {!loading && !error && (
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
      {canReceive && !error && (
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
      {!error && (
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
        />
      )}

      {/* Results Count */}
      {!loading && !error && (
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
      ) : error ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Unable to load purchases</h3>
          <p className="text-sm text-gray-500 mt-1">Please try again later</p>
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
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
            <Link to="/properties" className="inline-block mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
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
                purchase={p}
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