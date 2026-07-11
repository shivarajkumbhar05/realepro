import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicPageShell from '../../components/layout/PublicPageShell';
import { 
  Shield, Lock, Eye, Database, MapPin, Share2, 
  Cookie, UserCheck, AlertCircle, ArrowRight, 
  Sparkles, Clock, Globe, Heart, CheckCircle,
  ChevronDown, ChevronUp, FileText, Users,
  Server, Key, Bell, Settings, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sections = [
  {
    id: 'information',
    title: '1. Information We Collect',
    body: 'We collect information you provide directly — name, email, phone, password (stored hashed), profile avatar, property listings, documents, reviews, and purchase offers — as well as usage data such as pages visited and searches performed.',
    icon: Database,
    color: 'blue',
    items: [
      'Personal information (name, email, phone)',
      'Account credentials (hashed password)',
      'Property listings and documents',
      'Reviews and purchase offers',
      'Usage data (pages visited, searches)'
    ]
  },
  {
    id: 'usage',
    title: '2. How We Use Your Information',
    body: 'Your information is used to operate your account, display and moderate listings, connect buyers with agents, run our AI assistant, verify uploaded documents, and communicate important updates about your account or listings.',
    icon: Settings,
    color: 'purple',
    items: [
      'Operate and manage your account',
      'Display and moderate property listings',
      'Connect buyers with agents',
      'Run AI assistant and document verification',
      'Send important account updates'
    ]
  },
  {
    id: 'location',
    title: '3. Location Data',
    body: 'Property location coordinates entered by agents are used solely to display approved listings on an interactive map for buyers. We do not track or store your personal device location.',
    icon: MapPin,
    color: 'emerald',
    items: [
      'Property coordinates for map display',
      'No personal device location tracking',
      'Location used only for listings',
      'Data not shared with third parties'
    ]
  },
  {
    id: 'sharing',
    title: '4. Sharing of Information',
    body: 'Your name, phone, and email are shared with the other party in a transaction (e.g. an interested buyer sees the listing agent\'s contact details) so they can communicate directly. We do not sell your personal data to third parties.',
    icon: Share2,
    color: 'amber',
    items: [
      'Shared with transaction parties only',
      'Buyer sees agent contact details',
      'Agent sees buyer contact details',
      'No selling of personal data'
    ]
  },
  {
    id: 'security',
    title: '5. Data Security',
    body: 'Passwords are hashed and never stored in plain text. Access to admin tools is restricted by role-based authentication. Uploaded documents and images are stored securely and are only accessible to authorized roles.',
    icon: Shield,
    color: 'rose',
    items: [
      'Passwords are securely hashed',
      'Role-based authentication',
      'Secure document storage',
      'Access restricted to authorized roles'
    ]
  },
  {
    id: 'cookies',
    title: '6. Cookies & Local Storage',
    body: 'We use local storage to keep you signed in between visits. We do not use third-party advertising trackers.',
    icon: Cookie,
    color: 'cyan',
    items: [
      'Local storage for session persistence',
      'No third-party advertising trackers',
      'Minimal cookie usage',
      'No behavioral tracking'
    ]
  },
  {
    id: 'rights',
    title: '7. Your Rights',
    body: 'You may update your profile information at any time from your account settings, or contact support to request account deletion or a copy of your data.',
    icon: UserCheck,
    color: 'indigo',
    items: [
      'Update profile anytime',
      'Request account deletion',
      'Request data copy',
      'Contact support for assistance'
    ]
  },
  {
    id: 'changes',
    title: '8. Changes to This Policy',
    body: 'We may revise this Privacy Policy periodically. Material changes will be communicated within the app.',
    icon: Clock,
    color: 'gray',
    items: [
      'Policy updates communicated in-app',
      'Material changes highlighted',
      'Last updated: July 2026',
      'Continued use implies acceptance'
    ]
  },
];

// ─── Summary Card ──────────────────────────────────────────────────────
function SummaryCard({ title, items, icon: Icon, color }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const colorMap = {
    blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600 border-blue-200',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-600 border-purple-200',
    emerald: 'from-emerald-500 to-emerald-600 bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'from-amber-500 to-amber-600 bg-amber-50 text-amber-600 border-amber-200',
    rose: 'from-rose-500 to-rose-600 bg-rose-50 text-rose-600 border-rose-200',
    cyan: 'from-cyan-500 to-cyan-600 bg-cyan-50 text-cyan-600 border-cyan-200',
    indigo: 'from-indigo-500 to-indigo-600 bg-indigo-50 text-indigo-600 border-indigo-200',
    gray: 'from-gray-500 to-gray-600 bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-start justify-between text-left hover:bg-gray-50/50 transition-colors group"
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]} flex items-center justify-center shadow-lg shadow-${color}-500/20 flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {isExpanded ? 'Click to collapse' : 'Click to expand'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-${color}-50 text-${color}-600`}>
            {items.length} items
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full bg-${color}-500 mt-1.5 flex-shrink-0`}></div>
                  <p className="text-sm text-gray-600">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Privacy() {
  const [activeSection, setActiveSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ─── Quick Stats ──────────────────────────────────────────────────────
  const stats = [
    { label: 'Sections', value: sections.length, icon: FileText },
    { label: 'Last Updated', value: 'July 2026', icon: Clock },
    { label: 'Data Protection', value: 'GDPR Compliant', icon: Shield },
  ];

  // ─── Filter Sections ──────────────────────────────────────────────────
  const filteredSections = sections.filter(section => 
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PublicPageShell 
      title="Privacy Policy" 
      subtitle="Last updated: July 2026"
    >
      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-600/20 mb-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-24 translate-x-24"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                top: `${10 + Math.random() * 80}%`,
                left: `${10 + Math.random() * 80}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Shield className="w-6 h-6 text-blue-200" />
            </div>
            <span className="text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
              Privacy & Security
            </span>
            <span className="text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
              GDPR Compliant
            </span>
          </div>
          <h2 className="text-3xl font-bold">Your Privacy Matters</h2>
          <p className="text-blue-100 mt-2 max-w-2xl">
            We are committed to protecting your personal information and being transparent about how we use it.
          </p>
        </div>

        {/* ─── Stats Row ────────────────────────────────────────────────── */}
        <div className="relative z-10 flex flex-wrap gap-6 mt-6 pt-6 border-t border-white/10">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3">
              <stat.icon className="w-5 h-5 text-blue-200" />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-blue-100">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Search ────────────────────────────────────────────────────── */}
      <div className="relative mb-8">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search privacy policy..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {searchTerm && (
          <p className="text-xs text-gray-400 mt-2">
            Found {filteredSections.length} of {sections.length} sections
          </p>
        )}
      </div>

      {/* ─── Sections ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {filteredSections.map((section, index) => {
          const Icon = section.icon;
          const colorMap = {
            blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600 border-blue-200',
            purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-600 border-purple-200',
            emerald: 'from-emerald-500 to-emerald-600 bg-emerald-50 text-emerald-600 border-emerald-200',
            amber: 'from-amber-500 to-amber-600 bg-amber-50 text-amber-600 border-amber-200',
            rose: 'from-rose-500 to-rose-600 bg-rose-50 text-rose-600 border-rose-200',
            cyan: 'from-cyan-500 to-cyan-600 bg-cyan-50 text-cyan-600 border-cyan-200',
            indigo: 'from-indigo-500 to-indigo-600 bg-indigo-50 text-indigo-600 border-indigo-200',
            gray: 'from-gray-500 to-gray-600 bg-gray-50 text-gray-600 border-gray-200',
          };

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[section.color].split(' ')[0]} ${colorMap[section.color].split(' ')[1]} flex items-center justify-center shadow-lg shadow-${section.color}-500/20 flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {section.title}
                      </h3>
                      <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        {activeSection === section.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <AnimatePresence>
                      {activeSection === section.id ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3">
                            <p className="text-gray-600 leading-relaxed">
                              {section.body}
                            </p>
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-${section.color}-50 text-${section.color}-600`}>
                                Section {index + 1}
                              </span>
                              <span className="text-xs text-gray-400">
                                Click to collapse
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                          {section.body.substring(0, 120)}...
                        </p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Summary Section ────────────────────────────────────────── */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Privacy Summary</h3>
            <p className="text-xs text-gray-400">Key privacy principles at a glance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryCard
            title="Data Collection"
            icon={Database}
            color="blue"
            items={[
              'Personal information you provide',
              'Usage data and analytics',
              'Property and document uploads',
              'Communication records'
            ]}
          />
          <SummaryCard
            title="Data Usage"
            icon={Settings}
            color="purple"
            items={[
              'Account management',
              'Listing display and moderation',
              'Connecting buyers and agents',
              'AI assistant and verification'
            ]}
          />
          <SummaryCard
            title="Data Protection"
            icon={Shield}
            color="emerald"
            items={[
              'Encrypted password storage',
              'Role-based access control',
              'Secure document storage',
              'Regular security updates'
            ]}
          />
          <SummaryCard
            title="Your Rights"
            icon={UserCheck}
            color="amber"
            items={[
              'Access your data anytime',
              'Update profile information',
              'Request account deletion',
              'Opt-out of communications'
            ]}
          />
        </div>
      </div>

      {/* ─── GDPR Compliance Banner ────────────────────────────────────── */}
      <div className="mt-8 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">GDPR Compliant</h4>
                <span className="text-xs font-medium bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full">EU Standard</span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                We comply with GDPR regulations to protect your data privacy rights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Data protected</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Transparent</span>
          </div>
        </div>
      </div>

      {/* ─── Call to Action ───────────────────────────────────────────── */}
      <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <h4 className="font-semibold text-gray-900">Privacy Questions?</h4>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              We're here to address any privacy concerns you may have
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary-500/20"
            >
              Contact Us
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/terms"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all border border-gray-200"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Footer Note ──────────────────────────────────────────────── */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">
          By using PropEstate, you agree to our Privacy Policy.
          <br />
          Last updated: July 2026
        </p>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" /> Secure
          </span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" /> Transparent
          </span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" /> Trusted
          </span>
        </div>
      </div>
    </PublicPageShell>
  );
}