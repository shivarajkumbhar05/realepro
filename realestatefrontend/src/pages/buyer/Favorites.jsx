import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, MapPin, Bed, Bath, Square, Heart, Star, Trash2, ArrowLeft, ShoppingBag, Home, Phone, Mail, Clock, Filter, Grid3x3, List, ChevronDown, ChevronUp } from "lucide-react";
import { useFavorites } from "../../context/FavoritesContext";
import { resolveImageUrl } from "../../utils/ImageURL";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

function formatPrice(n) {
  if (!n) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString()}`;
}

function FavoriteCard({ property, onRemove, index }) {
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const img = property.images?.[0] ? resolveImageUrl(property.images[0]) : null;

  const features = [
    { icon: Bed, label: 'Bedrooms', value: property.bedrooms || 0 },
    { icon: Bath, label: 'Bathrooms', value: property.bathrooms || 0 },
    { icon: Square, label: 'Area', value: `${property.area || 0} ${property.areaUnit || 'sqft'}` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="relative sm:w-64 md:w-72 lg:w-80 aspect-[4/3] sm:aspect-auto sm:min-h-[200px] bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
          {img && !imageError ? (
            <img
              src={img}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-16 h-16 text-gray-300" />
            </div>
          )}
          
          {/* Status Badge */}
          <span className={`absolute top-3 left-3 text-xs px-3 py-1.5 rounded-full font-medium shadow-lg ${
            property.status === 'sale' ? 'bg-blue-600 text-white' : 
            property.status === 'rent' ? 'bg-purple-600 text-white' : 
            'bg-gray-600 text-white'
          }`}>
            For {property.status}
          </span>

          {/* Rating */}
          {property.numReviews > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2.5 py-1.5 rounded-full text-white text-xs">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{property.avgRating}</span>
              <span className="text-gray-400">({property.numReviews})</span>
            </div>
          )}

          {/* Remove Button - Visible on hover */}
          <button
            onClick={() => onRemove(property._id)}
            className="absolute bottom-3 right-3 p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col">
          {/* Title & Location */}
          <Link to={`/properties/${property._id}`} className="block group-hover:text-primary-600 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {property.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{property.location?.city}, {property.location?.state}</span>
          </div>

          {/* Price & Features */}
          <div className="flex flex-wrap items-center justify-between mt-3">
            <div className="text-2xl font-bold text-primary-600">
              {formatPrice(property.price)}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {features.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                  <Icon className="w-3 h-3" />
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <p className={`mt-3 text-sm text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
              {property.description}
            </p>
          )}
          {property.description && property.description.length > 100 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1 flex items-center gap-1"
            >
              {isExpanded ? (
                <>Show less <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>Show more <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <Link
              to={`/properties/${property._id}`}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              View Details
            </Link>
            <button
              onClick={() => {
                const phone = property.agent?.phone || '+919545089118';
                window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
              }}
              className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg flex items-center gap-2"
              title="Contact via WhatsApp"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={() => onRemove(property._id)}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 sm:hidden"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Additional Info */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Added {new Date(property.createdAt).toLocaleDateString()}
            </span>
            {property.views > 0 && (
              <span>{property.views} views</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Favorites() {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter favorites
  const filteredFavorites = favorites.filter(property => {
    // Status filter
    if (filter !== 'all' && property.status !== filter) return false;
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const titleMatch = property.title?.toLowerCase().includes(search);
      const cityMatch = property.location?.city?.toLowerCase().includes(search);
      const stateMatch = property.location?.state?.toLowerCase().includes(search);
      if (!titleMatch && !cityMatch && !stateMatch) return false;
    }
    
    return true;
  });

  useEffect(() => {
    if (favorites.length === 0 && !searchTerm && filter === 'all') {
      // Don't show toast immediately, only after a delay
      const timer = setTimeout(() => {
        // Optional: Show a subtle message
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [favorites, searchTerm, filter]);

  const handleRemoveAll = () => {
    if (window.confirm('Are you sure you want to remove all properties from your favorites?')) {
      clearFavorites();
      toast.success('All favorites cleared');
    }
  };

  if (favorites.length === 0 && !searchTerm && filter === 'all') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-16 h-16 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">No Favorites Yet</h2>
          <p className="text-gray-500 mt-2">
            Start exploring properties and click the heart icon to save your favorites.
          </p>
          <Link to="/properties" className="btn-primary inline-block mt-6">
            Browse Properties
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link to="/properties" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Properties
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-current" />
              My Favorites
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {favorites.length} properties
              </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* View Toggle */}
            <div className="hidden sm:flex bg-white border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>

            {favorites.length > 0 && (
              <button
                onClick={handleRemoveAll}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        {favorites.length > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            Showing {filteredFavorites.length} of {favorites.length} favorite properties
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        )}

        {/* Favorites Grid */}
        {filteredFavorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500">
              {searchTerm ? 'No favorites match your search.' : 'No properties found.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <AnimatePresence>
              {filteredFavorites.map((property, index) => (
                <FavoriteCard
                  key={property._id}
                  property={property}
                  onRemove={removeFavorite}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Quick Actions */}
        {favorites.length > 0 && (
          <div className="mt-8 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <ShoppingBag className="w-5 h-5 text-primary-600" />
              <span>
                You have <strong className="text-gray-900">{favorites.length}</strong> favorite properties
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/properties"
                className="px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl text-sm font-medium transition-colors"
              >
                Find More
              </Link>
              <Link
                to="/compare"
                className="px-4 py-2 bg-white border border-gray-200 hover:border-primary-300 text-gray-700 rounded-xl text-sm font-medium transition-colors"
              >
                Compare Properties
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add Search icon if not imported
import { Search } from "lucide-react";