// src/pages/buyer/PropertyList.jsx
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProperties } from '../../api/properties';
import { 
  Building2, Search, Filter, MapPin, Bed, Bath, Square, 
  ChevronLeft, ChevronRight, Plus, Star, LayoutGrid, Map as MapIcon 
} from 'lucide-react';
import AllPropertiesMap from '../../components/map/AllPropertiesMap';
import { getPropertyImage, isValidImageUrl } from '../../utils/imageUtils';

// ─── Component: PropertyCard ──────────────────────────────────────────
function PropertyCard({ property, isAdmin, isAgent, user }) {
  const img = getPropertyImage(
    property.images?.[0] || property.image, 
    property.title || 'Property'
  );
  const isOwner = property.agent?._id === user?.id || property.agent === user?.id;

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-200 relative overflow-hidden">
        {img && isValidImageUrl(img) ? (
          <img 
            src={img} 
            alt={property.title || 'Property'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(property.title || 'Property')}&background=random&color=fff&size=400`;
              e.target.onerror = null;
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Building2 className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          <span className={`text-xs px-2 py-1 rounded font-medium ${
            property.status === 'sale' ? 'bg-blue-600 text-white' : 
            property.status === 'rent' ? 'bg-purple-600 text-white' : 
            'bg-gray-600 text-white'
          }`}>
            For {property.status}
          </span>
          {!property.isApproved && (
            <span className="text-xs px-2 py-1 rounded font-medium bg-yellow-500 text-white">
              Pending
            </span>
          )}
        </div>
        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-1">
            <span className="text-xs px-2 py-1 rounded font-medium bg-black/50 text-white">
              ID: {property._id?.slice(-6)}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
        <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
          <MapPin className="w-3 h-3" />
          {property.location?.city}, {property.location?.state}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-600">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bed className="w-3 h-3" />{property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="w-3 h-3" />{property.bathrooms}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Square className="w-3 h-3" />{property.area} {property.areaUnit}
          </span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-primary-600">
            ₹{property.price?.toLocaleString()}
          </span>
          <Link to={`/properties/${property._id}`} className="text-xs btn-secondary py-1 px-3">
            View
          </Link>
        </div>
        {property.numReviews > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-500" />
            <span className="font-medium text-gray-700">
              {property.avgRating?.toFixed(1)}
            </span>
            <span>({property.numReviews})</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────
export default function PropertyList() {
  const { user, isAdmin, isAgent } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '', 
    type: '', 
    status: '', 
    city: '', 
    minPrice: '', 
    maxPrice: '', 
    bedrooms: ''
  });
  const [applied, setApplied] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [mapProperties, setMapProperties] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);

  // ─── Load Properties ─────────────────────────────────────────────────
  const load = useCallback(async (pg = 1, params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getProperties({ page: pg, limit: 12, ...params });
      
      let propertiesData = [];
      let totalPagesData = 1;
      let totalData = 0;
      
      if (response?.data) {
        if (response.data.data) {
          propertiesData = response.data.data;
          totalPagesData = response.data.pages || 1;
          totalData = response.data.total || 0;
        } else if (Array.isArray(response.data)) {
          propertiesData = response.data;
          totalPagesData = response.pages || 1;
          totalData = response.total || propertiesData.length;
        }
      } else if (Array.isArray(response)) {
        propertiesData = response;
      }
      
      setProperties(propertiesData || []);
      setTotalPages(totalPagesData || 1);
      setTotalProperties(totalData || propertiesData?.length || 0);
      
    } catch (err) {
      console.error('Failed to load properties:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load properties');
      setProperties([]);
      setTotalPages(1);
    }
    setLoading(false);
  }, []);

  // ─── Load Map Properties ─────────────────────────────────────────────
  const loadMap = useCallback(async (params = {}) => {
    setMapLoading(true);
    try {
      const response = await getProperties({ page: 1, limit: 200, ...params });
      
      let mapData = [];
      if (response?.data?.data) {
        mapData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        mapData = response.data;
      } else if (Array.isArray(response)) {
        mapData = response;
      }
      
      setMapProperties(mapData);
    } catch (err) {
      console.error('Failed to load map properties:', err);
      setMapProperties([]);
    }
    setMapLoading(false);
  }, []);

  // ─── Effects ─────────────────────────────────────────────────────────
  useEffect(() => {
    load(1, applied);
  }, [applied, load]);

  useEffect(() => {
    if (viewMode === 'map' && mapProperties.length === 0 && !mapLoading) {
      loadMap(applied);
    }
  }, [viewMode, applied, loadMap, mapProperties.length, mapLoading]);

  // ─── Filter Functions ─────────────────────────────────────────────────
  const applyFilters = () => {
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    setApplied(cleaned);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '', type: '', status: '', city: '', 
      minPrice: '', maxPrice: '', bedrooms: ''
    });
    setApplied({});
    setPage(1);
  };

  const goPage = (pg) => {
    if (pg < 1 || pg > totalPages) return;
    setPage(pg);
    load(pg, applied);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          {!loading && (
            <p className="text-sm text-gray-500">
              {totalProperties} properties found
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
                viewMode === 'map' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MapIcon className="w-4 h-4" /> Map
            </button>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <Filter className="w-4 h-4" /> 
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          {(isAdmin || isAgent) && (
            <Link to="/agent/my-listings/new" className="btn-primary text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Listing
            </Link>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="input-field pl-10"
          placeholder="Search by title, description, or address..."
          value={filters.search}
          onChange={e => handleFilterChange('search', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && applyFilters()}
        />
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <select 
            className="input-field text-sm" 
            value={filters.type} 
            onChange={e => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            {['apartment', 'house', 'villa', 'plot', 'commercial', 'office'].map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <select 
            className="input-field text-sm" 
            value={filters.status} 
            onChange={e => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            {['sale', 'rent', 'sold', 'rented'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <input 
            className="input-field text-sm" 
            placeholder="City" 
            value={filters.city} 
            onChange={e => handleFilterChange('city', e.target.value)} 
          />
          <input 
            className="input-field text-sm" 
            placeholder="Min Price" 
            type="number" 
            value={filters.minPrice} 
            onChange={e => handleFilterChange('minPrice', e.target.value)} 
          />
          <input 
            className="input-field text-sm" 
            placeholder="Max Price" 
            type="number" 
            value={filters.maxPrice} 
            onChange={e => handleFilterChange('maxPrice', e.target.value)} 
          />
          <select 
            className="input-field text-sm" 
            value={filters.bedrooms} 
            onChange={e => handleFilterChange('bedrooms', e.target.value)}
          >
            <option value="">Bedrooms</option>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+</option>)}
          </select>
          <div className="col-span-2 md:col-span-3 lg:col-span-6 flex gap-2">
            <button onClick={applyFilters} className="btn-primary text-sm">
              Apply Filters
            </button>
            <button onClick={clearFilters} className="btn-secondary text-sm">
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading properties</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => load(page, applied)} 
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {viewMode === 'map' ? (
        mapLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : mapProperties.length === 0 ? (
          <div className="card p-12 text-center">
            <MapIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No properties available on map</p>
            <p className="text-gray-400 text-sm mt-1">
              Only approved properties with pinned locations appear here
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 -mt-1">
              Showing {mapProperties.length} admin-approved properties with pinned locations
            </p>
            <AllPropertiesMap properties={mapProperties} />
          </>
        )
      ) : loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
            <p className="mt-2 text-gray-500 text-sm">Loading properties...</p>
          </div>
        </div>
      ) : properties.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No properties found</p>
          <p className="text-gray-400 text-sm mt-1">
            {Object.keys(applied).length > 0 
              ? 'Try adjusting your filters' 
              : 'No properties are available at the moment'}
          </p>
          {Object.keys(applied).length > 0 && (
            <button onClick={clearFilters} className="btn-secondary text-sm mt-4">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {properties.map(p => (
              <PropertyCard 
                key={p._id} 
                property={p} 
                user={user} 
                isAdmin={isAdmin} 
                isAgent={isAgent} 
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="text-sm text-gray-500">
                Showing page {page} of {totalPages} ({totalProperties} total properties)
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => goPage(page - 1)} 
                  disabled={page === 1} 
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pgNum;
                  if (totalPages <= 7) {
                    pgNum = i + 1;
                  } else if (page <= 4) {
                    pgNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pgNum = totalPages - 6 + i;
                  } else {
                    pgNum = page - 3 + i;
                  }
                  return (
                    <button 
                      key={pgNum} 
                      onClick={() => goPage(pgNum)} 
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        pgNum === page 
                          ? 'bg-primary-600 text-white' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {pgNum}
                    </button>
                  );
                })}
                <button 
                  onClick={() => goPage(page + 1)} 
                  disabled={page === totalPages} 
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}