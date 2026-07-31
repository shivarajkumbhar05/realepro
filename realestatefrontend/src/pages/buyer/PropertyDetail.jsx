import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Bed, Bath, Square, 
  Calendar, Heart, Share2, Phone, Mail,
  MessageCircle, CheckCircle, XCircle, 
  Car, Wifi, Tv, Dumbbell, Coffee, Utensils,
  Building2, Home, Users, AlertTriangle,
  Loader2, Image as ImageIcon,
  ChevronLeft, ChevronRight, ZoomIn,
  Download, Printer, Bookmark, Shield,
  TreePine, Droplets, Sparkles,
  Clock, User, Award, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getPropertyById } from '../../api/properties';
import { useAuth } from '../../context/AuthContext';

// ─── Loading Skeleton ──────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        {/* Back button */}
        <div className="h-6 w-24 bg-gray-200 rounded mb-6" />
        
        {/* Image placeholder */}
        <div className="w-full h-96 bg-gray-200 rounded-2xl mb-6" />
        
        {/* Title */}
        <div className="h-10 w-3/4 bg-gray-200 rounded mb-4" />
        
        {/* Location */}
        <div className="h-6 w-1/2 bg-gray-200 rounded mb-6" />
        
        {/* Price */}
        <div className="h-20 bg-gray-200 rounded-2xl mb-6" />
        
        {/* Features grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl" />
          ))}
        </div>
        
        {/* Description */}
        <div className="h-40 bg-gray-200 rounded-2xl mb-6" />
      </div>
    </div>
  </div>
);

// ─── Error Display ─────────────────────────────────────────────────
const ErrorDisplay = ({ message, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
    <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-lg">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
      <p className="text-gray-600 mb-6">{message || 'Unable to load property details.'}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary-500/30"
      >
        Try Again
      </button>
    </div>
  </div>
);

// ─── Image Gallery ──────────────────────────────────────────────────
const ImageGallery = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden bg-gray-100">
        <img
          src={images[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setIsZoomed(true)}
        />
        
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex ? 'border-primary-600 shadow-lg' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      
      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={images[currentIndex]}
              alt="Zoomed view"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <XCircle className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────
export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching property with ID:', id);
        const response = await getPropertyById(id);
        console.log('API Response:', response);
        
        // Extract property data from response
        let propertyData = response;
        if (response?.data?.data) {
          propertyData = response.data.data;
        } else if (response?.data) {
          propertyData = response.data;
        }
        
        console.log('Extracted property data:', propertyData);
        
        if (!propertyData || typeof propertyData !== 'object') {
          throw new Error('Invalid property data received');
        }
        
        setProperty(propertyData);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(err.message || 'Failed to load property');
        toast.error('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    } else {
      setError('No property ID provided');
      setLoading(false);
    }
  }, [id]);

  // Loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error || !property) {
    return (
      <ErrorDisplay 
        message={error} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  // Destructure property data with fallbacks
  const {
    title = 'Property',
    description = 'No description available',
    price = 0,
    status = 'available',
    type = 'property',
    location = {},
    bedrooms = 0,
    bathrooms = 0,
    area = 0,
    yearBuilt = 'N/A',
    images = [],
    amenities = [],
    agent = null,
    createdAt = new Date(),
    rating = 0,
    reviewCount = 0
  } = property;

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    }
    if (price >= 1000) {
      return `₹${(price / 1000).toFixed(0)}K`;
    }
    return `₹${price}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'available': 'green',
      'sold': 'red',
      'pending': 'yellow',
      'rented': 'blue',
      'under_construction': 'orange'
    };
    return colors[status?.toLowerCase()] || 'gray';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'available': 'Available',
      'sold': 'Sold',
      'pending': 'Pending',
      'rented': 'Rented',
      'under_construction': 'Under Construction'
    };
    return labels[status?.toLowerCase()] || status || 'Available';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Properties</span>
        </button>

        {/* Image Gallery */}
        <ImageGallery images={images} title={title} />

        {/* Property Header */}
        <div className="mt-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-gray-500">
                <MapPin className="w-4 h-4" />
                {location?.address || location?.city || 'Location not specified'}
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="text-gray-500 capitalize">{type}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(status)}-100 text-${getStatusColor(status)}-700 capitalize`}>
                {getStatusLabel(status)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2 rounded-xl border transition-all ${
                isSaved 
                  ? 'border-primary-500 bg-primary-50 text-primary-600' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-600'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-primary-600' : ''}`} />
            </button>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-xl border transition-all ${
                isLiked 
                  ? 'border-red-500 bg-red-50 text-red-500' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title, text: description, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard!');
                }
              }}
              className="p-2 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-600 transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Price & Rating */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-primary-50 to-indigo-50 rounded-2xl border border-primary-100">
          <div>
            <p className="text-3xl font-bold text-gray-900">{formatPrice(price)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {status === 'sold' ? 'Property sold' : status === 'rented' ? 'Property rented' : `For ${type || 'sale'}`}
            </p>
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
            </div>
          )}
        </div>

        {/* Key Features */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Bedrooms</p>
                <p className="font-semibold text-gray-900">{bedrooms}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                <Bath className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Bathrooms</p>
                <p className="font-semibold text-gray-900">{bathrooms}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                <Square className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Area</p>
                <p className="font-semibold text-gray-900">{area} sq ft</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Year Built</p>
                <p className="font-semibold text-gray-900">{yearBuilt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>

        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {amenity.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Card */}
        {agent && (
          <div className="mt-6 bg-gradient-to-br from-slate-900 via-primary-700 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-primary-100">Property Contact</p>
                <h3 className="text-xl font-semibold mt-1">Talk to the agent</h3>
              </div>
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-bold">
                {agent?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <p className="font-semibold text-lg">{agent?.name || 'Property Agent'}</p>
                <p className="text-sm text-primary-100">{agent?.role || 'Real Estate Agent'}</p>
              </div>

              <div className="space-y-2 text-sm">
                {agent?.email && (
                  <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-primary-50 hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                    {agent.email}
                  </a>
                )}
                {agent?.phone && (
                  <a href={`tel:${agent.phone}`} className="flex items-center gap-2 text-primary-50 hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                    {agent.phone}
                  </a>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {agent?.phone && (
                <a href={`tel:${agent.phone}`} className="inline-flex items-center gap-2 bg-white text-primary-700 px-4 py-2 rounded-xl font-medium hover:bg-primary-50 transition-colors">
                  <Phone className="w-4 h-4" />
                  Call now
                </a>
              )}
              {agent?.email && (
                <a href={`mailto:${agent.email}?subject=${encodeURIComponent(`Interested in ${title}`)}`} className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl font-medium hover:bg-white/20 transition-colors">
                  <Mail className="w-4 h-4" />
                  Email agent
                </a>
              )}
              <button
                onClick={() => toast.success('Agent contact details are available above.')}
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl font-medium hover:bg-white/20 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Request info
              </button>
            </div>
          </div>
        )}

        {/* Property ID & Date */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
            <span>Property ID: <span className="font-mono text-gray-700">{id}</span></span>
            <span>Listed on: {new Date(createdAt).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}</span>
          </div>
        </div>

      </div>
    </div>
  );
}