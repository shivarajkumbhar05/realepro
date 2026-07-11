import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { 
  Search, MapPin, Loader2, Crosshair, Navigation, 
  X, Check, Sparkles, AlertCircle, Maximize2, Minimize2,
  ZoomIn, ZoomOut, RefreshCw
} from 'lucide-react';
import { pinIcon, DEFAULT_CENTER, DEFAULT_ZOOM } from './mapIcons';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Map Click Handler ──────────────────────────────────────────────────
function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ─── Recenter Map ──────────────────────────────────────────────────────
function Recenter({ lat, lng, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], zoom ?? 15, { duration: 1 });
    }
  }, [lat, lng, zoom, map]);
  return null;
}

// ─── Map Controls ──────────────────────────────────────────────────────
function MapControls({ onZoomIn, onZoomOut, onFullscreen, isFullscreen, onReset }) {
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

// ─── Coordinates Display ──────────────────────────────────────────────
function CoordinatesDisplay({ lat, lng }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg px-5 py-2.5 border border-gray-200/50 flex items-center gap-3"
    >
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary-600" />
        <span className="text-sm font-medium text-gray-700">
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </span>
      </div>
      <div className="w-px h-5 bg-gray-200"></div>
      <span className="text-xs text-emerald-600 flex items-center gap-1">
        <Check className="w-3.5 h-3.5" />
        Pin placed
      </span>
    </motion.div>
  );
}

// ─── Location Status ──────────────────────────────────────────────────
function LocationStatus({ status, message }) {
  const statusColors = {
    idle: 'text-gray-400',
    searching: 'text-blue-500',
    found: 'text-emerald-500',
    error: 'text-red-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center gap-2 text-xs ${statusColors[status] || statusColors.idle}`}
    >
      {status === 'searching' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {status === 'found' && <Check className="w-3.5 h-3.5" />}
      {status === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
      {status === 'idle' && <MapPin className="w-3.5 h-3.5" />}
      <span>{message}</span>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────
export default function LocationPicker({ lat, lng, onChange }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [locationStatus, setLocationStatus] = useState({ status: 'idle', message: 'Search or click on map' });
  const [searchError, setSearchError] = useState('');
  const mapRef = useRef(null);

  const hasCoords = typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng);
  const center = hasCoords ? [lat, lng] : DEFAULT_CENTER;

  useEffect(() => {
    if (hasCoords) {
      setLocationStatus({ 
        status: 'found', 
        message: `Location set to ${lat.toFixed(6)}, ${lng.toFixed(6)}` 
      });
    }
  }, [lat, lng, hasCoords]);

  // ─── Search Address ──────────────────────────────────────────────────
  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setSearchError('Please enter an address');
      return;
    }
    setSearchError('');
    setSearching(true);
    setLocationStatus({ status: 'searching', message: 'Searching for address...' });
    
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}&countrycodes=IN`
      );
      const results = await res.json();
      if (results?.[0]) {
        const newLat = parseFloat(results[0].lat);
        const newLng = parseFloat(results[0].lon);
        onChange(newLat, newLng);
        setLocationStatus({ 
          status: 'found', 
          message: `Found: ${results[0].display_name.substring(0, 60)}...` 
        });
        setQuery('');
      } else {
        setLocationStatus({ 
          status: 'error', 
          message: 'Address not found. Try a different search or click on the map.' 
        });
        setSearchError('No results found');
      }
    } catch {
      setLocationStatus({ 
        status: 'error', 
        message: 'Search failed. Please try again or click on the map.' 
      });
      setSearchError('Search failed');
    }
    setSearching(false);
  };

  // ─── Use My Location ─────────────────────────────────────────────────
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({ status: 'error', message: 'Geolocation is not supported by your browser' });
      return;
    }
    setLocationStatus({ status: 'searching', message: 'Getting your location...' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setLocationStatus({ 
          status: 'found', 
          message: `Your location: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}` 
        });
      },
      () => {
        setLocationStatus({ 
          status: 'error', 
          message: 'Unable to get your location. Please allow location access or click on the map.' 
        });
      },
      { enableHighAccuracy: true }
    );
  };

  // ─── Map Controls ────────────────────────────────────────────────────
  const handleZoomIn = () => {
    const map = mapRef.current;
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    const map = mapRef.current;
    if (map) {
      map.zoomOut();
    }
  };

  const handleReset = () => {
    if (hasCoords) {
      onChange(lat, lng);
    } else {
      onChange(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
    }
  };

  const handleFullscreen = () => {
    const container = document.querySelector('.location-picker-container');
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="location-picker-container space-y-3"
    >
      {/* ─── Search Bar ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {searching ? (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') search(e); }}
            placeholder="Search an address to drop the pin..."
            className={`w-full pl-9 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
              searchError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'
            }`}
            disabled={searching}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={search} 
            disabled={searching} 
            className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary-500/20 disabled:opacity-70 flex items-center gap-2 whitespace-nowrap"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
          <button 
            type="button" 
            onClick={useMyLocation} 
            title="Use my current location" 
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Crosshair className="w-4 h-4" />
            <span className="hidden sm:inline">My Location</span>
          </button>
        </div>
      </div>

      {searchError && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" /> {searchError}
        </motion.p>
      )}

      {/* ─── Map Container ────────────────────────────────────────────── */}
      <div 
        className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-inner"
        style={{ height: isFullscreen ? '80vh' : 300 }}
      >
        <MapContainer 
          center={center} 
          zoom={hasCoords ? 15 : DEFAULT_ZOOM} 
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={onChange} />
          {hasCoords && <Marker position={[lat, lng]} icon={pinIcon('#4f46e5')} />}
          {hasCoords && <Recenter lat={lat} lng={lng} />}
        </MapContainer>

        {/* ─── Coordinates Display ────────────────────────────────────── */}
        {hasCoords && <CoordinatesDisplay lat={lat} lng={lng} />}

        {/* ─── Map Controls ────────────────────────────────────────────── */}
        <MapControls 
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          onFullscreen={handleFullscreen}
          isFullscreen={isFullscreen}
        />

        {/* ─── Location Status ────────────────────────────────────────── */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2.5 border border-gray-200/50">
          <LocationStatus 
            status={locationStatus.status} 
            message={locationStatus.message} 
          />
        </div>

        {/* ─── Click Hint ──────────────────────────────────────────────── */}
        <div className="absolute bottom-4 right-20 z-[1000] bg-white/70 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-gray-200/50 hidden sm:block">
          <p className="text-[10px] text-gray-400 flex items-center gap-1">
            <span className="animate-pulse">💡</span>
            Click anywhere on the map to place the pin
          </p>
        </div>
      </div>

      {/* ─── Bottom Info ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <MapPin className="w-3.5 h-3.5 text-primary-500" />
          <span>Click anywhere on the map to place the pin, or search an address above.</span>
        </div>
        {hasCoords && (
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
        )}
      </div>

      {/* ─── CSS for Map Controls ────────────────────────────────────── */}
      <style jsx>{`
        :global(.leaflet-control-zoom) {
          display: none !important;
        }
        :global(.leaflet-container) {
          background: #f0f4f8;
        }
      `}</style>
    </motion.div>
  );
}