import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProperties } from '../../api/properties';
import { Building2, Search, Filter, MapPin, Bed, Bath, Square, ChevronLeft, ChevronRight, Plus, Star, LayoutGrid, Map as MapIcon } from 'lucide-react';
import AllPropertiesMap from '../../components/map/AllPropertiesMap';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || ' https://realepro.onrender.com';

function PropertyCard({ property, isAdmin, isAgent, user }) {
  const imgPath = property.images?.[0]?.path;
  const img = imgPath
    ? (imgPath.startsWith('http') ? imgPath : `${BASE}${imgPath}`)
    : null;
  const isOwner = property.agent?._id === user?.id || property.agent === user?.id;

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-200 relative overflow-hidden">
        {img
          ? <img src={img} alt={property.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><Building2 className="w-12 h-12 text-gray-300" /></div>
        }
        <div className="absolute top-2 left-2 flex gap-1">
          <span className={`text-xs px-2 py-1 rounded font-medium ${property.status === 'sale' ? 'bg-blue-600 text-white' : property.status === 'rent' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-white'}`}>
            For {property.status}
          </span>
          {!property.isApproved && (
            <span className="text-xs px-2 py-1 rounded font-medium bg-yellow-500 text-white">Pending</span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
        <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
          <MapPin className="w-3 h-3" />
          {property.location?.city}, {property.location?.state}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-600">
          {property.bedrooms > 0 && <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{property.bedrooms}</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{property.bathrooms}</span>}
          <span className="flex items-center gap-1"><Square className="w-3 h-3" />{property.area} {property.areaUnit}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-primary-600">₹{property.price?.toLocaleString()}</span>
          <Link to={`/properties/${property._id}`} className="text-xs btn-secondary py-1 px-3">View</Link>
        </div>
        {property.numReviews > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-500" />
            <span className="font-medium text-gray-700">{property.avgRating}</span>
            <span>({property.numReviews})</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PropertyList() {
  const { user, isAdmin, isAgent } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '', type: '', status: '', city: '', minPrice: '', maxPrice: '', bedrooms: ''
  });
  const [applied, setApplied] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [mapProperties, setMapProperties] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);

  const load = useCallback(async (pg = 1, params = {}) => {
    setLoading(true);
    try {
      const { data } = await getProperties({ page: pg, limit: 12, ...params });
      console.log('API response:', data);
      setProperties(data || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error('Failed to load properties:', err?.response?.status, err?.response?.data || err.message);
    }
    setLoading(false);
  }, []);

  const loadMap = useCallback(async (params = {}) => {
    setMapLoading(true);
    try {
      const { data } = await getProperties({ page: 1, limit: 200, ...params });
      setMapProperties(data.data || []);
    } catch (err) {
      console.error('Failed to load map properties:', err?.response?.status, err?.response?.data || err.message);
    }
    setMapLoading(false);
  }, []);

  useEffect(() => { load(1, applied); }, [applied]);
  useEffect(() => { if (viewMode === 'map') loadMap(applied); }, [viewMode, applied]);

  const applyFilters = () => {
    const cleaned = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    setApplied(cleaned);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', type: '', status: '', city: '', minPrice: '', maxPrice: '', bedrooms: '' });
    setApplied({});
    setPage(1);
  };

  const goPage = (pg) => {
    setPage(pg);
    load(pg, applied);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutGrid className="w-4 h-4" /> Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 ${viewMode === 'map' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <MapIcon className="w-4 h-4" /> Map
            </button>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
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
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && applyFilters()}
        />
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <select className="input-field text-sm" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
            <option value="">All Types</option>
            {['apartment', 'house', 'villa', 'plot', 'commercial', 'office'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="input-field text-sm" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option>
            {['sale', 'rent', 'sold', 'rented'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input className="input-field text-sm" placeholder="City" value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))} />
          <input className="input-field text-sm" placeholder="Min Price" type="number" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} />
          <input className="input-field text-sm" placeholder="Max Price" type="number" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} />
          <select className="input-field text-sm" value={filters.bedrooms} onChange={e => setFilters(f => ({ ...f, bedrooms: e.target.value }))}>
            <option value="">Bedrooms</option>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+</option>)}
          </select>
          <div className="col-span-2 md:col-span-3 lg:col-span-6 flex gap-2">
            <button onClick={applyFilters} className="btn-primary text-sm">Apply Filters</button>
            <button onClick={clearFilters} className="btn-secondary text-sm">Clear</button>
          </div>
        </div>
      )}

      {/* Results */}
      {viewMode === 'map' ? (
        mapLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 -mt-1">
              Showing admin-approved properties with a pinned location. Listings appear on the map automatically once approved.
            </p>
            <AllPropertiesMap properties={mapProperties} />
          </>
        )
      ) : loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : properties.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No properties found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {properties.map(p => <PropertyCard key={p._id} property={p} user={user} isAdmin={isAdmin} isAgent={isAgent} />)}
        </div>
      )}

      {/* Pagination */}
      {viewMode === 'grid' && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => goPage(page - 1)} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
            <button key={pg} onClick={() => goPage(pg)} className={`w-8 h-8 rounded-lg text-sm font-medium ${pg === page ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'}`}>
              {pg}
            </button>
          ))}
          <button onClick={() => goPage(page + 1)} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
