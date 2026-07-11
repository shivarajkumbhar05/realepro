import { useState, useEffect } from 'react';
import { 
  Building2, X, ChevronLeft, ChevronRight, Tag, Pencil, Check,
  Upload, Camera, Image, Sparkles, Heart, Share2, Download,
  Maximize2, Minimize2, Grid3x3, List, Filter, Plus,
  Trash2, Edit, Save, AlertCircle, CheckCircle, XCircle,
  ZoomIn, ZoomOut, RotateCw, Sun, Moon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { updateImageDetails, deleteImage } from '../../api/properties';
import { motion, AnimatePresence } from 'framer-motion';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://realepro.onrender.com';

// ─── Room Labels ──────────────────────────────────────────────────────
const ROOM_LABELS = {
  exterior: '🏠 Exterior',
  living_room: '🛋️ Living Room',
  bedroom: '🛏️ Bedroom',
  kitchen: '🍳 Kitchen',
  bathroom: '🚿 Bathroom',
  balcony: '🌅 Balcony',
  garden: '🌿 Garden',
  pool: '🏊 Pool',
  garage: '🚗 Garage',
  other: '📁 Other',
};

const ROOM_COLORS = {
  exterior: 'from-blue-500 to-blue-600',
  living_room: 'from-amber-500 to-amber-600',
  bedroom: 'from-purple-500 to-purple-600',
  kitchen: 'from-emerald-500 to-emerald-600',
  bathroom: 'from-cyan-500 to-cyan-600',
  balcony: 'from-rose-500 to-rose-600',
  garden: 'from-green-500 to-green-600',
  pool: 'from-teal-500 to-teal-600',
  garage: 'from-gray-500 to-gray-600',
  other: 'from-indigo-500 to-indigo-600',
};

// ─── Image Counter ────────────────────────────────────────────────────
function ImageCounter({ current, total }) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/60 backdrop-blur-sm rounded-full px-4 py-1.5 text-white text-xs font-medium">
      {current + 1} / {total}
    </div>
  );
}

// ─── Thumbnail Navigation ─────────────────────────────────────────────
function ThumbnailNav({ items, selected, onSelect }) {
  return (
    <div className="relative">
      <div className="flex gap-2 p-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {items.map((img, i) => (
          <motion.button
            key={img.filename || i}
            onClick={() => onSelect(i)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
              i === selected 
                ? 'border-primary-500 ring-2 ring-primary-200 shadow-lg' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img 
              src={`${BASE}${img.path}`} 
              alt="" 
              className="w-full h-full object-cover"
            />
            {i === selected && (
              <div className="absolute inset-0 bg-primary-500/10"></div>
            )}
            {img.isPrimary && (
              <div className="absolute top-1 right-1 bg-yellow-400 rounded-full p-0.5">
                <Star className="w-2.5 h-2.5 fill-white text-white" />
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Edit Modal ──────────────────────────────────────────────────────
function EditModal({ image, onSave, onClose, saving }) {
  const [draft, setDraft] = useState({ 
    caption: image?.caption || '', 
    room: image?.room || 'other' 
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Edit Photo Details</h3>
                <p className="text-primary-100 text-sm">Update caption and room type</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Room Type
            </label>
            <select
              value={draft.room}
              onChange={(e) => setDraft(d => ({ ...d, room: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              {Object.entries(ROOM_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Caption
            </label>
            <textarea
              value={draft.caption}
              onChange={(e) => setDraft(d => ({ ...d, caption: e.target.value }))}
              placeholder="Add a descriptive caption..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
            />
            <p className="text-[10px] text-gray-400 mt-1 text-right">
              {draft.caption.length}/200
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(draft)}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold px-4 py-3 rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────
export default function PhotoGallery({ propertyId, images, canEdit }) {
  const [selected, setSelected] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState(images || []);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    setItems(images || []);
  }, [images]);

  if (!items || items.length === 0) {
    return (
      <div className="card overflow-hidden">
        <div className="aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <Camera className="w-12 h-12 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No Photos Available</p>
          <p className="text-sm text-gray-400 mt-1">This property has no images yet</p>
        </div>
      </div>
    );
  }

  const current = items[selected];

  const handleSaveEdit = async (draft) => {
    setSaving(true);
    try {
      await updateImageDetails(propertyId, current.filename, draft);
      setItems((prev) => prev.map((img, i) => 
        i === selected ? { ...img, ...draft } : img
      ));
      toast.success('✨ Photo details updated successfully!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update photo');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await deleteImage(propertyId, current.filename);
      setItems(prev => prev.filter((_, i) => i !== selected));
      if (selected >= items.length - 1) {
        setSelected(Math.max(0, items.length - 2));
      }
      toast.success('Image deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete image');
    }
  };

  const next = () => setSelected((s) => (s + 1) % items.length);
  const prev = () => setSelected((s) => (s - 1 + items.length) % items.length);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));

  return (
    <div className="card overflow-hidden">
      {/* ─── Main Image ───────────────────────────────────────────────── */}
      <div className="relative aspect-video bg-gray-200 overflow-hidden group">
        <motion.img
          src={`${BASE}${current.path}`}
          alt={current.caption || ''}
          className="w-full h-full object-cover cursor-zoom-in"
          style={{ transform: `scale(${zoomLevel})` }}
          onClick={() => setLightboxOpen(true)}
          transition={{ type: 'spring', stiffness: 300 }}
        />

        {/* ─── Overlay Gradient ───────────────────────────────────────── */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* ─── Image Counter ──────────────────────────────────────────── */}
        <ImageCounter current={selected} total={items.length} />

        {/* ─── Room Badge ────────────────────────────────────────────── */}
        {current.room && current.room !== 'other' && (
          <div className="absolute top-4 left-4 z-10">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gradient-to-r ${ROOM_COLORS[current.room]} text-white shadow-lg`}>
              <Tag className="w-3.5 h-3.5" />
              {ROOM_LABELS[current.room]}
            </span>
          </div>
        )}

        {/* ─── Caption ────────────────────────────────────────────────── */}
        {current.caption && (
          <div className="absolute bottom-16 left-4 right-4 z-10">
            <p className="text-white text-sm bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl inline-block max-w-[80%]">
              {current.caption}
            </p>
          </div>
        )}

        {/* ─── Action Buttons ─────────────────────────────────────────── */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {canEdit && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-xl shadow-lg transition-all hover:scale-110"
                title="Edit details"
              >
                <Edit className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-white/90 backdrop-blur-sm hover:bg-red-50 rounded-xl shadow-lg transition-all hover:scale-110"
                title="Delete image"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </>
          )}
          <button
            onClick={() => window.open(`${BASE}${current.path}`, '_blank')}
            className="p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-xl shadow-lg transition-all hover:scale-110"
            title="View full size"
          >
            <Maximize2 className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* ─── Navigation Arrows ──────────────────────────────────────── */}
        {items.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* ─── Thumbnail Navigation ────────────────────────────────────── */}
      {items.length > 1 && (
        <ThumbnailNav 
          items={items} 
          selected={selected} 
          onSelect={setSelected} 
        />
      )}

      {/* ─── Quick Stats ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Image className="w-3.5 h-3.5" />
            {items.length} photos
          </span>
          {current.isPrimary && (
            <span className="flex items-center gap-1 text-yellow-600">
              <Star className="w-3.5 h-3.5 fill-yellow-400" />
              Primary
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <span className="text-[10px] text-gray-400">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* ─── Edit Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editing && (
          <EditModal
            image={current}
            onSave={handleSaveEdit}
            onClose={() => setEditing(false)}
            saving={saving}
          />
        )}
      </AnimatePresence>

      {/* ─── Lightbox ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button 
              onClick={() => setLightboxOpen(false)} 
              className="absolute top-4 right-4 text-white p-3 rounded-full hover:bg-white/10 transition-all"
            >
              <X className="w-8 h-8" />
            </button>

            {items.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full hover:bg-white/10 transition-all hover:scale-110"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
            )}

            <div className="max-w-5xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <motion.img
                key={selected}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                src={`${BASE}${current.path}`}
                alt={current.caption || ''}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />
              {(current.caption || current.room) && (
                <div className="text-white text-center mt-4 space-y-1">
                  {current.room && current.room !== 'other' && (
                    <p className="text-xs uppercase tracking-wider text-gray-400">
                      {ROOM_LABELS[current.room]}
                    </p>
                  )}
                  {current.caption && (
                    <p className="text-sm font-medium text-white/90">
                      {current.caption}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-500">
                    {selected + 1} of {items.length}
                  </p>
                </div>
              )}
            </div>

            {items.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full hover:bg-white/10 transition-all hover:scale-110"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Add missing imports ──────────────────────────────────────────────
import { Star } from 'lucide-react';