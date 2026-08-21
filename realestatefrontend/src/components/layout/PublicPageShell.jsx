import { Link, useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Home, ChevronRight, Mail, Phone, MapPin, Shield, Star, Users } from 'lucide-react';
import AuthFooter from './AuthFooter';
import { motion } from 'framer-motion';

export default function PublicPageShell({ title, subtitle, children }) {
  const navigate = useNavigate();

  return (
    <div className="theme-guest min-h-screen bg-[#f6f8fb] relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_right,_rgba(14,141,233,0.10),_transparent_60%)] pointer-events-none" />

      {/* ─── Header ────────────────────────────────────────────────────── */}
      <header className="relative border-b border-gray-200 bg-white/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group"
          >
            <div className="relative w-9 h-9 bg-primary-700 rounded-lg flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
              <Building2 className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-xl text-gray-900">PropEstate</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-white text-gray-700 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors border border-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────────── */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* ─── Decorative Header Bar ────────────────────────────────── */}
          <div className="h-1 bg-primary-700"></div>

          {/* ─── Content Area ──────────────────────────────────────────── */}
          <div className="p-6 sm:p-10 lg:p-12">
            {/* ─── Title Section ───────────────────────────────────────── */}
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary-700">
                      PropEstate
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="mt-2 text-gray-500 text-base sm:text-lg max-w-2xl">
                      {subtitle}
                    </p>
                  )}
                </div>
                <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span>4.9/5</span>
                </div>
              </div>

              {/* ─── Breadcrumb ────────────────────────────────────────── */}
              <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
                <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-600 font-medium">{title}</span>
              </div>
            </div>

            {/* ─── Divider ────────────────────────────────────────────── */}
            <div className="w-full h-px bg-gray-200 mb-8"></div>

            {/* ─── Children Content ────────────────────────────────────── */}
            <div className="prose prose-slate max-w-none text-gray-600 space-y-6">
              {children}
            </div>

            {/* ─── Contact Quick Links ────────────────────────────────── */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a 
                  href="mailto:realestateproperty605@gmail.com" 
                  className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-primary-50 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">Email Us</p>
                  </div>
                </a>
                <a 
                  href="tel:+919545089118" 
                  className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-green-50 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">Call Us</p>
                  </div>
                </a>
                <a 
                  href="#" 
                  className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-purple-50 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">Find Us</p>
                  </div>
                </a>
              </div>
            </div>

            {/* ─── Trust Badges ────────────────────────────────────────── */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>SSL Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>10K+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-500" />
                <span>Verified Listings</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Footer ──────────────────────────────────────────────────── */}
        <AuthFooter />
      </main>
    </div>
  );
}