import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Phone, 
  Clock, 
  CheckCircle,
  Users,
  Building2,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  ChevronRight,
  User,
  Mail,
  MapPin,
  Star,
  Heart,
  Share2,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Generic support number used when no agent-specific number is supplied.
const DEFAULT_SUPPORT_PHONE = import.meta.env.VITE_WHATSAPP_SUPPORT_NUMBER || '911234567890';

// Business hours configuration
const BUSINESS_HOURS = {
  start: 9, // 9 AM
  end: 21, // 9 PM
  timezone: 'Asia/Kolkata',
  weekdays: [1, 2, 3, 4, 5, 6] // Monday to Saturday
};

// Pre-defined quick messages
const QUICK_MESSAGES = {
  inquiry: "Hi! I'm interested in this property. Could you please share more details?",
  visit: "Hi! I'd like to schedule a site visit for this property. When would be a good time?",
  price: "Hi! Is the price negotiable? I'm interested in this property.",
  documents: "Hi! What documents are required for this property?",
  loan: "Hi! Do you offer home loan assistance for this property?",
  general: "Hi! I have a question about a property on PropEstate."
};

function buildWaLink(phone, message) {
  const cleaned = (phone || DEFAULT_SUPPORT_PHONE).replace(/[^\d]/g, '');
  const text = encodeURIComponent(message || QUICK_MESSAGES.general);
  return `https://wa.me/${cleaned}?text=${text}`;
}

// Check if support is online
function isSupportOnline() {
  const now = new Date();
  const hours = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Check if within business hours and business day
  const isBusinessDay = BUSINESS_HOURS.weekdays.includes(day);
  const isBusinessHours = hours >= BUSINESS_HOURS.start && hours < BUSINESS_HOURS.end;
  
  return isBusinessDay && isBusinessHours;
}

// Get status message
function getStatusMessage() {
  if (isSupportOnline()) {
    return {
      status: 'online',
      text: '🟢 Online • Usually replies in minutes',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      dotColor: 'bg-emerald-500'
    };
  } else {
    return {
      status: 'offline',
      text: '🟡 Offline • Will reply within 24 hours',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      dotColor: 'bg-amber-500'
    };
  }
}

// Quick Message Button Component
function QuickMessageButton({ icon: Icon, label, message, phone, onClick }) {
  return (
    <button
      onClick={() => {
        const link = buildWaLink(phone, message);
        window.open(link, '_blank');
        onClick?.(message);
      }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition-all duration-200 text-xs text-gray-700 hover:text-emerald-700"
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

// Enhanced Floating WhatsApp Launcher
export function WhatsAppFloatingButton({ 
  phone, 
  message, 
  showTooltip = true,
  showStatus = true,
  position = 'bottom-right',
  animation = 'pulse'
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const status = getStatusMessage();

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const positionClasses = {
    'bottom-right': 'bottom-24 right-5',
    'bottom-left': 'bottom-24 left-5',
    'top-right': 'top-24 right-5',
    'top-left': 'top-24 left-5'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    none: ''
  };

  return (
    <div className={`fixed ${positionClasses[position] || positionClasses['bottom-right']} z-40 transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
    }`}>
      {/* Main Button */}
      <div className="relative">
        {/* Pulsing Ring */}
        {animation === 'pulse' && (
          <div className={`absolute inset-0 rounded-full bg-emerald-400 ${animationClasses[animation]} opacity-40`}></div>
        )}
        
        {/* Tooltip */}
        {showTooltip && isHovered && (
          <div className="absolute bottom-full right-0 mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Chat with us</p>
                <p className="text-xs text-gray-500">Get instant help from our team</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-2 h-2 rounded-full ${status.dotColor} ${status.status === 'online' ? 'animate-pulse' : ''}`}></div>
                  <span className={`text-xs ${status.color}`}>{status.text}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {status.status === 'online' ? 'Response: 5-10 min' : 'Response: 24 hrs'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Dropdown */}
        {showQuickActions && (
          <div className="absolute bottom-full right-0 mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-slideUp">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">Quick Questions</h4>
              <button 
                onClick={() => setShowQuickActions(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <QuickMessageButton 
                icon={Sparkles} 
                label="General Inquiry" 
                message={QUICK_MESSAGES.inquiry}
                phone={phone}
              />
              <QuickMessageButton 
                icon={Calendar} 
                label="Schedule Visit" 
                message={QUICK_MESSAGES.visit}
                phone={phone}
              />
              <QuickMessageButton 
                icon={DollarSign} 
                label="Price Negotiation" 
                message={QUICK_MESSAGES.price}
                phone={phone}
              />
              <QuickMessageButton 
                icon={FileText} 
                label="Documents" 
                message={QUICK_MESSAGES.documents}
                phone={phone}
              />
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  const link = buildWaLink(phone, message);
                  window.open(link, '_blank');
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300"
              >
                <Send className="w-4 h-4" />
                Send Custom Message
              </button>
            </div>
          </div>
        )}

        {/* Main WhatsApp Button */}
        <button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => {
            if (!showQuickActions) {
              const link = buildWaLink(phone, message);
              window.open(link, '_blank');
            }
          }}
          className="group relative block w-16 h-16 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white flex items-center justify-center shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" fill="white" strokeWidth={0} />
          
          {/* Status Badge */}
          {showStatus && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
          )}
          
          <span className="sr-only">Chat on WhatsApp</span>
        </button>

        {/* Quick Actions Toggle */}
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-full px-2 py-0.5 text-[10px] font-medium text-gray-600 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {showQuickActions ? 'Close' : 'Quick Qs'}
        </button>
      </div>

      {/* Status Badge */}
      {showStatus && (
        <div className={`mt-2 text-center ${status.bgColor} rounded-full px-3 py-1 shadow-sm border border-gray-100/50 backdrop-blur-sm`}>
          <span className={`text-[10px] font-medium ${status.color}`}>
            {status.status === 'online' ? '🟢 Online' : '🟡 Away'}
          </span>
        </div>
      )}
    </div>
  );
}

// Enhanced Inline WhatsApp Button with Agent Card
export function WhatsAppButton({ 
  phone, 
  message, 
  label = 'Chat on WhatsApp', 
  variant = 'default',
  showIcon = true,
  size = 'default',
  className = '',
  agentName,
  agentImage,
  agentRole,
  agentRating,
  propertyTitle,
  propertyPrice,
  propertyLocation,
  onOpen,
  showQuickMessages = false,
  expanded = false,
  icon: Icon
}) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [selectedQuickMsg, setSelectedQuickMsg] = useState('');
  const status = getStatusMessage();

  const variants = {
    default: 'bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:shadow-lg hover:shadow-emerald-500/30 text-white',
    outline: 'border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white',
    ghost: 'text-[#25D366] hover:bg-emerald-50',
    gradient: 'bg-gradient-to-r from-[#25D366] via-[#128C7E] to-[#075E54] text-white hover:shadow-xl hover:shadow-emerald-500/40',
    dark: 'bg-gray-900 text-white hover:bg-gray-800',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    default: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const handleQuickMessage = (msg) => {
    setSelectedQuickMsg(msg);
    const link = buildWaLink(phone, msg);
    window.open(link, '_blank');
    onOpen?.(msg);
  };

  // Full Agent Card Mode
  if (agentName || agentImage) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}>
        {/* Agent Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {agentImage ? (
              <img src={agentImage} alt={agentName} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                {agentName?.[0]?.toUpperCase() || 'A'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-gray-900">{agentName || 'Support Team'}</p>
              <p className="text-sm text-gray-600">{agentRole || 'Property Expert'}</p>
              {agentRating && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">{agentRating}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400">Verified Agent</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className={`text-xs font-medium px-2 py-1 rounded-full ${status.bgColor} ${status.color}`}>
                {status.status === 'online' ? 'Online' : 'Offline'}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                {status.status === 'online' ? 'Quick reply' : '24hr response'}
              </div>
            </div>
          </div>
        </div>

        {/* Property Context */}
        {propertyTitle && (
          <div className="p-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{propertyTitle}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                  {propertyLocation && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      {propertyLocation}
                    </span>
                  )}
                  {propertyPrice && (
                    <span className="font-semibold text-emerald-600">
                      ₹{propertyPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Messages */}
        {showQuickMessages && (
          <div className="p-3 bg-gray-50/50 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-600 mb-2">Quick Replies</p>
            <div className="flex flex-wrap gap-2">
              <QuickMessageButton 
                icon={Sparkles} 
                label="Interested" 
                message={QUICK_MESSAGES.inquiry}
                phone={phone}
                onClick={handleQuickMessage}
              />
              <QuickMessageButton 
                icon={Calendar} 
                label="Visit" 
                message={QUICK_MESSAGES.visit}
                phone={phone}
                onClick={handleQuickMessage}
              />
              <QuickMessageButton 
                icon={DollarSign} 
                label="Negotiate" 
                message={QUICK_MESSAGES.price}
                phone={phone}
                onClick={handleQuickMessage}
              />
              <QuickMessageButton 
                icon={FileText} 
                label="Documents" 
                message={QUICK_MESSAGES.documents}
                phone={phone}
                onClick={handleQuickMessage}
              />
            </div>
          </div>
        )}

        {/* Main Action Button */}
        <div className="p-4">
          <a
            href={buildWaLink(phone, message)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (selectedQuickMsg) {
                e.preventDefault();
                const link = buildWaLink(phone, selectedQuickMsg);
                window.open(link, '_blank');
              }
              onOpen?.(message);
            }}
            className={`flex items-center justify-center gap-2 w-full rounded-xl font-semibold transition-all duration-300 ${
              variants[variant] || variants.default
            } ${sizes[size] || sizes.default}`}
          >
            {showIcon && <MessageCircle className="w-5 h-5" fill="white" strokeWidth={0} />}
            {label}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    );
  }

  // Simple Button Version
  return (
    <a
      href={buildWaLink(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onOpen}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 ${
        variants[variant] || variants.default
      } ${sizes[size] || sizes.default} ${className} group`}
    >
      {showIcon && <MessageCircle className="w-4 h-4" fill="white" strokeWidth={0} />}
      {label}
      <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}

// WhatsApp Chat Bubble Component
export function WhatsAppChatBubble({ 
  phone, 
  message, 
  name = 'Support',
  timestamp,
  isOutgoing = false,
  showAvatar = true
}) {
  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isOutgoing && showAvatar && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[70%] ${isOutgoing ? 'order-2' : ''}`}>
        {!isOutgoing && (
          <p className="text-xs font-medium text-gray-700 mb-0.5">{name}</p>
        )}
        <div className={`px-4 py-2.5 rounded-2xl text-sm ${
          isOutgoing 
            ? 'bg-emerald-600 text-white rounded-br-sm' 
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}>
          {message}
        </div>
        {timestamp && (
          <p className={`text-[10px] text-gray-400 mt-0.5 ${isOutgoing ? 'text-right' : ''}`}>
            {timestamp}
          </p>
        )}
      </div>
      {isOutgoing && showAvatar && (
        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}

// WhatsApp Share Button
export function WhatsAppShareButton({ title, description, url, phone }) {
  const shareMessage = `${title}\n${description}\n\n${url}`;
  
  return (
    <a
      href={buildWaLink(phone, shareMessage)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm text-gray-700"
    >
      <Share2 className="w-4 h-4" />
      Share on WhatsApp
    </a>
  );
}

// Export all components
export default {
  WhatsAppFloatingButton,
  WhatsAppButton,
  WhatsAppChatBubble,
  WhatsAppShareButton,
  QuickMessageButton,
  buildWaLink,
  isSupportOnline,
  getStatusMessage,
  QUICK_MESSAGES
};