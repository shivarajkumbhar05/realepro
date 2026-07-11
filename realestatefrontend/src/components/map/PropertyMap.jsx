import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import { 
  MapPin, ShieldCheck, Clock, Navigation, 
  Maximize2, Minimize2, ZoomIn, ZoomOut,
  Home, Building2, Check, AlertCircle, Eye
} from 'lucide-react';
import { pinIcon } from './mapIcons';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// ─── Map Controls ──────────────────────────────────────────────────────
function PropertyMapControls({ onZoomIn, onZoomOut, onReset, onFullscreen, isFullscreen }) {
  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-all flex items-center justify-center border border-gray-200/50 hover:shadow-xl"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4 text-gray-600" />
      </button>
      <button
        onClick={onZoomOut}
        className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-all flex items-center justify-center border border-gray-200/50 hover:shadow-xl"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4 text-gray-600" />
      </button>
      <button
        onClick={onReset}
        className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-all flex items-center justify-center border border-gray-200/50 hover:shadow-xl"
        title="Reset View"
      >
        <Navigation className="w-4 h-4 text-gray-600" />
      </button>
      <button
        onClick={onFullscreen}
        className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-all flex items-center justify-center border border-gray-200/50 hover:shadow-xl"
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? (
          <Minimize2 className="w-4 h-4 text-gray-600" />
        ) : (
          <Maximize2 className="w-4 h-4 text-gray-600" />
        )}
      </button>
    </div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────
function StatusBadge({ status, canPreview }) {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <ShieldCheck className="w-3.5 h-3.5" />
        Verified Location
      </span>
    );
  }
  if (canPreview) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        <Eye className="w-3.5 h-3.5" />
        Preview — Pending Approval
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
      <Clock className="w-3.5 h-3.5" />
      Location Pending
    </span>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────
function EmptyState({ type }) {
  const isPending = type === 'pending';
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card p-5"
    >
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary-500" /> Location
      </h3>
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            {isPending ? (
              <Clock className="w-8 h-8 text-gray-400" />
            ) : (
              <MapPin className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <p className="text-sm font-medium text-gray-600">
            {isPending ? 'Awaiting Admin Approval' : 'No Coordinates Available'}
          </p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {isPending 
              ? 'The map will appear here once this listing is approved by an admin.' 
              : 'The agent hasn\'t pinned exact coordinates for this property yet.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Custom Popup ──────────────────────────────────────────────────────
function PropertyPopupContent({ property }) {
  const [imageError, setImageError] = useState(false);
  const img = property.images?.[0] 
    ? `https://realepro.onrender.com${property.images[0].path}` 
    : null;

  return (
    <div className="min-w-[200px] max-w-[240px]">
      <div className="relative h-28 rounded-t-lg overflow-hidden bg-gray-100">
        {img && !imageError ? (
          <img 
            src={img} 
            alt={property.title} 
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Building2 className="w-8 h-8 text-gray-300" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            property.status === 'sale' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
          }`}>
            {property.status === 'sale' ? 'For Sale' : 'For Rent'}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
          {property.title}
        </h4>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
          {property.location?.city}, {property.location?.state}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-primary-600">
            ₹{property.price?.toLocaleString()}
          </span>
          <a 
            href={`/properties/${property._id}`} 
            className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1"
          >
            View <span className="text-base">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────
export default function PropertyMap({ property, canPreview = false }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapZoom, setMapZoom] = useState(15);
  const { lat, lng } = property?.location || {};
  const hasCoords = typeof lat === 'number' && typeof lng === 'number' && !(lat === 0 && lng === 0);

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 3));
  };

  const handleReset = () => {
    setMapZoom(15);
  };

  const handleFullscreen = () => {
    const container = document.querySelector('.property-map-container');
    if (!container) return;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ─── Pending State ──────────────────────────────────────────────────
  if (!property?.isApproved && !canPreview) {
    return <EmptyState type="pending" />;
  }

  // ─── No Coordinates ──────────────────────────────────────────────────
  if (!hasCoords) {
    return <EmptyState type="no-coords" />;
  }

  return (
    <div className="property-map-container card p-5">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Location</h3>
            <p className="text-xs text-gray-400">
              {property.location?.address}, {property.location?.city}
            </p>
          </div>
        </div>
        <StatusBadge 
          status={property.isApproved ? 'approved' : 'pending'} 
          canPreview={canPreview} 
        />
      </div>

      {/* ─── Map Container ────────────────────────────────────────────── */}
      <div 
        className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-inner"
        style={{ height: isFullscreen ? '80vh' : 300 }}
      >
        <MapContainer 
          center={[lat, lng]} 
          zoom={mapZoom} 
          scrollWheelZoom={true}
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} icon={pinIcon('#e11d48')}>
            <Popup className="custom-property-popup">
              <PropertyPopupContent property={property} />
            </Popup>
          </Marker>
        </MapContainer>

        {/* ─── Map Controls ────────────────────────────────────────────── */}
        <PropertyMapControls 
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          onFullscreen={handleFullscreen}
          isFullscreen={isFullscreen}
        />

        {/* ─── Address Overlay ────────────────────────────────────────── */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2.5 border border-gray-200/50 max-w-[70%]">
          <div className="flex items-center gap-2">
            <Home className="w-3.5 h-3.5 text-primary-500" />
            <span className="text-xs text-gray-600 truncate">
              {property.location?.address}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span>{property.location?.city}, {property.location?.state}</span>
            {property.location?.pincode && (
              <>
                <span>•</span>
                <span>{property.location.pincode}</span>
              </>
            )}
          </div>
        </div>

        {/* ─── Map Tip ────────────────────────────────────────────────── */}
        <div className="absolute top-4 right-4 z-[1000] bg-white/70 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-gray-200/50">
          <p className="text-[10px] text-gray-400 flex items-center gap-1">
            <span className="animate-pulse">🖱️</span>
            Click pin for details
          </p>
        </div>
      </div>

      {/* ─── Full Address ──────────────────────────────────────────────── */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 text-primary-500" />
          <span>
            {property.location?.address}, {property.location?.city}, {property.location?.state}
            {property.location?.pincode && ` - ${property.location.pincode}`}
          </span>
        </div>
        {property.isApproved && (
          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" /> Verified
          </span>
        )}
      </div>

      {/* ─── CSS ────────────────────────────────────────────────────────── */}
      <style jsx>{`
        :global(.custom-property-popup .leaflet-popup-content-wrapper) {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        }
        :global(.custom-property-popup .leaflet-popup-content) {
          margin: 0;
          padding: 0;
        }
        :global(.custom-property-popup .leaflet-popup-tip) {
          background: white;
        }
        :global(.leaflet-control-zoom) {
          display: none !important;
        }
        :global(.leaflet-container) {
          background: #f0f4f8;
        }
      `}</style>
    </div>
  );
}