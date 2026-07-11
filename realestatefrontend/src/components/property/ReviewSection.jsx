import { useEffect, useState } from 'react';
import { Star, Trash2, MessageSquare, User, Clock, CheckCircle, AlertCircle, Edit, ThumbsUp, Heart, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPropertyReviews, createReview, deleteReview } from '../../api/reviews';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Star Row Component ──────────────────────────────────────────────
function StarRow({ value, onChange, size = 'w-5 h-5', interactive = true }) {
  const [hover, setHover] = useState(0);
  const canInteract = interactive && onChange;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          onClick={() => canInteract && onChange?.(n)}
          onMouseEnter={() => canInteract && setHover(n)}
          onMouseLeave={() => canInteract && setHover(0)}
          className={canInteract ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
          disabled={!canInteract}
          aria-label={`Rate ${n} stars`}
        >
          <Star
            className={`${size} transition-colors ${
              (hover || value) >= n 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Review Item Component ────────────────────────────────────────────
function ReviewItem({ review, isOwn, onDelete, userRole }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.comment && review.comment.length > 150;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-500/20">
              {review.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {review.isVerified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">
                {review.user?.name || 'Anonymous User'}
              </p>
              {review.user?.role === 'agent' && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Agent
                </span>
              )}
              {review.isVerified && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                  <CheckCircle className="w-2.5 h-2.5" /> Verified
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-0.5">
              <StarRow value={review.rating} size="w-3.5 h-3.5" interactive={false} />
              <span className="text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric' 
                })}
              </span>
            </div>

            <div className="mt-2">
              <p className={`text-sm text-gray-600 leading-relaxed ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
                {review.comment}
              </p>
              {isLong && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 mt-1 hover:underline transition-colors"
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {/* Review Actions */}
            <div className="flex items-center gap-4 mt-2">
              <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 transition-colors group/action">
                <ThumbsUp className="w-3.5 h-3.5 group-hover/action:scale-110 transition-transform" />
                <span>Helpful</span>
              </button>
              <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 transition-colors group/action">
                <Heart className="w-3.5 h-3.5 group-hover/action:scale-110 transition-transform" />
                <span>Like</span>
              </button>
            </div>
          </div>
        </div>

        {/* Delete Button */}
        {(isOwn || userRole === 'admin') && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
            title="Delete review"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Rating Summary ──────────────────────────────────────────────────
function RatingSummary({ avgRating, numReviews, distribution }) {
  const percentages = distribution.map(count => 
    numReviews > 0 ? (count / numReviews) * 100 : 0
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900">
            {avgRating ? avgRating.toFixed(1) : '0.0'}
          </div>
          <StarRow value={Math.round(avgRating)} size="w-5 h-5" interactive={false} />
          <p className="text-sm text-gray-500 mt-1">{numReviews} {numReviews === 1 ? 'review' : 'reviews'}</p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 w-full">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 w-4">{star}</span>
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentages[5 - star]}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8">
                {distribution[5 - star] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────
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

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getPropertyReviews(propertyId);
      const reviewsData = data.data || [];
      setReviews(reviewsData);
      setAvgRating(data.avgRating || 0);
      setNumReviews(data.numReviews || 0);
      
      // Calculate distribution
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

  const myReview = reviews.find((r) => r.user?._id === user?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a star rating.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a short review.');
      return;
    }
    setSubmitting(true);
    try {
      await createReview(propertyId, { rating, comment: comment.trim() });
      toast.success('🎉 Thanks for your review!');
      setRating(0);
      setComment('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteReview(id);
      toast.success('Review deleted successfully');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-500 mt-4 text-sm">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-100 rounded-xl text-primary-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Reviews & Ratings</h3>
            <p className="text-xs text-gray-400">
              {numReviews} {numReviews === 1 ? 'review' : 'reviews'} • {avgRating ? avgRating.toFixed(1) : '0.0'} avg
            </p>
          </div>
        </div>
        {numReviews > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRow value={Math.round(avgRating)} size="w-4 h-4" interactive={false} />
            <span className="text-sm font-semibold text-gray-900">{avgRating.toFixed(1)}</span>
          </div>
        )}
      </div>

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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="mt-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Guest'}</p>
              <p className="text-xs text-gray-400">Share your experience</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <StarRow value={rating} onChange={setRating} size="w-6 h-6" />
            {rating === 0 && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Please select a rating
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Share your experience with this property or agent..."
              rows={3}
              className={`w-full px-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
                isFocused 
                  ? 'border-primary-500 ring-2 ring-primary-100' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            />
            <div className="flex justify-between mt-1">
              <p className="text-[10px] text-gray-400">
                {comment.length}/500 characters
              </p>
              {comment.trim() && (
                <p className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                  <CheckCircle className="w-3 h-3" /> Ready to submit
                </p>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting} 
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Submit Review
              </>
            )}
          </button>
        </motion.form>
      ) : (
        <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-800">You've already reviewed this property</p>
            <p className="text-xs text-emerald-600">Your feedback helps others make informed decisions</p>
          </div>
        </div>
      )}

      {/* ─── Reviews List ────────────────────────────────────────────── */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to share your experience</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <AnimatePresence>
            {reviews.map((review) => (
              <ReviewItem
                key={review._id}
                review={review}
                isOwn={review.user?._id === user?.id}
                onDelete={() => handleDelete(review._id)}
                userRole={user?.role}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ─── Trust Badge ───────────────────────────────────────────────── */}
      {numReviews > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            Verified reviews
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {numReviews} total reviews
          </span>
        </div>
      )}
    </div>
  );
}