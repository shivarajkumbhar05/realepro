import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProperty, deleteProperty, approveProperty } from '../../api/properties';
import { 
  MapPin, Bed, Bath, Square, Car, CheckCircle, Edit, Trash2, 
  ArrowLeft, Phone, Mail, Building2, ShoppingBag, Star, 
  AlertCircle, Clock, Calendar, Home, DollarSign, Shield,
  Wifi, Dumbbell, Coffee, ParkingCircle, Waves, Flame,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import PhotoGallery from '../../components/property/PhotoGallery';
import ReviewSection from '../../components/property/ReviewSection';
import DocumentVerification from '../../components/property/DocumentVerification';
import BuyModal from '../../components/property/BuyModal';
import WhatsAppButton from '../../components/chat/WhatsAppButton';
import PropertyMap from '../../components/map/PropertyMap';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://realepro.onrender.com';

// ✅ FIXED: Image URL helper
// Handles absolute URLs, protocol-relative URLs, relative paths,
// AND malformed protocols like "https//..." (missing colon) which
// were causing BASE + "https//picsum..." to get mashed together.
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // Trim stray whitespace that sometimes sneaks in from seed data
  imagePath = imagePath.trim();

  // Fix malformed protocol: "https//..." or "http//..." (missing colon)
  if (/^https?\/\//i.test(imagePath) && !/^https?:\/\//i.test(imagePath)) {
    imagePath = imagePath.replace(/^(https?)\/\//i, '$1://');
  }

  // If it's a full URL (http:// or https://)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a protocol-relative URL (starts with //)
  if (imagePath.startsWith('//')) {
    return `https:${imagePath}`;
  }

  // If it's a relative path starting with /uploads or /images
  if (imagePath.startsWith('/uploads/') || imagePath.startsWith('/images/')) {
    return `${BASE}${imagePath}`;
  }

  // If it's a relative path without leading slash
  if (!imagePath.startsWith('/')) {
    return `${BASE}/${imagePath}`;
  }

  // Default: prepend BASE
  return `${BASE}${imagePath}`;
};

// Debug helper
const debugLog = (message, data = null) => {
  console.log(`[PropertyDetail] ${message}`, data || '');
};

// Amenity icon mapping
const amenityIcons = {
  'wifi': Wifi,
  'parking': ParkingCircle,
  'gym': Dumbbell,
  'pool': Waves,
  'ac': Flame,
  'furnished': Home,
  'security': Shield,
  'cafe': Coffee,
  'elevator': Building2
};

const getAmenityIcon = (amenity) => {
  const key = amenity.toLowerCase();
  return amenityIcons[key] || CheckCircle;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return 'Invalid Date';
  }
};

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
      <div className="flex-1 h-8 bg-gray-200 rounded-lg animate-pulse" />
    </div>
    <div className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-6">
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  </div>
);

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isAgent } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  const fetchProperty = useCallback(async () => {
    setLoading(true);
    setError(null);
    debugLog('Fetching property with ID:', id);
    
    try {
      const response = await getProperty(id);
      debugLog('Raw API Response:', response);
      
      // Handle different response structures
      let propertyData = null;
      
      if (response) {
        // Check if response has data property
        if (response.data) {
          // If data is nested in response.data.data
          if (response.data.data) {
            propertyData = response.data.data;
            debugLog('Extracted from response.data.data:', propertyData);
          } 
          // If response.data is the property object directly
          else if (typeof response.data === 'object' && response.data._id) {
            propertyData = response.data;
            debugLog('Extracted from response.data:', propertyData);
          }
          // If response.data is an array (shouldn't happen for single property)
          else if (Array.isArray(response.data)) {
            propertyData = response.data[0] || null;
            debugLog('Extracted from response.data array:', propertyData);
          }
        } 
        // If response itself is the property object
        else if (typeof response === 'object' && response._id) {
          propertyData = response;
          debugLog('Response is property object directly:', propertyData);
        }
        // If response is an array
        else if (Array.isArray(response)) {
          propertyData = response[0] || null;
          debugLog('Response is array:', propertyData);
        }
      }
      
      // Validate property data
      if (propertyData && propertyData._id) {
        // ✅ FIXED: Process images with proper URLs
        if (propertyData.images && Array.isArray(propertyData.images)) {
          propertyData.images = propertyData.images
            .map(img => {
              if (typeof img === 'string') {
                const url = getImageUrl(img);
                return url ? { path: url, isPrimary: false } : null;
              }
              const url = getImageUrl(img?.path);
              return url ? { ...img, path: url } : null;
            })
            .filter(Boolean); // drop any images that couldn't be resolved
        }
        
        debugLog('Valid property data found:', {
          id: propertyData._id,
          title: propertyData.title,
          price: propertyData.price,
          status: propertyData.status,
          imageCount: propertyData.images?.length || 0
        });
        
        setProperty(propertyData);
        setDebugInfo({
          propertyId: propertyData._id,
          title: propertyData.title,
          hasImages: !!propertyData.images?.length,
          hasAgent: !!propertyData.agent
        });
      } else {
        debugLog('Invalid property data structure:', propertyData);
        setError('Property data could not be parsed correctly');
        toast.error('Failed to parse property data');
      }
      
    } catch (err) {
      console.error('Error fetching property:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Property not found';
      setError(errorMessage);
      toast.error(errorMessage);
      debugLog('Error details:', {
        status: err.response?.status,
        message: errorMessage,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProperty();
    } else {
      setError('No property ID provided');
      setLoading(false);
    }
  }, [id, fetchProperty]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;
    
    setDeleting(true);
    try {
      await deleteProperty(id);
      toast.success('Property deleted successfully');
      navigate('/properties');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete property');
      setDeleting(false);
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      await approveProperty(id);
      toast.success('Property approved successfully!');
      setProperty(p => ({ ...p, isApproved: true }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve property');
    } finally {
      setApproving(false);
    }
  };

  // Show loading state
  if (loading) {
    return <SkeletonLoader />;
  }

  // Show error state with retry
  if (error || !property) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Property Not Found</h3>
          <p className="text-gray-500 max-w-md mb-4">
            {error || 'The property you are looking for does not exist or has been removed.'}
          </p>
          {debugInfo && (
            <div className="bg-gray-100 p-4 rounded-lg mb-4 text-left w-full max-w-md overflow-auto">
              <p className="text-xs font-mono text-gray-600">
                <strong>Debug Info:</strong><br />
                Property ID: {debugInfo.propertyId}<br />
                Title: {debugInfo.title}<br />
                Has Images: {debugInfo.hasImages ? 'Yes' : 'No'}<br />
                Has Agent: {debugInfo.hasAgent ? 'Yes' : 'No'}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={fetchProperty} className="btn-primary">
              Try Again
            </button>
            <Link to="/properties" className="btn-secondary">
              Back to Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Validate required fields
  if (!property._id) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Invalid Property Data</h3>
          <p className="text-gray-500 mb-4">The property data is incomplete or corrupted.</p>
          <Link to="/properties" className="btn-primary">Back to Properties</Link>
        </div>
      </div>
    );
  }

  const isOwner = property.agent?._id === user?.id || property.agent === user?.id;
  const canEdit = isAdmin || isOwner;
  const canBuy = user?.role === 'buyer' || (user?.role === 'agent' && !isOwner);
  const isUnavailable = property.status === 'sold' || property.status === 'rented';
  const isPending = !property.isApproved;

  // Safe access to nested properties
  const location = property.location || {};
  const agent = property.agent || {};
  const agentId = agent._id || agent;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            {property.title || 'Untitled Property'}
          </h1>
        </div>
        
        <div className="flex flex-wrap gap-2 ml-auto">
          {isPending && isAdmin && (
            <button 
              onClick={handleApprove} 
              disabled={approving}
              className="bg-green-600 text-white hover:bg-green-700 text-sm px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              {approving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Approve
            </button>
          )}
          
          {canEdit && (
            <>
              <Link 
                to={`/agent/my-listings/${id}/edit`} 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Edit className="w-4 h-4" /> Edit
              </Link>
              <button 
                onClick={handleDelete} 
                disabled={deleting}
                className="bg-red-600 text-white hover:bg-red-700 text-sm px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Photo Gallery */}
      <PhotoGallery 
        propertyId={property._id} 
        images={property.images || []} 
        canEdit={canEdit} 
      />

      {/* Status & Rating */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            property.status === 'sale' ? 'bg-blue-100 text-blue-700' : 
            property.status === 'rent' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {property.status === 'sale' ? 'For Sale' : 
             property.status === 'rent' ? 'For Rent' : 
             (property.status || 'Unknown')}
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm capitalize">
            {property.type || 'Property'}
          </span>
          {property.isApproved ? (
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Approved
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium flex items-center gap-1 animate-pulse">
              <Clock className="w-3.5 h-3.5" /> Pending Approval
            </span>
          )}
        </div>
        
        {property.numReviews > 0 && (
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span className="text-sm font-semibold text-gray-900">
              {typeof property.avgRating === 'number' ? property.avgRating.toFixed(1) : 'N/A'}
            </span>
            <span className="text-xs text-gray-500">
              ({property.numReviews} {property.numReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}
        
        {property.createdAt && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Listed {formatDate(property.createdAt)}
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content - 2/3 width */}
        <div className="lg:col-span-2 space-y-5">
          {/* Price & Action */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-primary-600">
                  ₹{typeof property.price === 'number' ? property.price.toLocaleString() : 'N/A'}
                </p>
                {property.status === 'rent' && (
                  <p className="text-sm text-gray-500">per month</p>
                )}
              </div>
              
              {canBuy && !isOwner && (
                <button
                  onClick={() => setBuyModalOpen(true)}
                  disabled={isUnavailable}
                  className="bg-primary-600 hover:bg-primary-700 text-white text-base px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ShoppingBag className="w-5 h-5" /> 
                  {isUnavailable ? 'Unavailable' : 'Inquire Now'}
                </button>
              )}
            </div>
            
            <div className="flex items-start gap-2 text-gray-500 text-sm mt-3">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                {location.address || 'Address not specified'}, 
                {location.city || 'City not specified'}, 
                {location.state || 'State not specified'}
                {location.pincode && ` - ${location.pincode}`}
              </span>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-primary-500" />
              Property Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: Square, label: 'Area', value: `${property.area || 'N/A'} ${property.areaUnit || 'sqft'}` },
                { icon: Bed, label: 'Bedrooms', value: property.bedrooms || 'N/A' },
                { icon: Bath, label: 'Bathrooms', value: property.bathrooms || 'N/A' },
                { icon: Building2, label: 'Floors', value: property.floors || '1' },
                { icon: Car, label: 'Parking', value: property.parking ? 'Available' : 'Not Available' },
                { icon: CheckCircle, label: 'Furnished', value: property.furnished?.replace('-', ' ') || 'N/A' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 transition-all hover:bg-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-primary-500" />
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                  <p className="font-medium text-gray-900 capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map(amenity => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <span 
                      key={amenity} 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Map - Only if property has location */}
          {location.lat && location.lng && (
            <PropertyMap property={property} canPreview={canEdit} />
          )}

          {/* Reviews */}
          <ReviewSection propertyId={property._id} />
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-5">
          {/* Agent Info */}
          {agent && typeof agent === 'object' && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Listed By</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg flex-shrink-0">
                  {agent.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{agent.name || 'Agent'}</p>
                  <p className="text-xs text-gray-500">Real Estate Agent</p>
                  {agent.experience && (
                    <p className="text-xs text-gray-400">{agent.experience} years experience</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                {agent.email && (
                  <a 
                    href={`mailto:${agent.email}`} 
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{agent.email}</span>
                  </a>
                )}
                {agent.phone && (
                  <a 
                    href={`tel:${agent.phone}`} 
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{agent.phone}</span>
                  </a>
                )}
              </div>
              
              {!isOwner && agent.phone && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <WhatsAppButton
                    phone={agent.phone}
                    message={`Hi, I'm interested in "${property.title}" listed on PropEstate. Is it still available?`}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {location.city && (
                <Link 
                  to={`/properties?search=${encodeURIComponent(location.city)}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  View more in {location.city}
                </Link>
              )}
              {canEdit && (
                <button 
                  onClick={() => window.open(`/properties/${property._id}/preview`, '_blank')}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors w-full text-left"
                >
                  <Home className="w-4 h-4" />
                  Preview listing
                </button>
              )}
            </div>
          </div>

          {/* Document Verification */}
          {(canEdit || isAdmin) && (
            <DocumentVerification property={property} canVerify={canEdit} />
          )}
        </div>
      </div>

      {/* Buy Modal */}
      {buyModalOpen && (
        <BuyModal
          property={property}
          onClose={() => setBuyModalOpen(false)}
          onSuccess={() => {
            toast.success('Inquiry sent successfully!');
            setBuyModalOpen(false);
          }}
        />
      )}
    </div>
  );
}