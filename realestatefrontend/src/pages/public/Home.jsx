// src/pages/public/Home.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProperties, getPublicStats } from '../../api/properties';
import { resolveImageUrl } from '../../utils/imageUtils';
import {
  Building2, Search, MapPin, Bed, Bath, Square, Star, ShieldCheck,
  Sparkles, Home as HomeIcon, Building, LandPlot, Store, ArrowRight,
  CheckCircle2, Users, TrendingUp, MessagesSquare, Heart, GitCompare,
  Menu, X, Phone, Mail, 
  // Only use icons that definitely exist
  Globe, Share2, MessageCircle
} from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { useCompare } from '../../context/CompareContext';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { key: 'apartment', label: 'Apartments', icon: Building2, color: 'from-blue-500 to-blue-600' },
  { key: 'house', label: 'Houses', icon: HomeIcon, color: 'from-emerald-500 to-emerald-600' },
  { key: 'villa', label: 'Villas', icon: Sparkles, color: 'from-purple-500 to-purple-600' },
  { key: 'plot', label: 'Plots', icon: LandPlot, color: 'from-amber-500 to-amber-600' },
  { key: 'commercial', label: 'Commercial', icon: Store, color: 'from-rose-500 to-rose-600' },
  { key: 'office', label: 'Offices', icon: Building, color: 'from-cyan-500 to-cyan-600' },
];

const CITY_SHORTCUTS = ['Pune', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Delhi', 'Chennai'];

function formatPrice(n) {
  if (!n) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString()}`;
}

function StatValue({ loading, value }) {
  if (loading) {
    return <span className="inline-block h-6 w-16 rounded bg-gray-200 animate-pulse align-middle" />;
  }
  return <>{value}</>;
}

function FeaturedCard({ property }) {
  const img = property.images?.[0] ? resolveImageUrl(property.images[0]) : null;
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isComparing, toggleCompare } = useCompare();
  const saved = isFavorite(property._id);
  const comparing = isComparing(property._id);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      <Link to={`/properties/${property._id}`} className="block">
        <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
          {img && !imageError ? (
            <img
              src={img}
              alt={property.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Building2 className="w-16 h-16 text-gray-300" />
            </div>
          )}
          
          <span className={`absolute top-3 left-3 text-xs px-3 py-1.5 rounded-full font-medium shadow-lg ${
            property.status === 'sale' ? 'bg-blue-600 text-white' : 
            property.status === 'rent' ? 'bg-purple-600 text-white' : 
            'bg-gray-600 text-white'
          }`}>
            For {property.status}
          </span>

          <div className="absolute top-3 right-3 flex gap-1.5">
            <button
              onClick={(e) => { e.preventDefault(); toggleFavorite(property); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 backdrop-blur-sm ${
                saved ? 'bg-red-500 text-white scale-110' : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); toggleCompare(property); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 backdrop-blur-sm ${
                comparing ? 'bg-primary-600 text-white scale-110' : 'bg-white/90 text-gray-600 hover:bg-primary-50 hover:text-primary-600'
              }`}
            >
              <GitCompare className="w-4 h-4" />
            </button>
          </div>

          {property.numReviews > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2.5 py-1.5 rounded-full text-white text-xs">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{property.avgRating}</span>
              <span className="text-gray-400">({property.numReviews})</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{property.location?.city}, {property.location?.state}</span>
          </div>
          
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-600 flex-wrap">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                <Bed className="w-3 h-3" /> {property.bedrooms}
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                <Bath className="w-3 h-3" /> {property.bathrooms}
              </span>
            )}
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
              <Square className="w-3 h-3" /> {property.area} {property.areaUnit}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xl font-bold text-primary-600">
              {formatPrice(property.price)}
            </div>
            <div className="text-xs text-gray-400">
              {property.views || 0} views
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch] = useState({ city: '', type: '' });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [propRes, statsRes] = await Promise.all([
          getProperties({ page: 1, limit: 8, sortBy: 'views', order: 'desc' }),
          getPublicStats(),
        ]);
        setFeatured(propRes?.data || []);
        setStats(statsRes?.data || null);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
      setStatsLoading(false);
    })();
  }, []);

  const goToListings = (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries({ ...search, ...params }).filter(([, v]) => v))
    ).toString();
    navigate(`/properties${query ? `?${query}` : ''}`);
  };

  const statItems = [
    { icon: Building2, label: 'Listed Properties', value: stats ? `${stats.totalProperties}+` : '0+', color: 'from-blue-500 to-blue-600' },
    { icon: MapPin, label: 'Cities Covered', value: stats?.totalCities || 0, color: 'from-emerald-500 to-emerald-600' },
    { icon: Users, label: 'Verified Agents', value: stats?.totalAgents || 0, color: 'from-purple-500 to-purple-600' },
    { icon: Star, label: 'Avg. Buyer Rating', value: stats?.avgRating ? `${stats.avgRating} / 5` : '— / 5', color: 'from-amber-500 to-amber-600' },
  ];

  // Social Icons Component (inline to avoid import issues)
  const SocialIcon = ({ href, label, children, hoverColor }) => (
    <a 
      href={href} 
      className={`w-10 h-10 rounded-full bg-gray-800 hover:${hoverColor} flex items-center justify-center transition-colors group`}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="text-sm font-bold text-gray-400 group-hover:text-white">{children}</span>
    </a>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-lg sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">PropEstate</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <Link to="/properties" className="hover:text-blue-600 transition-colors">Browse Properties</Link>
              <Link to="/about" className="hover:text-blue-600 transition-colors">About</Link>
              <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3">
                {user ? (
                  <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-600 hover:text-blue-600 px-5 py-2 rounded-xl text-sm font-medium transition-all">
                      Log In
                    </Link>
                    <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 space-y-1">
              <Link to="/properties" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50">
                <Building2 className="w-4 h-4" />
                Browse Properties
              </Link>
              <Link to="/about" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50">
                <Users className="w-4 h-4" />
                About
              </Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50">
                <Mail className="w-4 h-4" />
                Contact
              </Link>
              <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                {user ? (
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="bg-blue-600 text-white text-sm flex-1 text-center py-2 rounded-xl">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="text-gray-600 text-sm flex-1 text-center py-2 rounded-xl border border-gray-200">
                      Log In
                    </Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="bg-blue-600 text-white text-sm flex-1 text-center py-2 rounded-xl">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 sm:py-20 lg:py-28">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                <ShieldCheck className="w-4 h-4" />
                AI-verified listings & documents
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Find a home you'll{' '}
                <span className="text-blue-600">actually love</span>
                {' '}to come back to.
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-lg">
                Search verified apartments, houses, villas, and plots across India — chat with an AI assistant, message agents directly, and close deals with confidence.
              </p>

              <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="relative sm:col-span-2">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                      placeholder="City, e.g. Pune"
                      value={search.city}
                      onChange={(e) => setSearch(s => ({ ...s, city: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && goToListings()}
                    />
                  </div>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white"
                    value={search.type}
                    onChange={(e) => setSearch(s => ({ ...s, type: e.target.value }))}
                  >
                    <option value="">Any Type</option>
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                  <button 
                    onClick={() => goToListings()} 
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-3 px-6 rounded-xl transition-all font-medium"
                  >
                    <Search className="w-4 h-4" /> Search
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs text-gray-400 self-center">Popular:</span>
                  {CITY_SHORTCUTS.map(c => (
                    <button
                      key={c}
                      onClick={() => goToListings({ city: c })}
                      className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-4">
              {statItems.map(({ icon: Icon, label, value, color }, index) => (
                <div key={label} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} text-white flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    <StatValue loading={statsLoading} value={value} />
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip Mobile */}
      <section className="lg:hidden border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 gap-4">
          {statItems.slice(0, 4).map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  <StatValue loading={statsLoading} value={value} />
                </p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
          <p className="text-gray-500 mt-2">Pick the kind of property you're after and jump straight into filtered results.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => goToListings({ type: key })}
              className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-r ${color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-7 h-7" />
              </div>
              <p className="mt-3 text-sm font-medium text-gray-700 text-center">{label}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Trending Properties</h2>
              <p className="text-gray-500 mt-1">Most-viewed listings from our verified agent network.</p>
            </div>
            <Link to="/properties" className="hidden sm:flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-12" />
                      <div className="h-6 bg-gray-200 rounded w-12" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No listings yet</p>
              <p className="text-gray-400 text-sm mt-1">Check back soon for new properties.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map(p => <FeaturedCard key={p._id} property={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-12 sm:px-12 sm:py-16">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Are you a property agent?</h2>
              <p className="text-blue-100 mt-2 max-w-lg">
                List your properties, reach verified buyers, and manage offers — all from one dashboard, free to get started.
              </p>
            </div>
            <Link 
              to={user ? '/agent/my-listings/new' : '/register'} 
              className="bg-white text-blue-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl flex-shrink-0"
            >
              <CheckCircle2 className="w-5 h-5" /> 
              {user ? 'Add a Listing' : 'Get Started Free'}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">PropEstate</span>
              </div>
              <p className="mt-4 text-sm max-w-md">
                India's trusted real estate marketplace connecting buyers, agents, and admins with AI-powered verification and instant communication.
              </p>
              <div className="flex items-center gap-4 mt-6">
                {/* Simple text-based social icons - no lucide-react dependencies */}
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#1877f2] flex items-center justify-center transition-colors group"
                  aria-label="Facebook"
                >
                  <span className="text-sm font-bold text-gray-400 group-hover:text-white">f</span>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#1da1f2] flex items-center justify-center transition-colors group"
                  aria-label="Twitter"
                >
                  <span className="text-sm font-bold text-gray-400 group-hover:text-white">t</span>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#e4405f] flex items-center justify-center transition-colors group"
                  aria-label="Instagram"
                >
                  <span className="text-sm font-bold text-gray-400 group-hover:text-white">ig</span>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#ff0000] flex items-center justify-center transition-colors group"
                  aria-label="YouTube"
                >
                  <span className="text-sm font-bold text-gray-400 group-hover:text-white">yt</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/properties" className="hover:text-white transition-colors">Browse Properties</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+919545089118" className="hover:text-white transition-colors">+91 95450 89118</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:realestateproperty605@gmail.com" className="hover:text-white transition-colors">
                    realestateproperty605@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>© 2024 PropEstate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}