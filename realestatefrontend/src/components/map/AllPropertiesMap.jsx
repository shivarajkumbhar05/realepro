import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { pinIcon, DEFAULT_CENTER, DEFAULT_ZOOM } from './mapIcons';
import { Building2, MapPin, Star, Navigation, Maximize2, Minimize2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Map Controls Component ────────────────────────────────────────────
function MapControls({ onZoomIn, onZoomOut, onReset, onFullscreen, isFullscreen }) {
  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        className="w-10 h-10 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-all flex items-center justify-center border border-gray-200 hover:shadow-xl"
        title="Zoom In"
      >
        <span className="text-xl font-bold text-gray-700">+</span>
      </button>
      <button
        onClick={onZoomOut}
        className="w-10 h-10 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-all flex items-center justify-center border border-gray-200 hover:shadow-xl"
        title="Zoom Out"
      >
        <span className="text-2xl font-bold text-gray-700">−</span>
      </button>
      <button
        onClick={onReset}
        className="w-10 h-10 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-all flex items-center justify-center border border-gray-200 hover:shadow-xl"
        title="Reset View"
      >
        <Navigation className="w-4 h-4 text-gray-600" />
      </button>
      <button
        onClick={onFullscreen}
        className="w-10 h-10 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-all flex items-center justify-center border border-gray-200 hover:shadow-xl"
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

// ─── Map Reset Component ──────────────────────────────────────────────
function MapReset({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, 6, { duration: 1.5 });
    }
  }, [center, map]);

  return null;
}

// ─── Property Count Badge ─────────────────────────────────────────────
function PropertyCountBadge({ count }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg px-5 py-2.5 border border-gray-200/50"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-semibold text-gray-900">{count}</span>
        </div>
        <div className="w-px h-5 bg-gray-200"></div>
        <span className="text-sm text-gray-500">
          {count === 1 ? 'Property' : 'Properties'} on Map
        </span>
      </div>
    </motion.div>
  );
}

// ─── Custom Popup Component ────────────────────────────────────────────
function PropertyPopup({ property }) {
  const [imageError, setImageError] = useState(false);
  const img = property.images?.[0] 
    ? `https://realepro.onrender.com${property.images[0].path}` 
    : null;

  return (
    <div className="min-w-[220px] max-w-[260px]">
      <div className="relative h-32 rounded-t-lg overflow-hidden bg-gray-100">
        {img && !imageError ? (
          <img 
            src={img} 
            alt={property.title} 
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Building2 className="w-10 h-10 text-gray-300" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            property.status === 'sale' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
          }`}>
            {property.status === 'sale' ? 'For Sale' : 'For Rent'}
          </span>
        </div>
        {property.numReviews > 0 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
            <span className="text-white text-[10px] font-semibold">{property.avgRating}</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
          {property.title}
        </h4>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{property.location?.city}, {property.location?.state}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-primary-600">
            ₹{property.price?.toLocaleString()}
          </span>
          <Link 
            to={`/properties/${property._id}`} 
            className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1"
          >
            View <span className="text-base">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────
export default function AllPropertiesMap({ properties = [] }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const pins = properties.filter(
    (p) => p.isApproved && typeof p.location?.lat === 'number' && typeof p.location?.lng === 'number'
      && !(p.location.lat === 0 && p.location.lng === 0)
  );

  const center = pins.length
    ? [pins[0].location.lat, pins[0].location.lng]
    : DEFAULT_CENTER;

  const handleZoomIn = () => {
    const map = document.querySelector('.leaflet-container')?._leaflet_map;
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    const map = document.querySelector('.leaflet-container')?._leaflet_map;
    if (map) {
      map.zoomOut();
    }
  };

  const handleReset = () => {
    setMapCenter([...center]);
  };

  const handleFullscreen = () => {
    const container = document.querySelector('.map-container');
    if (!container) return;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error('Fullscreen error:', err);
      });
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

  if (pins.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center"
        style={{ height: 520 }}
      >
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <MapPin className="w-10 h-10 text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-500">No properties on map yet</p>
        <p className="text-xs text-gray-400 mt-1">Approved properties with coordinates will appear here</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="map-container relative rounded-2xl overflow-hidden shadow-lg border border-gray-200/80"
      style={{ height: isFullscreen ? '100vh' : 520 }}
    >
      {/* ─── Property Count Badge ────────────────────────────────────── */}
      <PropertyCountBadge count={pins.length} />

      {/* ─── Map Container ────────────────────────────────────────────── */}
      <MapContainer 
        center={center} 
        zoom={DEFAULT_ZOOM} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        className="leaflet-container"
      >
        <MapReset center={mapCenter} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {pins.map((p) => (
          <Marker 
            key={p._id} 
            position={[p.location.lat, p.location.lng]} 
            icon={pinIcon('#059669')}
            eventHandlers={{
              click: () => setSelectedProperty(p)
            }}
          >
            <Popup 
              className="custom-popup"
              maxWidth={280}
              minWidth={220}
            >
              <PropertyPopup property={p} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ─── Map Controls ────────────────────────────────────────────── */}
      <MapControls 
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onFullscreen={handleFullscreen}
        isFullscreen={isFullscreen}
      />

      {/* ─── Legend ────────────────────────────────────────────────────── */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-4 py-3 border border-gray-200/50">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">Premium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-gray-600">Featured</span>
          </div>
        </div>
      </div>

      {/* ─── CSS for Custom Popup ────────────────────────────────────── */}
      <style jsx>{`
        :global(.custom-popup .leaflet-popup-content-wrapper) {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        }
        :global(.custom-popup .leaflet-popup-content) {
          margin: 0;
          padding: 0;
        }
        :global(.custom-popup .leaflet-popup-tip) {
          background: white;
        }
        :global(.leaflet-container) {
          background: #f0f4f8;
        }
        :global(.leaflet-control-zoom) {
          display: none !important;
        }
      `}</style>
    </motion.div>
  );
}