// src/pages/buyer/PropertyDetail.jsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProperty, deleteProperty, approveProperty } from '../../api/properties';
import { createPurchase } from '../../api/purchases';
import { resolveImageUrl, getPropertyImage } from '../../utils/imageUtils';
import { 
  MapPin, Bed, Bath, Square, Car, CheckCircle, Edit, Trash2, 
  ArrowLeft, Phone, Mail, Building2, ShoppingBag, Star, Heart, 
  GitCompare, Loader2, AlertCircle, DollarSign, Send, MessageCircle,
  X, Calendar, Clock, User, Award, Shield, FileText, Printer,
  ChevronLeft, ChevronRight, Image as ImageIcon, ZoomIn, Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PropertyMap from '../../components/map/PropertyMap';
import { useFavorites } from '../../context/FavoritesContext';
import { useCompare } from '../../context/CompareContext';

// ─── Image Gallery Component ────────────────────────────────────────────
function ImageGallery({ images, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageError, setImageError] = useState({});

  // Get all valid image URLs
  const imageUrls = useCallback(() => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return [];
    }
    
    return images
      .map(img => {
        const url = resolveImageUrl(img);
        // Check if URL is valid
        if (url && !imageError[url]) {
          return url;
        }
        return null;
      })
      .filter(Boolean);
  }, [images, imageError]);

  const validImages = imageUrls();
  const hasImages = validImages.length > 0;

  const handleImageError = (url) => {
    setImageError(prev => ({ ...prev, [url]: true }));
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  // ─── No Images State ──────────────────────────────────────────────────
  if (!hasImages) {
    return (
      <div className="relative w-full h-[400px] md:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <ImageIcon className="w-20 h-20 text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">No Images Available</p>
          <p className="text-gray-400 text-sm">This property has no images yet</p>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
            No Images
          </span>
        </div>
      </div>
    );
  }

  const currentImage = validImages[currentIndex];

  return (
    <>
      {/* Main Gallery */}
      <div className="relative group">
        <div 
          className="relative w-full h-[400px] md:h-[500px] bg-gray-100 rounded-xl overflow-hidden cursor-pointer"
          onClick={() => openLightbox(currentIndex)}
        >
          <img
            src={currentImage}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => handleImageError(currentImage)}
          />
          
          {/* Zoom overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/50 backdrop-blur-sm p-3 rounded-full">
                <Maximize2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm rounded-full">
            {currentIndex + 1} / {validImages.length}
          </div>

          {/* Zoom hint */}
          <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1">
            <ZoomIn className="w-3 h-3" />
            Click to zoom
          </div>
        </div>

        {/* Thumbnails */}
        {validImages.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
            {validImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === currentIndex 
                    ? 'border-primary-600 shadow-lg shadow-primary-500/30' 
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(img)}
                />
                {idx === currentIndex && (
                  <div className="absolute inset-0 bg-primary-600/20" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Lightbox Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
              {currentIndex + 1} / {validImages.length}
            </div>

            {/* Navigation arrows */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Main image */}
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={currentImage}
              alt={`${title} - Zoomed`}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
              onError={() => handleImageError(currentImage)}
            />

            {/* Thumbnails in lightbox */}
            {validImages.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto px-4 max-w-[80vw]">
                {validImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentIndex 
                        ? 'border-white shadow-lg' 
                        : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(img)}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Offer Modal Component ──────────────────────────────────────────────
function OfferModal({ isOpen, onClose, property, onSubmit }) {
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      toast.error('Please enter a valid offer amount');
      return;
    }

    if (parseFloat(offerAmount) > property.price * 1.5) {
      toast.error('Offer amount seems too high. Please check your input.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        propertyId: property._id,
        offerPrice: parseFloat(offerAmount),
        message: message || `I'm interested in ${property.title}`,
      });
      toast.success('Offer submitted successfully!');
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Make an Offer</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Property</p>
              <p className="font-semibold text-gray-900">{property?.title}</p>
              <p className="text-sm text-gray-500">
                Asking Price: {formatPrice(property?.price)}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Offer Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder={`Min: ${(property?.price * 0.5).toLocaleString()}`}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    required
                    min={property?.price * 0.1 || 1000}
                    step="1000"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Suggested range: {formatPrice(property?.price * 0.5)} - {formatPrice(property?.price * 1.2)}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message to the seller..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Offer
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ────────────────────────────────────────────────────
export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isAgent } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isComparing, toggleCompare } = useCompare();

  // ─── Load Property ────────────────────────────────────────────────────
  const loadProperty = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProperty(id);
      console.log('Property API Response:', response);
      
      let propertyData = null;
      if (response) {
        if (response.data) {
          if (response.data.data) {
            propertyData = response.data.data;
          } else if (response.data.property) {
            propertyData = response.data.property;
          } else {
            propertyData = response.data;
          }
        } else if (response.property) {
          propertyData = response.property;
        } else {
          propertyData = response;
        }
      }
      
      if (!propertyData) {
        throw new Error('No property data received');
      }
      
      setProperty(propertyData);
    } catch (err) {
      console.error('Error loading property:', err);
      const errorMessage = err?.response?.data?.message || err.message || 'Property not found';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  // ─── Delete Property ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    setIsProcessing(true);
    try {
      await deleteProperty(id);
      toast.success('Property deleted successfully');
      navigate('/properties');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete property');
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Approve Property ──────────────────────────────────────────────────
  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await approveProperty(id);
      toast.success('Property approved successfully!');
      setProperty(prev => ({ ...prev, isApproved: true }));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve property');
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Submit Offer ─────────────────────────────────────────────────────
  const handleSubmitOffer = async (offerData) => {
    try {
      const response = await createPurchase(offerData);
      console.log('Offer submitted:', response);
      return response;
    } catch (error) {
      console.error('Error submitting offer:', error);
      throw error;
    }
  };

  // ─── Send Message to Agent ────────────────────────────────────────────
  const handleSendMessage = () => {
    if (!property?.agent?.phone) {
      toast.error('Agent contact information not available');
      return;
    }
    
    const message = `Hi, I'm interested in "${property.title}" listed on PropEstate. Is it still available?`;
    const phone = property.agent.phone.replace(/\s/g, '');
    
    // Try WhatsApp first
    if (navigator.userAgent.match(/WhatsApp/i)) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      // Fallback to SMS
      window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
    }
  };

  // ─── Share Property ────────────────────────────────────────────────────
  const handleShare = async () => {
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        toast.error('Failed to share');
      }
    }
  };

  // ─── Handle Print ─────────────────────────────────────────────────────
  const handlePrint = () => {
    window.print();
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        <p className="text-gray-500">Loading property details...</p>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────
  if (error || !property) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-gray-700 font-medium">{error || 'Property not found'}</p>
        <button
          onClick={() => navigate('/properties')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  const isOwner = property.agent?._id === user?.id || property.agent === user?.id;
  const canEdit = isAdmin || isOwner;
  const canMakeOffer = !isOwner && (user?.role === 'buyer' || user?.role === 'agent');
  const isUnavailable = property.status === 'sold' || property.status === 'rented';

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1 truncate">{property.title}</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => toggleFavorite(property._id)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
              isFavorite(property._id) 
                ? 'bg-red-500 border-red-500 text-white' 
                : 'border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-500'
            }`}
          >
            <Heart className="w-4 h-4" fill={isFavorite(property._id) ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => toggleCompare(property)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
              isComparing(property._id) 
                ? 'bg-primary-600 border-primary-600 text-white' 
                : 'border-gray-200 text-gray-500 hover:text-primary-600 hover:border-primary-600'
            }`}
          >
            <GitCompare className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:text-primary-600 hover:border-primary-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          
          <button
            onClick={handlePrint}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:text-primary-600 hover:border-primary-600 transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>
          
          {!property.isApproved && isAdmin && (
            <button 
              onClick={handleApprove} 
              disabled={isProcessing}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
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
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit
              </Link>
              <button 
                onClick={handleDelete} 
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
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

      {/* ─── Image Gallery ──────────────────────────────────────────────── */}
      <ImageGallery images={property.images} title={property.title} />

      {/* Status & Price Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${
            property.status === 'sale' 
              ? 'bg-blue-100 text-blue-700' 
              : property.status === 'rent'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            For {property.status}
          </span>
          <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
            {property.type}
          </span>
          {property.isApproved ? (
            <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-700">
              Approved
            </span>
          ) : (
            <span className="text-sm px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
              Pending Approval
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-3xl font-bold text-primary-600">
              ₹{property.price?.toLocaleString()}
            </p>
            {property.status === 'sale' && (
              <p className="text-xs text-gray-500 mt-1">For Sale</p>
            )}
            {property.status === 'rent' && (
              <p className="text-xs text-gray-500 mt-1">For Rent</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {!isUnavailable && canMakeOffer && (
              <button
                onClick={() => setIsOfferModalOpen(true)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors shadow-lg shadow-primary-500/30"
              >
                <DollarSign className="w-4 h-4" /> 
                Make an Offer
              </button>
            )}
            
            {!isUnavailable && (
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors shadow-lg shadow-green-500/30"
              >
                <MessageCircle className="w-4 h-4" /> 
                Contact Agent
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-gray-500 text-sm mt-3 pt-3 border-t border-gray-100">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>
            {property.location?.address}, {property.location?.city}, {property.location?.state}
            {property.location?.pincode && ` - ${property.location.pincode}`}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Property Details Grid */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Property Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: Square, label: 'Area', value: `${property.area} ${property.areaUnit || 'sq ft'}` },
                { icon: Bed, label: 'Bedrooms', value: property.bedrooms || 'N/A' },
                { icon: Bath, label: 'Bathrooms', value: property.bathrooms || 'N/A' },
                { icon: Building2, label: 'Floors', value: property.floors || 1 },
                { icon: Car, label: 'Parking', value: property.parking ? 'Yes' : 'No' },
                { icon: CheckCircle, label: 'Furnished', value: property.furnished?.replace('-', ' ') || 'None' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
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
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {property.description || 'No description available'}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          <PropertyMap 
            property={property} 
            canPreview={canEdit} 
          />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {!isUnavailable && canMakeOffer && (
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <DollarSign className="w-4 h-4" /> 
                  Make an Offer
                </button>
              )}
              
              <button
                onClick={handleSendMessage}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> 
                Contact Agent
              </button>
              
              <button
                onClick={handlePrint}
                className="w-full px-4 py-3 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" /> 
                Print Details
              </button>
            </div>
          </div>

          {/* Agent Info */}
          {property.agent && typeof property.agent === 'object' && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Listed By</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                  {property.agent.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{property.agent.name || 'Agent'}</p>
                  <p className="text-xs text-gray-500">Real Estate Agent</p>
                </div>
              </div>
              
              {property.agent.email && (
                <a 
                  href={`mailto:${property.agent.email}`} 
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 mb-2 transition-colors"
                >
                  <Mail className="w-4 h-4" /> {property.agent.email}
                </a>
              )}
              
              {property.agent.phone && (
                <a 
                  href={`tel:${property.agent.phone}`} 
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Phone className="w-4 h-4" /> {property.agent.phone}
                </a>
              )}
              
              {property.agent.phone && (
                <button
                  onClick={handleSendMessage}
                  className="mt-3 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> 
                  Send Message
                </button>
              )}
            </div>
          )}

          {/* Property ID & Date */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Property ID</span>
                <span className="font-mono text-gray-900">{property._id?.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Listed Date</span>
                <span className="text-gray-900">
                  {new Date(property.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              {property.updatedAt && property.updatedAt !== property.createdAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="text-gray-900">
                    {new Date(property.updatedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        property={property}
        onSubmit={handleSubmitOffer}
      />
    </div>
  );
}