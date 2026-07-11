import { Link } from 'react-router-dom';
import { Shield, Globe, Heart } from 'lucide-react';

export default function AuthFooter({ dark = false }) {
  const currentYear = new Date().getFullYear();

  const linkClass = dark
    ? 'text-primary-200 hover:text-white transition-colors duration-200 relative group'
    : 'text-gray-500 hover:text-primary-600 transition-colors duration-200 relative group';

  return (
    <div className="mt-8">
      {/* ─── Divider ──────────────────────────────────────────────────── */}
      <div className={`w-full h-px ${dark ? 'bg-white/10' : 'bg-gray-200'} mb-6`}></div>

      <div className="text-center">
        {/* ─── Copyright ──────────────────────────────────────────────── */}
        <p className={`text-sm ${dark ? 'text-primary-200/70' : 'text-gray-400'}`}>
          © {currentYear} PropEstate. All rights reserved.
        </p>

        {/* ─── Navigation Links ───────────────────────────────────────── */}
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-1 mt-2 text-sm">
          <Link to="/about" className={linkClass}>
            About
            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 ${dark ? 'bg-white' : 'bg-primary-600'} transition-all duration-300 group-hover:w-full`}></span>
          </Link>
          <Link to="/contact" className={linkClass}>
            Contact
            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 ${dark ? 'bg-white' : 'bg-primary-600'} transition-all duration-300 group-hover:w-full`}></span>
          </Link>
          <Link to="/terms" className={linkClass}>
            Terms
            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 ${dark ? 'bg-white' : 'bg-primary-600'} transition-all duration-300 group-hover:w-full`}></span>
          </Link>
          <Link to="/privacy" className={linkClass}>
            Privacy
            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 ${dark ? 'bg-white' : 'bg-primary-600'} transition-all duration-300 group-hover:w-full`}></span>
          </Link>
        </div>

        {/* ─── Trust Badges ───────────────────────────────────────────── */}
        <div className={`flex justify-center items-center gap-6 mt-3 text-xs ${dark ? 'text-primary-200/50' : 'text-gray-400'}`}>
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            SSL Secure
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            Verified Listings
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-500" fill="currentColor" />
            10K+ Trusted
          </span>
        </div>
      </div>
    </div>
  );
}