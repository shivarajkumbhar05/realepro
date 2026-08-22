// src/pages/buyer/PropertyList.jsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getProperties } from '../../api/properties';
import { 
  Building2, Search, Filter, MapPin, Bed, Bath, Square, 
  ChevronLeft, ChevronRight, Plus, Star, LayoutGrid, Map as MapIcon,
  ChevronDown, ChevronUp, SlidersHorizontal, Check, AlertCircle
} from 'lucide-react';
import AllPropertiesMap from '../../components/map/AllPropertiesMap';
import { getPropertyImage, isValidImageUrl } from '../../utils/imageUtils';

// ─── Component: PropertyCard ──────────────────────────────────────────
function PropertyCard({ property, isAdmin, isAgent, user }) {
  const [imageError, setImageError] = useState(false);
  
  const img = useMemo(() => {
    const image = property.images?.[0] || property.image;
    return getPropertyImage(image, property.title || 'Property');
  }, [property.images, property.image, property.title]);

  const isOwner = property.agent?._id === user?.id || property.agent === user?.id;

  const handleImageError = (e) => {
    setImageError(true);
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(property.title || 'Property')}&background=random&color=fff&size=400`;
  };

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-200 relative overflow-hidden">
        {img && isValidImageUrl(img) && !imageError ? (
          <img 
            src={img} 
            alt={property.title || 'Property'} 
            className="w-full h-full object-cover"
            onError={handleImageError}
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
            <Square className="w-3 h-3" />{property.area} {property.areaUnit || 'sq ft'}
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [limit] = useState(12); // Default limit
  const [showAll, setShowAll] = useState(false);
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
  const [allPropertiesLoaded, setAllPropertiesLoaded] = useState(false);

  // ─── Load Properties ─────────────────────────────────────────────────
  const load = useCallback(async (pg = 1, params = {}, loadAll = false) => {
    const currentLimit = loadAll ? 1000 : limit;
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading properties - Page: ${pg}, Limit: ${currentLimit}, LoadAll: ${loadAll}`);
      
      const response = await getProperties({ 
        page: pg, 
        limit: currentLimit, 
        ...params 
      });
      
      console.log('API Response:', response);
      
      let propertiesData = [];
      let totalPagesData = 1;
      let totalData = 0;
      
      // Handle different response formats
      if (response) {
        // Check if response has data property
        if (response.data) {
          // Check if data has data array (nested)
          if (response.data.data && Array.isArray(response.data.data)) {
            propertiesData = response.data.data;
            totalPagesData = response.data.pagination?.pages || response.data.pages || response.data.totalPages || 1;
            totalData = response.data.pagination?.total || response.data.total || response.data.totalCount || 0;
          } 
          // Check if data is an array
          else if (Array.isArray(response.data)) {
            propertiesData = response.data;
            totalData = response.data.length;
          }
          // Check if data has properties array
          else if (response.data.properties && Array.isArray(response.data.properties)) {
            propertiesData = response.data.properties;
            totalPagesData = response.data.totalPages || 1;
            totalData = response.data.total || 0;
          }
          // Check if data has items array
          else if (response.data.items && Array.isArray(response.data.items)) {
            propertiesData = response.data.items;
            totalPagesData = response.data.totalPages || 1;
            totalData = response.data.total || 0;
          }
          // Check if data has results array
          else if (response.data.results && Array.isArray(response.data.results)) {
            propertiesData = response.data.results;
            totalPagesData = response.data.totalPages || 1;
            totalData = response.data.total || 0;
          }
        } 
        // Check if response itself is an array
        else if (Array.isArray(response)) {
          propertiesData = response;
          totalData = response.length;
        }
      }
      
      // Ensure we have valid data
      if (!Array.isArray(propertiesData)) {
        propertiesData = [];
      }
      
      setProperties(propertiesData);
      setTotalPages(Math.max(totalPagesData, 1));
      setTotalProperties(Math.max(totalData, propertiesData.length));
      
      // Check if all properties are loaded
      if (loadAll || propertiesData.length >= totalData) {
        setAllPropertiesLoaded(true);
      } else {
        setAllPropertiesLoaded(false);
      }
      
      console.log(`Loaded ${propertiesData.length} properties out of ${totalData}`);
      
    } catch (err) {
      console.error('Failed to load properties:', err);
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to load properties';
      setError(errorMessage);
      setProperties([]);
      setTotalPages(1);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // ─── Load All Properties ─────────────────────────────────────────────
  const loadAllProperties = useCallback(async () => {
    setLoadingMore(true);
    try {
      const response = await getProperties({ 
        page: 1, 
        limit: 1000, // Load all properties
        ...applied 
      });
      
      let propertiesData = [];
      
      if (response) {
        if (response.data) {
          if (response.data.data && Array.isArray(response.data.data)) {
            propertiesData = response.data.data;
          } else if (Array.isArray(response.data)) {
            propertiesData = response.data;
          } else if (response.data.properties && Array.isArray(response.data.properties)) {
            propertiesData = response.data.properties;
          } else if (response.data.items && Array.isArray(response.data.items)) {
            propertiesData = response.data.items;
          } else if (response.data.results && Array.isArray(response.data.results)) {
            propertiesData = response.data.results;
          }
        } else if (Array.isArray(response)) {
          propertiesData = response;
        }
      }
      
      if (!Array.isArray(propertiesData)) {
        propertiesData = [];
      }
      
      setProperties(propertiesData);
      setTotalProperties(propertiesData.length);
      setTotalPages(1);
      setAllPropertiesLoaded(true);
      setShowAll(true);
      
      console.log(`Loaded all ${propertiesData.length} properties`);
      toast.success(`Showing all ${propertiesData.length} properties`);
    } catch (err) {
      console.error('Failed to load all properties:', err);
      toast.error('Failed to load all properties');
    } finally {
      setLoadingMore(false);
    }
  }, [applied]);

  // ─── Load Map Properties ─────────────────────────────────────────────
  const loadMap = useCallback(async (params = {}) => {
    setMapLoading(true);
    try {
      const response = await getProperties({ page: 1, limit: 200, ...params });
      
      let mapData = [];
      if (response) {
        if (response.data) {
          if (response.data.data && Array.isArray(response.data.data)) {
            mapData = response.data.data;
          } else if (Array.isArray(response.data)) {
            mapData = response.data;
          } else if (response.data.properties && Array.isArray(response.data.properties)) {
            mapData = response.data.properties;
          } else if (response.data.items && Array.isArray(response.data.items)) {
            mapData = response.data.items;
          } else if (response.data.results && Array.isArray(response.data.results)) {
            mapData = response.data.results;
          }
        } else if (Array.isArray(response)) {
          mapData = response;
        }
      }
      
      if (!Array.isArray(mapData)) {
        mapData = [];
      }
      
      setMapProperties(mapData);
    } catch (err) {
      console.error('Failed to load map properties:', err);
      setMapProperties([]);
      toast.error('Failed to load map properties');
    } finally {
      setMapLoading(false);
    }
  }, []);

  // ─── Effects ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showAll) {
      load(1, applied);
    }
  }, [applied, load, showAll]);

  useEffect(() => {
    if (viewMode === 'map' && !mapLoading) {
      loadMap(applied);
    }
  }, [viewMode, applied, loadMap]);

  // ─── Filter Functions ─────────────────────────────────────────────────
  const applyFilters = useCallback(() => {
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    setApplied(cleaned);
    setMapProperties([]);
    setPage(1);
    setShowAll(false);
    setAllPropertiesLoaded(false);
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '', type: '', status: '', city: '', 
      minPrice: '', maxPrice: '', bedrooms: ''
    });
    setApplied({});
    setMapProperties([]);
    setPage(1);
    setShowAll(false);
    setAllPropertiesLoaded(false);
  }, []);

  const toggleFilterChip = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field] === value ? '' : value
    }));
  }, []);

  const goPage = useCallback((pg) => {
    if (pg < 1 || pg > totalPages) return;
    setPage(pg);
    load(pg, applied);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages, applied, load]);

  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleShowAllToggle = useCallback(() => {
    if (showAll) {
      setShowAll(false);
      setAllPropertiesLoaded(false);
      load(1, applied);
    } else {
      loadAllProperties();
    }
  }, [showAll, applied, load, loadAllProperties]);

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
              {showAll && ' (Showing all)'}
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
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Refine your search</h2>
                <p className="text-sm text-gray-500">Choose the right type, status, and size for your next property.</p>
              </div>
            </div>
            <button onClick={clearFilters} className="text-sm font-medium text-gray-500 hover:text-gray-700">
              Reset filters
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Property type</p>
              <div className="flex flex-wrap gap-2">
                {['apartment', 'house', 'villa', 'plot', 'commercial', 'office'].map(type => (
                  <button
                    key={type}
                    onClick={() => toggleFilterChip('type', type)}
                    className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${
                      filters.type === type 
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Availability</p>
              <div className="flex flex-wrap gap-2">
                {['sale', 'rent'].map(status => (
                  <button
                    key={status}
                    onClick={() => toggleFilterChip('status', status)}
                    className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${
                      filters.status === status 
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Bedrooms</p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map(option => (
                  <button
                    key={option}
                    onClick={() => toggleFilterChip('bedrooms', String(option))}
                    className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${
                      filters.bedrooms === String(option) 
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                    }`}
                  >
                    {option}+ Bed
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">City</label>
              <input 
                className="input-field text-sm mt-1" 
                placeholder="Enter city" 
                value={filters.city} 
                onChange={e => handleFilterChange('city', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Min price</label>
              <input 
                className="input-field text-sm mt-1" 
                placeholder="₹0" 
                type="number" 
                value={filters.minPrice} 
                onChange={e => handleFilterChange('minPrice', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Max price</label>
              <input 
                className="input-field text-sm mt-1" 
                placeholder="₹1000000" 
                type="number" 
                value={filters.maxPrice} 
                onChange={e => handleFilterChange('maxPrice', e.target.value)} 
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {Object.entries(applied).filter(([key]) => key !== 'search').map(([key, value]) => (
                <span key={key} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                  <Check className="w-3.5 h-3.5 text-primary-600" />
                  {key === 'type' ? value : key === 'status' ? value : key === 'bedrooms' ? `${value}+ bed` : value}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={applyFilters} className="btn-primary text-sm">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error loading properties</p>
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => load(page, applied)} 
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
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

          {/* Show All / Pagination Controls */}
          {!showAll && totalProperties > properties.length && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="text-sm text-gray-500">
                Showing {properties.length} of {totalProperties} properties
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadAllProperties}
                  disabled={loadingMore}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary-500/30"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show All {totalProperties} Properties
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!showAll && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Page {page} of {totalPages} ({totalProperties} total)
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

          {/* Show Less button when showing all */}
          {showAll && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleShowAllToggle}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
              >
                <ChevronUp className="w-4 h-4" />
                Show Less
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}