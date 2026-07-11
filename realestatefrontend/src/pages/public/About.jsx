import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicPageShell from '../../components/layout/PublicPageShell';
import { 
  Building2, ShieldCheck, Users, MapPin, Bot, Sparkles,
  Award, Target, CheckCircle, ArrowRight, Star,
  Heart, Globe, Clock, Zap, TrendingUp,
  MessageCircle, FileCheck, Home, UserCheck,
  ChevronDown, ChevronUp, Quote
} from 'lucide-react';
import { motion } from 'framer-motion';

const values = [
  { 
    icon: ShieldCheck, 
    title: 'Verified Listings', 
    text: 'Every property is reviewed and approved by our admin team, and documents pass through automated verification before going live.',
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    delay: 0.1
  },
  { 
    icon: Users, 
    title: 'Three Roles, One Platform', 
    text: 'Purpose-built dashboards for Buyers, Agents, and Admins — each with its own workspace, tools, and look and feel.',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    delay: 0.2
  },
  { 
    icon: MapPin, 
    title: 'Map-Verified Locations', 
    text: 'Approved properties are pinned on an interactive map so buyers can confirm the exact location before reaching out.',
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    delay: 0.3
  },
  { 
    icon: Bot, 
    title: 'AI Assistant', 
    text: 'Our built-in chat assistant helps you search listings, understand the buying process, and get support instantly, day or night.',
    color: 'from-rose-500 to-rose-600',
    bg: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200',
    delay: 0.4
  },
];

// ─── Stats ──────────────────────────────────────────────────────────────
const stats = [
  { value: '10K+', label: 'Properties Listed', icon: Building2, color: 'from-blue-500 to-blue-600' },
  { value: '500+', label: 'Verified Agents', icon: Users, color: 'from-emerald-500 to-emerald-600' },
  { value: '4.9/5', label: 'Average Rating', icon: Star, color: 'from-amber-500 to-amber-600' },
  { value: '20K+', label: 'Happy Customers', icon: Heart, color: 'from-rose-500 to-rose-600' },
];

// ─── Features ───────────────────────────────────────────────────────────
const features = [
  { icon: ShieldCheck, title: 'AI Document Verification', desc: 'Every uploaded title deed and NOC is screened before it reaches a buyer.', color: 'emerald' },
  { icon: MessageCircle, title: 'Instant Agent Chat', desc: 'Message any agent directly on WhatsApp, or ask our assistant for instant answers.', color: 'blue' },
  { icon: TrendingUp, title: 'Transparent Offers', desc: 'Track every offer you send or receive end-to-end, right up to the closed deal.', color: 'purple' },
  { icon: Clock, title: '24/7 Support', desc: 'Our AI assistant is always available to help you with any questions.', color: 'rose' },
];

// ─── Testimonials ──────────────────────────────────────────────────────
const testimonials = [
  {
    name: 'Aditya Verma',
    role: 'Homeowner',
    quote: 'The AI document verification gave us real confidence before we paid the token amount. The whole process felt transparent from start to finish.',
    rating: 5,
    image: 'https://ui-avatars.com/api/?name=Aditya+Verma&background=2563eb&color=fff&size=60'
  },
  {
    name: 'Kavya Reddy',
    role: 'First-time Buyer',
    quote: 'Found the place within a day using the smart chat assistant. Loved being able to message the agent directly on WhatsApp.',
    rating: 5,
    image: 'https://ui-avatars.com/api/?name=Kavya+Reddy&background=7c3aed&color=fff&size=60'
  },
  {
    name: 'Rahul Nair',
    role: 'Property Seller',
    quote: 'Listing was approved quickly and we had serious buyers reaching out within the first week. Very smooth experience as a seller.',
    rating: 5,
    image: 'https://ui-avatars.com/api/?name=Rahul+Nair&background=059669&color=fff&size=60'
  },
];

// ─── Team Members ──────────────────────────────────────────────────────
const team = [
  { name: 'Priya Sharma', role: 'CEO & Founder', image: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=6366f1&color=fff&size=60' },
  { name: 'Amit Patel', role: 'CTO', image: 'https://ui-avatars.com/api/?name=Amit+Patel&background=8b5cf6&color=fff&size=60' },
  { name: 'Sneha Reddy', role: 'Head of Operations', image: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=ec4899&color=fff&size=60' },
  { name: 'Vikram Singh', role: 'Lead Agent', image: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=14b8a6&color=fff&size=60' },
];

export default function About() {
  const [expandedFeature, setExpandedFeature] = useState(null);

  return (
    <PublicPageShell
      title="About PropEstate"
      subtitle="A modern real-estate marketplace connecting buyers, agents, and admins."
    >
      {/* ─── Mission Statement ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-purple-600 rounded-3xl p-8 text-white shadow-2xl shadow-primary-600/20 mb-8"
      >
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
              <Target className="w-6 h-6 text-blue-200" />
            </div>
            <span className="text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
              Our Mission
            </span>
            <span className="text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
              Since 2024
            </span>
          </div>
          <h2 className="text-3xl font-bold">Making Real Estate Transparent & Trustworthy</h2>
          <p className="text-blue-100 mt-2 max-w-2xl text-lg">
            Our mission is to make every real-estate transaction transparent, verified, and easy to trust.
            We're building a platform where buyers can find their dream home with confidence.
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-4">
            {[
              { icon: ShieldCheck, label: 'Secure' },
              { icon: CheckCircle, label: 'Verified' },
              { icon: Heart, label: 'Trusted' },
              { icon: Zap, label: 'Fast' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-blue-100">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── About Content ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8"
      >
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Who We Are</h3>
                <p className="text-xs text-gray-400">Building the future of real estate</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              PropEstate is a full-stack property marketplace built to make buying, selling,
              and renting real estate simple and trustworthy. We bring buyers, agents, and
              administrators together on one platform — each with tools tailored to their role.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">What We Do</h3>
                <p className="text-xs text-gray-400">Connecting buyers, agents, and admins</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Agents list properties with photos and legal documents. Our admin team reviews
              every submission, verifies documents, and approves listings before they appear
              publicly with full map placement. Buyers can browse, chat with our AI assistant,
              message agents directly, leave reviews, and submit purchase offers — all from a
              single dashboard.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} text-white flex items-center justify-center mb-3 shadow-lg shadow-${stat.color.split(' ')[1]}/20`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ─── Values Grid ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Our Core Values</h3>
            <p className="text-xs text-gray-400">What drives us every day</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {values.map(({ icon: Icon, title, text, color, bg, textColor, borderColor, delay }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay }}
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-transparent hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl ${bg} ${textColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{title}</h4>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{text}</p>
                <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ─── Features ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">What Sets Us Apart</h3>
            <p className="text-xs text-gray-400">Built with trust, transparency, and technology</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className={`w-10 h-10 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-gray-900">{title}</h4>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── Testimonials ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Quote className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">What Our Customers Say</h3>
            <p className="text-xs text-gray-400">Real stories from real people</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── Team ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Meet Our Team</h3>
            <p className="text-xs text-gray-400">The people behind PropEstate</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {team.map((member, index) => (
            <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5 text-center">
              <img src={member.image} alt={member.name} className="w-20 h-20 rounded-full mx-auto mb-3 shadow-lg" />
              <h4 className="font-semibold text-gray-900">{member.name}</h4>
              <p className="text-xs text-gray-500">{member.role}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── CTA Banner ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 md:p-8 text-white shadow-2xl shadow-primary-600/20"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-2xl font-bold">Ready to find your dream property?</h4>
            <p className="text-primary-100 mt-1">Join thousands of happy buyers and agents on PropEstate</p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl flex-shrink-0"
          >
            Browse Listings
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </PublicPageShell>
  );
}