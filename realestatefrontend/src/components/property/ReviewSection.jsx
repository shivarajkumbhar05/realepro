import { useEffect, useState, useRef } from 'react';
import { 
  Star, Trash2, MessageSquare, User, Clock, CheckCircle, 
  AlertCircle, Edit, ThumbsUp, Heart, Share2, 
  Award, Shield, Sparkles, TrendingUp, Calendar,
  Flag, MoreVertical, Reply, Send, Image as ImageIcon,
  Smile, Mic, Paperclip, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getPropertyReviews, createReview, deleteReview } from '../../api/reviews';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Enhanced Star Row Component ──────────────────────────────────────────────
function StarRow({ value, onChange, size = 'w-5 h-5', interactive = true, showLabel = false }) {
  const [hover, setHover] = useState(0);
  const canInteract = interactive && onChange;

  return (
    <div className="flex flex-col items-center gap-1">
      {showLabel && (
        <span className="text-xs font-medium text-gray-600">
          {value > 0 ? `${value} stars` : 'Select rating'}
        </span>
      )}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            type="button"
            key={n}
            onClick={() => canInteract && onChange?.(n)}
            onMouseEnter={() => canInteract && setHover(n)}
            onMouseLeave={() => canInteract && setHover(0)}
            className={canInteract ? 'cursor-pointer' : 'cursor-default'}
            disabled={!canInteract}
            aria-label={`Rate ${n} stars`}
            whileHover={canInteract ? { scale: 1.2, rotate: -5 } : {}}
            whileTap={canInteract ? { scale: 0.9 } : {}}
          >
            <Star
              className={`${size} transition-all duration-200 ${
                (hover || value) >= n 
                  ? 'fill-yellow-400 text-yellow-400 drop-shadow-md' 
                  : 'fill-gray-200 text-gray-200 hover:fill-gray-300'
              }`}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Enhanced Review Item Component ────────────────────────────────────────────
function ReviewItem({ review, isOwn, onDelete, onEdit, userRole }) {
  const [expanded, setExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const isLong = review.comment && review.comment.length > 150;

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 30) return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 relative"
    >
      {/* Decorative gradient line */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-4 flex-1">
          {/* Enhanced Avatar */}
          <motion.div 
            className="relative flex-shrink-0"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-500/20">
              {review.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {review.isVerified && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-md"
              >
                <CheckCircle className="w-3 h-3 text-white" />
              </motion.div>
            )}
            {review.user?.role === 'agent' && (
              <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                <Shield className="w-3 h-3 text-white" />
              </div>
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">
                {review.user?.name || 'Anonymous User'}
              </p>
              {review.user?.role === 'agent' && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-0.5">
                  <Shield className="w-2.5 h-2.5" /> Agent
                </span>
              )}
              {review.isVerified && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                  <CheckCircle className="w-2.5 h-2.5" /> Verified Purchase
                </span>
              )}
              {review.isTopReviewer && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-0.5">
                  <Award className="w-2.5 h-2.5" /> Top Reviewer
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 mt-0.5">
              <StarRow value={review.rating} size="w-3.5 h-3.5" interactive={false} />
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {getTimeAgo(review.createdAt)}
              </span>
            </div>

            <motion.div 
              className="mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className={`text-sm text-gray-600 leading-relaxed ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
                {review.comment}
              </p>
              {isLong && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 mt-1 hover:underline transition-colors"
                >
                  {expanded ? 'Show less' : 'Read more'}
                </motion.button>
              )}
            </motion.div>

            {/* Enhanced Review Actions */}
            <div className="flex items-center gap-6 mt-3">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsHelpful(!isHelpful)}
                className={`flex items-center gap-1.5 text-xs transition-colors group/action ${
                  isHelpful ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 transition-transform group-hover/action:scale-110 ${
                  isHelpful ? 'fill-primary-600' : ''
                }`} />
                <span>Helpful ({review.helpfulCount || 0})</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-1.5 text-xs transition-colors group/action ${
                  isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 transition-transform group-hover/action:scale-110 ${
                  isLiked ? 'fill-red-500' : ''
                }`} />
                <span>Like ({review.likeCount || 0})</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowReply(!showReply)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-600 transition-colors"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </motion.button>
            </div>

            {/* Reply Section */}
            <AnimatePresence>
              {showReply && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pl-6 border-l-2 border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Actions Dropdown */}
        <div className="relative">
          {(isOwn || userRole === 'admin') && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowActions(!showActions)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <MoreVertical className="w-4 h-4" />
              </motion.button>
              
              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10"
                  >
                    <button
                      onClick={() => {
                        onEdit?.(review);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        onDelete();
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Flag className="w-4 h-4" /> Report
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Enhanced Rating Summary ──────────────────────────────────────────────────
function RatingSummary({ avgRating, numReviews, distribution }) {
  const percentages = distribution.map(count => 
    numReviews > 0 ? (count / numReviews) * 100 : 0
  );

  const ratingLabels = {
    5: 'Excellent',
    4: 'Good',
    3: 'Average',
    2: 'Below Average',
    1: 'Poor'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary-50/50 to-indigo-50/50 rounded-2xl p-6 border border-primary-100/30"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Rating */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div>
              <div className="text-5xl font-bold text-gray-900">
                {avgRating ? avgRating.toFixed(1) : '0.0'}
              </div>
              <StarRow value={Math.round(avgRating)} size="w-5 h-5" interactive={false} />
              <p className="text-sm text-gray-500 mt-1">
                {numReviews} {numReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            <div className="hidden md:block h-16 w-px bg-gray-200" />
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <motion.div 
                key={star} 
                className="flex items-center gap-3 text-sm group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (5 - star) * 0.1 }}
              >
                <span className="text-gray-600 w-6 font-medium">{star}</span>
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentages[5 - star]}%` }}
                    transition={{ duration: 0.8, delay: (5 - star) * 0.1 }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">
                  {distribution[5 - star] || 0}
                </span>
                <span className="text-xs text-gray-400 w-20 hidden sm:block">
                  {ratingLabels[star]}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Enhanced Main Component ─────────────────────────────────────────────────────
export default function ReviewSection({ propertyId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [numReviews, setNumReviews] = useState(0);
  const [distribution, setDistribution] = useState([0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const textareaRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getPropertyReviews(propertyId);
      const reviewsData = data.data || [];
      setReviews(reviewsData);
      setAvgRating(data.avgRating || 0);
      setNumReviews(data.numReviews || 0);
      
      const dist = [0, 0, 0, 0, 0];
      reviewsData.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
          dist[5 - r.rating]++;
        }
      });
      setDistribution(dist);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [propertyId]);

  // Sort and filter reviews
  const getFilteredReviews = () => {
    let filtered = [...reviews];
    
    if (filterBy === 'verified') {
      filtered = filtered.filter(r => r.isVerified);
    } else if (filterBy === 'with_photos') {
      filtered = filtered.filter(r => r.images && r.images.length > 0);
    } else if (filterBy === 'top_rated') {
      filtered = filtered.filter(r => r.rating >= 4);
    }
    
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'highest') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      filtered.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === 'helpful') {
      filtered.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    }
    
    return filtered;
  };

  const filteredReviews = getFilteredReviews();
  const myReview = reviews.find((r) => r.user?._id === user?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a star rating.', { 
        icon: '⭐',
        duration: 3000
      });
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a short review.', {
        icon: '✍️',
        duration: 3000
      });
      return;
    }
    setSubmitting(true);
    try {
      await createReview(propertyId, { rating, comment: comment.trim() });
      toast.success('🎉 Thanks for your review! It helps others make informed decisions.');
      setRating(0);
      setComment('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
    try {
      await deleteReview(id);
      toast.success('Review deleted successfully');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleEdit = (review) => {
    setRating(review.rating);
    setComment(review.comment);
    // Scroll to form
    document.querySelector('.review-form')?.scrollIntoView({ behavior: 'smooth' });
    toast.success('Edit your review below');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-500 mt-4 text-sm">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* ─── Enhanced Header ────────────────────────────────────────────────────── */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white shadow-lg shadow-primary-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reviews & Ratings</h3>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <span>{numReviews} {numReviews === 1 ? 'review' : 'reviews'}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  {avgRating ? avgRating.toFixed(1) : '0.0'} average
                </span>
              </p>
            </div>
          </div>
          
          {/* Sort and Filter Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="all">All Reviews</option>
              <option value="verified">Verified Only</option>
              <option value="top_rated">Top Rated (4+)</option>
              <option value="with_photos">With Photos</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* ─── Rating Summary ───────────────────────────────────────────── */}
        {numReviews > 0 && (
          <RatingSummary 
            avgRating={avgRating} 
            numReviews={numReviews} 
            distribution={distribution} 
          />
        )}

        {/* ─── Review Form ──────────────────────────────────────────────── */}
        {!myReview ? (
          <motion.form
            ref={textareaRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="review-form bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-500/20">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Guest'}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> 
                  {user?.role === 'agent' ? 'Verified Agent' : 'Verified User'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Your Rating <span className="text-red-500">*</span>
                </label>
                <StarRow 
                  value={rating} 
                  onChange={setRating} 
                  size="w-8 h-8" 
                  showLabel={true}
                />
                {rating === 0 && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-amber-600 mt-1 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" /> Please select a rating
                  </motion.p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      if (textareaRef.current) {
                        textareaRef.current.style.height = 'auto';
                        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
                      }
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Share your experience with this property or agent..."
                    rows={3}
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
                      isFocused 
                        ? 'border-primary-500 ring-2 ring-primary-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ minHeight: '80px' }}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <Paperclip className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                <div className="flex justify-between mt-1.5">
                  <p className="text-xs text-gray-400">
                    {comment.length}/500 characters
                  </p>
                  {comment.trim() && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-emerald-600 flex items-center gap-0.5"
                    >
                      <CheckCircle className="w-3 h-3" /> Ready to submit
                    </motion.p>
                  )}
                </div>
              </div>

              <motion.button 
                type="submit" 
                disabled={submitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting Review...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 flex items-center gap-4"
          >
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 shadow-md">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800">You've already reviewed this property</p>
              <p className="text-xs text-emerald-600">Your feedback helps others make informed decisions</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEdit(myReview)}
              className="ml-auto px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-md flex items-center gap-2"
            >
              <Edit className="w-4 h-4" /> Edit Review
            </motion.button>
          </motion.div>
        )}

        {/* ─── Reviews List ────────────────────────────────────────────── */}
        {filteredReviews.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-lg">No reviews yet</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to share your experience</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredReviews.map((review) => (
                <ReviewItem
                  key={review._id}
                  review={review}
                  isOwn={review.user?._id === user?.id}
                  onDelete={() => handleDelete(review._id)}
                  onEdit={() => handleEdit(review)}
                  userRole={user?.role}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ─── Trust Badge ───────────────────────────────────────────────── */}
        {numReviews > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400"
          >
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              All reviews are verified
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {numReviews} total reviews
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {avgRating >= 4 ? 'Highly rated' : avgRating >= 3 ? 'Average rating' : 'Needs improvement'}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}