// src/components/map/PropertyMap.jsx
import { MapPin, Loader2, EyeOff, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const PropertyMap = ({ property, canPreview = false, className = '' }) => {
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  // Check if property has location data
  const hasLocation = property?.location?.latitude && property?.location?.longitude;
  
  // Determine if map should be shown
  const shouldShowMap = property?.isApproved || canPreview;

  useEffect(() => {
    if (shouldShowMap && hasLocation) {
      setLoading(false);
      setShowMap(true);
    } else {
      setLoading(false);
    }
  }, [shouldShowMap, hasLocation]);

  const handleToggleMap = () => {
    setShowMap(!showMap);
  };

  // If no location data
  if (!hasLocation) {
    return (
      <div className={`bg-white rounded-2xl overflow-hidden border border-gray-200 ${className || ''}`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Location</h3>
          </div>
          <span className="text-sm text-gray-500">📍 Location not specified</span>
        </div>
        <div className="relative w-full h-64 bg-gray-100 flex items-center justify-center">
          <div className="text-center p-4">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">No location data available</p>
            <p className="text-sm text-gray-400">Property location hasn't been set yet</p>
          </div>
        </div>
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <MapPin className="w-3 h-3 inline mr-1" />
            {property?.location?.city || 'Location'} {property?.location?.state && `, ${property.location.state}`}
          </p>
        </div>
      </div>
    );
  }

  // If property is pending and user can't preview
  if (!property?.isApproved && !canPreview) {
    return (
      <div className={`bg-white rounded-2xl overflow-hidden border border-gray-200 ${className || ''}`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Location</h3>
          </div>
          <span className="text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Pending Approval</span>
        </div>
        <div className="relative w-full h-64 bg-gray-100 flex items-center justify-center">
          <div className="text-center p-4">
            <EyeOff className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">Location Hidden</p>
            <p className="text-sm text-gray-400">This property's location will be visible after approval</p>
          </div>
        </div>
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <MapPin className="w-3 h-3 inline mr-1" />
            {property?.location?.city || 'Location'} {property?.location?.state && `, ${property.location.state}`}
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white rounded-2xl overflow-hidden border border-gray-200 ${className || ''}`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Location</h3>
          </div>
        </div>
        <div className="relative w-full h-64 bg-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  // Build map URL - using OpenStreetMap
  const lat = property.location.latitude;
  const lng = property.location.longitude;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01}%2C${lat-0.01}%2C${lng+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border border-gray-200 ${className || ''}`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Location</h3>
        </div>
        <div className="flex items-center gap-2">
          {property?.isApproved && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Verified</span>
          )}
          <button
            onClick={handleToggleMap}
            className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
      </div>
      
      <div className="relative w-full h-64 bg-gray-100">
        {showMap ? (
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map of ${property.title || 'Property'}`}
            className="absolute inset-0"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center p-4">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">Click to view location</p>
              <button
                onClick={handleToggleMap}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Show on Map
              </button>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-lg shadow-lg text-xs text-gray-600">
          <MapPin className="w-3 h-3 inline mr-1 text-primary-600" />
          {property?.location?.city || 'Location'} 
          {property?.location?.state && `, ${property.location.state}`}
        </div>
      </div>
      
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <MapPin className="w-3 h-3 inline mr-1" />
          {property?.location?.address || property?.location?.city || 'Address not specified'}
          {property?.location?.pincode && ` - ${property.location.pincode}`}
        </p>
      </div>
    </div>
  );
};

export default PropertyMap;