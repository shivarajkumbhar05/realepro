import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicPageShell from '../../components/layout/PublicPageShell';
import { 
  Shield, CheckCircle, Users, Home, FileText, 
  AlertCircle, Scale, BookOpen, ArrowRight, 
  Sparkles, Lock, Globe, Heart, Star, Award,
  ChevronDown, ChevronUp, Clock, Building2,
  UserCheck, FileCheck, Handshake, Gavel
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    body: 'By creating an account or using PropEstate, you agree to these Terms of Service. If you do not agree, please discontinue use of the platform.',
    icon: CheckCircle,
    color: 'emerald',
  },
  {
    id: 'accounts',
    title: '2. Accounts & Roles',
    body: 'PropEstate offers three account roles — Buyer, Agent, and Admin. Buyers may browse listings, submit purchase offers, and leave reviews. Agents may list properties, subject to admin review and approval. Admins moderate users and listings. You are responsible for maintaining the confidentiality of your login credentials.',
    icon: Users,
    color: 'blue',
  },
  {
    id: 'listing-approval',
    title: '3. Listing Approval',
    body: 'All property listings submitted by Agents are reviewed by an Admin before appearing publicly, including map placement and document verification. PropEstate reserves the right to reject or remove any listing that violates these terms or contains inaccurate information.',
    icon: Home,
    color: 'purple',
  },
  {
    id: 'purchases',
    title: '4. Purchases & Offers',
    body: 'Purchase requests submitted through the platform are offers only, and do not constitute a binding legal transaction. Buyers and Agents are responsible for completing any resulting sale, rental agreement, or contract outside of the platform, including legal and financial due diligence.',
    icon: Handshake,
    color: 'amber',
  },
  {
    id: 'content',
    title: '5. Content & Conduct',
    body: 'You agree not to upload false, misleading, or infringing content, including fabricated documents or images. Reviews must reflect genuine experiences. PropEstate may suspend or deactivate accounts that violate these rules.',
    icon: Shield,
    color: 'rose',
  },
  {
    id: 'document-verification',
    title: '6. Document Verification',
    body: 'Automated document verification provides a confidence score to assist admin review, but does not guarantee legal validity of any title, NOC, or floor plan. Buyers should always perform independent legal verification before completing a transaction.',
    icon: FileCheck,
    color: 'cyan',
  },
  {
    id: 'liability',
    title: '7. Limitation of Liability',
    body: 'PropEstate acts as a marketplace connecting buyers and agents and is not a party to any resulting property transaction. We are not liable for disputes, losses, or damages arising from listings, communications, or transactions between users.',
    icon: Scale,
    color: 'indigo',
  },
  {
    id: 'changes',
    title: '8. Changes to These Terms',
    body: 'We may update these Terms from time to time. Continued use of PropEstate after changes are posted constitutes acceptance of the revised Terms.',
    icon: Clock,
    color: 'gray',
  },
];

// ─── Summary Card ──────────────────────────────────────────────────────
function SummaryCard({ title, items, icon: Icon, color }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const colorMap = {
    emerald: 'from-emerald-500 to-emerald-600 bg-emerald-50 text-emerald-600 border-emerald-200',
    blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600 border-blue-200',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-600 border-purple-200',
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

export default function Terms() {
  const [activeSection, setActiveSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ─── Quick Stats ──────────────────────────────────────────────────────
  const stats = [
    { label: 'Sections', value: sections.length, icon: BookOpen },
    { label: 'Last Updated', value: 'July 2026', icon: Clock },
    { label: 'Status', value: 'Active', icon: Shield },
  ];

  // ─── Filter Sections ──────────────────────────────────────────────────
  const filteredSections = sections.filter(section => 
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PublicPageShell 
      title="Terms of Service" 
      subtitle="Last updated: July 2026"
    >
      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-purple-600 rounded-3xl p-8 text-white shadow-2xl shadow-primary-600/20 mb-8">
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
              <Gavel className="w-6 h-6 text-blue-200" />
            </div>
            <span className="text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
              Legal Document
            </span>
            <span className="text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
              Version 2.0
            </span>
          </div>
          <h2 className="text-3xl font-bold">Understanding Our Terms</h2>
          <p className="text-blue-100 mt-2 max-w-2xl">
            These terms govern your use of PropEstate. Please read them carefully before using our platform.
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
          placeholder="Search terms..."
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
            emerald: 'from-emerald-500 to-emerald-600 bg-emerald-50 text-emerald-600 border-emerald-200',
            blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600 border-blue-200',
            purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-600 border-purple-200',
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
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Quick Summary</h3>
            <p className="text-xs text-gray-400">Key points at a glance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryCard
            title="User Responsibilities"
            icon={Users}
            color="blue"
            items={[
              'Maintain account confidentiality',
              'Provide accurate information',
              'Follow community guidelines',
              'Respect other users'
            ]}
          />
          <SummaryCard
            title="Platform Rights"
            icon={Shield}
            color="purple"
            items={[
              'Review and approve listings',
              'Remove violating content',
              'Suspend accounts if needed',
              'Update terms as required'
            ]}
          />
          <SummaryCard
            title="Transaction Guidelines"
            icon={Handshake}
            color="amber"
            items={[
              'Offers are not binding contracts',
              'Due diligence is buyer\'s responsibility',
              'Agents must verify listings',
              'Legal agreements done off-platform'
            ]}
          />
          <SummaryCard
            title="Legal Disclaimers"
            icon={Scale}
            color="rose"
            items={[
              'No guarantee of document validity',
              'Platform not liable for disputes',
              'Users transact at own risk',
              'Independent verification required'
            ]}
          />
        </div>
      </div>

      {/* ─── Call to Action ───────────────────────────────────────────── */}
      <div className="mt-8 p-6 bg-gradient-to-br from-primary-50 to-indigo-50 rounded-2xl border border-primary-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <h4 className="font-semibold text-gray-900">Questions about our Terms?</h4>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              We're here to help you understand our policies
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
              to="/privacy"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all border border-gray-200"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Footer Note ──────────────────────────────────────────────── */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">
          By using PropEstate, you agree to these Terms of Service.
          <br />
          Last updated: July 2026
        </p>
      </div>
    </PublicPageShell>
  );
}