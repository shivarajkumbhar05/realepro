// src/components/map/mapIcons.js
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Default Center for India ─────────────────────────────────────────
export const DEFAULT_CENTER = [20.5937, 78.9629]; // India's center

// ─── Default Zoom Level ──────────────────────────────────────────────
export const DEFAULT_ZOOM = 5;

// ─── Create Custom Pin Icon ──────────────────────────────────────────
export const pinIcon = (color = '#4f46e5') => {
  return L.divIcon({
    className: 'custom-pin-icon',
    html: `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.16 24.84 0 16 0Z" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white" stroke="${color}" stroke-width="2"/>
      </svg>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
    tooltipAnchor: [16, -40],
  });
};

// ─── Alternate Pin Icons ──────────────────────────────────────────────
export const pinIcons = {
  // Default pin (blue)
  default: pinIcon('#4f46e5'),
  
  // Primary pin (emerald green)
  primary: pinIcon('#059669'),
  
  // Premium pin (gold)
  premium: pinIcon('#d97706'),
  
  // Featured pin (purple)
  featured: pinIcon('#7c3aed'),
  
  // Sale pin (red)
  sale: pinIcon('#dc2626'),
  
  // Rent pin (blue)
  rent: pinIcon('#2563eb'),
  
  // Sold pin (gray)
  sold: pinIcon('#6b7280'),
  
  // Agent pin (orange)
  agent: pinIcon('#ea580c'),
  
  // Admin pin (pink)
  admin: pinIcon('#db2777'),
};

// ─── Get Pin by Status ────────────────────────────────────────────────
export const getPinByStatus = (status) => {
  const pinMap = {
    sale: pinIcons.sale,
    rent: pinIcons.rent,
    sold: pinIcons.sold,
    featured: pinIcons.featured,
    premium: pinIcons.premium,
    default: pinIcons.default,
  };
  return pinMap[status] || pinIcons.default;
};

// ─── Get Pin by Role ──────────────────────────────────────────────────
export const getPinByRole = (role) => {
  const pinMap = {
    agent: pinIcons.agent,
    admin: pinIcons.admin,
    default: pinIcons.default,
  };
  return pinMap[role] || pinIcons.default;
};

// ─── Cluster Icon ──────────────────────────────────────────────────────
export const clusterIcon = (count) => {
  return L.divIcon({
    className: 'cluster-icon',
    html: `
      <div style="
        background: #4f46e5;
        color: white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
        border: 2px solid white;
      ">
        ${count}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// ─── Custom Popup Styles ──────────────────────────────────────────────
export const popupStyles = {
  className: 'custom-popup',
  maxWidth: 300,
  minWidth: 200,
};

// ─── Tile Layer Configuration ─────────────────────────────────────────
export const tileLayerConfig = {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  maxZoom: 19,
  minZoom: 3,
};

// ─── Map Options ──────────────────────────────────────────────────────
export const mapOptions = {
  zoomControl: false,
  attributionControl: true,
  fadeAnimation: true,
  zoomAnimation: true,
  markerZoomAnimation: true,
  worldCopyJump: true,
};

// ─── Bounding Box for India ───────────────────────────────────────────
export const INDIA_BOUNDS = {
  north: 35.5,
  south: 6.5,
  west: 68.0,
  east: 97.5,
};

// ─── Major Cities in India ────────────────────────────────────────────
export const MAJOR_CITIES = {
  mumbai: { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
  delhi: { lat: 28.6139, lng: 77.2090, name: 'Delhi' },
  bangalore: { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
  hyderabad: { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
  pune: { lat: 18.5204, lng: 73.8567, name: 'Pune' },
  chennai: { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
  kolkata: { lat: 22.5726, lng: 88.3639, name: 'Kolkata' },
  ahmedabad: { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad' },
  jaipur: { lat: 26.9124, lng: 75.7873, name: 'Jaipur' },
  lucknow: { lat: 26.8467, lng: 80.9462, name: 'Lucknow' },
};

// ─── Helper: Check if coordinates are valid ──────────────────────────
export const isValidCoordinates = (lat, lng) => {
  return typeof lat === 'number' && 
         typeof lng === 'number' && 
         !isNaN(lat) && 
         !isNaN(lng) && 
         lat >= -90 && 
         lat <= 90 && 
         lng >= -180 && 
         lng <= 180 &&
         !(lat === 0 && lng === 0);
};

// ─── Helper: Check if coordinates are within India ────────────────────
export const isInIndia = (lat, lng) => {
  return lat >= INDIA_BOUNDS.south && 
         lat <= INDIA_BOUNDS.north && 
         lng >= INDIA_BOUNDS.west && 
         lng <= INDIA_BOUNDS.east;
};

// ─── Helper: Get center of multiple coordinates ──────────────────────
export const getCenter = (coordinates) => {
  if (!coordinates || coordinates.length === 0) {
    return DEFAULT_CENTER;
  }
  
  const validCoords = coordinates.filter(([lat, lng]) => isValidCoordinates(lat, lng));
  if (validCoords.length === 0) {
    return DEFAULT_CENTER;
  }
  
  const sum = validCoords.reduce(
    (acc, [lat, lng]) => [acc[0] + lat, acc[1] + lng],
    [0, 0]
  );
  
  return [sum[0] / validCoords.length, sum[1] / validCoords.length];
};

// ─── Helper: Get zoom level based on number of pins ──────────────────
export const getZoomLevel = (count) => {
  if (count === 0) return DEFAULT_ZOOM;
  if (count === 1) return 14;
  if (count <= 5) return 12;
  if (count <= 20) return 10;
  if (count <= 50) return 8;
  return 6;
};

// ─── Default Export ───────────────────────────────────────────────────
export default {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  pinIcon,
  pinIcons,
  getPinByStatus,
  getPinByRole,
  clusterIcon,
  popupStyles,
  tileLayerConfig,
  mapOptions,
  INDIA_BOUNDS,
  MAJOR_CITIES,
  isValidCoordinates,
  isInIndia,
  getCenter,
  getZoomLevel,
};