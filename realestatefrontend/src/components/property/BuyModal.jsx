import { useState, useEffect } from 'react';
import { X, IndianRupee, Home, User, MessageCircle, Phone, CheckCircle, AlertCircle, Sparkles, Send, Building2, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { createPurchase } from '../../api/purchases';
import { motion, AnimatePresence } from 'framer-motion';

export default function BuyModal({ property, onClose, onSuccess }) {
  const [offerPrice, setOfferPrice] = useState(property.price || '');
  const [message, setMessage] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [step, setStep] = useState(1);
  const [suggestedPrice, setSuggestedPrice] = useState(null);

  // ─── Calculate suggested price ──────────────────────────────────────
  useEffect(() => {
    if (property.price) {
      const suggested = Math.round(property.price * 0.95);
      setSuggestedPrice(suggested);
    }
  }, [property.price]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offerPrice || Number(offerPrice) <= 0) {
      toast.error('Please enter a valid offer price.');
      return;
    }
    if (Number(offerPrice) > property.price * 2) {
      toast.error('Your offer seems too high. Please check the price.');
      return;
    }
    setSubmitting(true);
    try {
      await createPurchase(property._id, {
        offerPrice: Number(offerPrice),
        message: message.trim(),
        contactPhone: contactPhone.trim(),
      });
      toast.success('🎉 Offer sent to the agent successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit offer. Please try again.');
    }
    setSubmitting(false);
  };

  // ─── Quick Price Suggestions ────────────────────────────────────────
  const priceSuggestions = [
    { label: 'Market Value', value: Math.round(property.price * 0.95), icon: '📊' },
    { label: 'Good Deal', value: Math.round(property.price * 0.90), icon: '💰' },
    { label: 'Great Deal', value: Math.round(property.price * 0.85), icon: '🔥' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ──────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-5 text-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-3xl translate-y-16 -translate-x-16"></div>
          </div>
          
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 p-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="relative flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Make an Offer</h3>
              <p className="text-primary-100 text-sm">Submit your offer to the agent</p>
            </div>
          </div>
        </div>

        {/* ─── Property Preview ───────────────────────────────────────── */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-4 p-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200/50">
            <div className="w-14 h-14 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{property.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">{property.location?.city}, {property.location?.state}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-xs font-medium text-primary-600">₹{property.price?.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
              property.status === 'sale' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
            }`}>
              {property.status === 'sale' ? 'For Sale' : 'For Rent'}
            </div>
          </div>
        </div>

        {/* ─── Form ────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* ─── Offer Price ───────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-primary-500" />
                Your Offer Price <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-400">Listed: ₹{property.price?.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                ₹
              </div>
              <input
                type="number"
                min="1"
                step="1000"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                onFocus={() => setFocusedField('price')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-8 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  focusedField === 'price' 
                    ? 'border-primary-500 ring-2 ring-primary-100 bg-white' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Enter your offer amount"
                required
              />
            </div>

            {/* ─── Price Suggestions ──────────────────────────────────── */}
            <div className="flex flex-wrap gap-2 mt-3">
              {priceSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setOfferPrice(suggestion.value)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-gray-200 hover:border-primary-200 transition-all"
                >
                  <span>{suggestion.icon}</span>
                  <span>{suggestion.label}</span>
                  <span className="font-medium">₹{suggestion.value.toLocaleString('en-IN')}</span>
                </button>
              ))}
            </div>

            {suggestedPrice && Number(offerPrice) > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                {Number(offerPrice) > property.price ? (
                  <span className="text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {((Number(offerPrice) - property.price) / property.price * 100).toFixed(0)}% above asking
                  </span>
                ) : Number(offerPrice) < property.price * 0.8 ? (
                  <span className="text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Low offer — consider a higher amount
                  </span>
                ) : (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Competitive offer!
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ─── Contact Phone ─────────────────────────────────────────── */}
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-1.5">
              <Phone className="w-4 h-4 text-primary-500" />
              Contact Phone
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                +91
              </div>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  focusedField === 'phone' 
                    ? 'border-primary-500 ring-2 ring-primary-100 bg-white' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="9876543210"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Optional — for the agent to reach you</p>
          </div>

          {/* ─── Message ───────────────────────────────────────────────── */}
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-1.5">
              <MessageCircle className="w-4 h-4 text-primary-500" />
              Message to Agent
            </label>
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setFocusedField('message')}
                onBlur={() => setFocusedField(null)}
                rows={3}
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
                  focusedField === 'message' 
                    ? 'border-primary-500 ring-2 ring-primary-100 bg-white' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="I'm interested in this property because..."
              />
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-[10px] text-gray-400">Optional — personalize your offer</p>
              <span className="text-[10px] text-gray-400">{message.length}/500</span>
            </div>
          </div>

          {/* ─── Actions ───────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting} 
              className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold px-4 py-3 rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Offer
                </>
              )}
            </button>
          </div>

          {/* ─── Terms ──────────────────────────────────────────────────── */}
          <div className="text-center">
            <p className="text-[10px] text-gray-400">
              By submitting, you agree to our{' '}
              <a href="/terms" className="text-primary-600 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}