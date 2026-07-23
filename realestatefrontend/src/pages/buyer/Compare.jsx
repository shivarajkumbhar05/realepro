import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, MapPin, X, GitCompare, Bed, Bath, Square, DollarSign, Home, ArrowLeft, Heart, Calendar, Star, Users, Phone, Mail, Globe, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { useCompare } from "../../context/CompareContext";
import { resolveImageUrl } from "../../utils/imageUtils";
import { useFavorites } from "../../context/FavoritesContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

function formatPrice(n) {
  if (!n) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString()}`;
}

function PropertyCard({ property, onRemove, isLast }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [imageError, setImageError] = useState(false);
  
  const img = property.images?.[0] ? resolveImageUrl(property.images[0]) : null;
  const saved = isFavorite(property._id);

  const features = [
    { icon: Bed, label: 'Bedrooms', value: property.bedrooms || 0 },
    { icon: Bath, label: 'Bathrooms', value: property.bathrooms || 0 },
    { icon: Square, label: 'Area', value: `${property.area || 0} ${property.areaUnit || 'sqft'}` },
    { icon: Home, label: 'Type', value: property.propertyType || 'N/A' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 ${!isLast ? 'mb-6' : ''}`}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
        {img && !imageError ? (
          <img
            src={img}
            alt={property.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-16 h-16 text-gray-300" />
          </div>
        )}
        
        {/* Remove Button */}
        <button
          onClick={() => onRemove(property._id)}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-50 hover:text-red-500 transition-all duration-300 group"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        </button>

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
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2.5 py-1.5 rounded-full text-white text-xs">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{property.avgRating}</span>
            <span className="text-gray-400">({property.numReviews})</span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(property._id)}
          className={`absolute bottom-3 right-3 p-2 rounded-full shadow-lg transition-all duration-300 ${
            saved ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <Heart className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title & Location */}
        <Link to={`/properties/${property._id}`} className="block group">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {property.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{property.location?.city}, {property.location?.state}</span>
        </div>

        {/* Price */}
        <div className="mt-3 text-2xl font-bold text-primary-600">
          {formatPrice(property.price)}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {features.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <Icon className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-700">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        {property.description && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {property.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <Link
            to={`/properties/${property._id}`}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg"
          >
            View Details
          </Link>
          <button
            onClick={() => {
              const phone = property.agent?.phone || '+919545089118';
              window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
            }}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg flex items-center gap-1"
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Compare() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (compareList.length === 0) {
      toast.error('No properties to compare. Please add some properties first.');
      navigate('/properties');
    }
  }, [compareList, navigate]);

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <GitCompare className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">No Properties to Compare</h2>
          <p className="text-gray-500 mt-2">Add properties to compare by clicking the compare button on any property card.</p>
          <Link to="/properties" className="btn-primary inline-block mt-6">
            Browse Properties
          </Link>
        </div>
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
              <GitCompare className="w-8 h-8 text-primary-600" />
              Compare Properties
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {compareList.length} properties
              </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              {showComparison ? 'Hide Comparison' : 'Show Comparison'}
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all properties from comparison?')) {
                  clearCompare();
                  toast.success('Comparison list cleared');
                }
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        {showComparison && compareList.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8"
          >
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Quick Comparison</h3>
              <p className="text-sm text-gray-500">Compare key features side by side</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 bg-gray-50">Feature</th>
                    {compareList.map((property) => (
                      <th key={property._id} className="px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-[150px]">
                        {property.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Price', key: 'price', format: (val) => formatPrice(val) },
                    { label: 'Type', key: 'propertyType' },
                    { label: 'Status', key: 'status' },
                    { label: 'Bedrooms', key: 'bedrooms' },
                    { label: 'Bathrooms', key: 'bathrooms' },
                    { label: 'Area', key: 'area', format: (val, prop) => `${val} ${prop.areaUnit || 'sqft'}` },
                    { label: 'Location', key: 'location', format: (val) => `${val?.city}, ${val?.state}` },
                    { label: 'Views', key: 'views' },
                  ].map(({ label, key, format }) => (
                    <tr key={label} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">{label}</td>
                      {compareList.map((property) => (
                        <td key={property._id} className="px-4 py-3 text-sm text-gray-600">
                          {format ? format(property[key], property) : property[key] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {compareList.map((property, index) => (
              <PropertyCard
                key={property._id}
                property={property}
                onRemove={removeFromCompare}
                isLast={index === compareList.length - 1}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State for Add More */}
        <div className="mt-8 text-center">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <Building2 className="w-5 h-5" />
            Add more properties to compare
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}