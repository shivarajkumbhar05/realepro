import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createProperty, getProperty, updateProperty } from '../../api/properties';
import { Upload, X, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import LocationPicker from '../../components/map/LocationPicker';

const TYPES = ['apartment', 'house', 'villa', 'plot', 'commercial', 'office'];
const STATUSES = ['sale', 'rent', 'sold', 'rented'];
const FURNISHED = ['unfurnished', 'semi-furnished', 'fully-furnished'];
const AREA_UNITS = ['sqft', 'sqmt', 'acre', 'bigha'];
const COMMON_AMENITIES = ['Swimming Pool', 'Gym', 'Lift', 'Power Backup', 'Security', 'Garden', 'Parking', 'Club House', 'Play Area', 'CCTV'];

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://realepro.onrender.com';

export default function PropertyForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [docFiles, setDocFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [amenityInput, setAmenityInput] = useState('');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { areaUnit: 'sqft', furnished: 'unfurnished', type: 'apartment', status: 'sale' }
  });

  const watchedLat = watch('lat');
  const watchedLng = watch('lng');
  const latNum = watchedLat !== undefined && watchedLat !== '' ? Number(watchedLat) : undefined;
  const lngNum = watchedLng !== undefined && watchedLng !== '' ? Number(watchedLng) : undefined;

  useEffect(() => {
    if (isEdit) {
      getProperty(id).then(({ data }) => {
        const p = data.data;
        reset({
          title: p.title,
          description: p.description,
          type: p.type,
          status: p.status,
          price: p.price,
          area: p.area,
          areaUnit: p.areaUnit,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          floors: p.floors,
          parking: p.parking,
          furnished: p.furnished,
          address: p.location?.address,
          city: p.location?.city,
          state: p.location?.state,
          pincode: p.location?.pincode,
          lat: p.location?.lat,
          lng: p.location?.lng,
        });
        setAmenities(p.amenities || []);
        setExistingImages(p.images || []);
      });
    }
  }, [id, isEdit]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, v); });
      amenities.forEach(a => fd.append('amenities', a));
      imageFiles.forEach(f => fd.append('images', f));
      docFiles.forEach(f => fd.append('documents', f));

      if (isEdit) {
        await updateProperty(id, fd);
        toast.success('Property updated!');
        navigate(`/properties/${id}`);
      } else {
        const { data: res } = await createProperty(fd);
        toast.success('Property created! Awaiting admin approval.');
        navigate(`/properties/${res.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setLoading(false);
  };

  const addAmenity = (a) => {
    const val = a || amenityInput.trim();
    if (val && !amenities.includes(val)) setAmenities(prev => [...prev, val]);
    setAmenityInput('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Property' : 'Add New Property'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input className="input-field" {...register('title', { required: 'Required' })} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea rows={4} className="input-field resize-none" {...register('description', { required: 'Required' })} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select className="input-field" {...register('type', { required: true })}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select className="input-field" {...register('status', { required: true })}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input type="number" className="input-field" {...register('price', { required: 'Required', min: 0 })} />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
                <input type="number" className="input-field" {...register('area', { required: 'Required' })} />
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select className="input-field" {...register('areaUnit')}>
                  {AREA_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Property Features */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Features</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <input type="number" min="0" className="input-field" {...register('bedrooms')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <input type="number" min="0" className="input-field" {...register('bathrooms')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floors</label>
              <input type="number" min="1" className="input-field" {...register('floors')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Furnished</label>
              <select className="input-field" {...register('furnished')}>
                {FURNISHED.map(f => <option key={f} value={f}>{f.replace('-', ' ')}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="parking" className="w-4 h-4" {...register('parking')} />
              <label htmlFor="parking" className="text-sm font-medium text-gray-700">Parking Available</label>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Location</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input className="input-field" {...register('address', { required: 'Required' })} />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input className="input-field" {...register('city', { required: 'Required' })} />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input className="input-field" {...register('state', { required: 'Required' })} />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input className="input-field" {...register('pincode')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input type="number" step="any" className="input-field" {...register('lat')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input type="number" step="any" className="input-field" {...register('lng')} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pin Exact Location on Map</label>
            <LocationPicker
              lat={latNum}
              lng={lngNum}
              onChange={(la, lo) => {
                setValue('lat', Number(la.toFixed(6)), { shouldDirty: true });
                setValue('lng', Number(lo.toFixed(6)), { shouldDirty: true });
              }}
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {COMMON_AMENITIES.map(a => (
              <button key={a} type="button" onClick={() => addAmenity(a)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${amenities.includes(a) ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 hover:border-primary-400'}`}>
                {a}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input-field text-sm" placeholder="Custom amenity..." value={amenityInput} onChange={e => setAmenityInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAmenity())} />
            <button type="button" onClick={() => addAmenity()} className="btn-secondary text-sm px-3">Add</button>
          </div>
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {amenities.map(a => (
                <span key={a} className="flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs">
                  {a}
                  <button type="button" onClick={() => setAmenities(prev => prev.filter(x => x !== a))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Images */}
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Images (max 10)</h2>
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {existingImages.map(img => (
                <div key={img.filename} className="relative w-20 h-20 rounded-lg overflow-hidden">
                  <img src={`${BASE}${img.path}`} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              <p className="text-xs text-gray-500 w-full">Existing images. New uploads will be added.</p>
            </div>
          )}
          <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Click to upload images</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={e => setImageFiles(Array.from(e.target.files))} />
          </label>
          {imageFiles.length > 0 && <p className="text-xs text-gray-500">{imageFiles.length} file(s) selected</p>}
        </div>

        {/* Documents */}
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Documents (max 5)</h2>
          <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors">
            <Upload className="w-6 h-6 text-gray-400 mb-1" />
            <span className="text-sm text-gray-500">Upload documents (PDF, etc.)</span>
            <input type="file" multiple className="hidden" onChange={e => setDocFiles(Array.from(e.target.files))} />
          </label>
          {docFiles.length > 0 && <p className="text-xs text-gray-500">{docFiles.length} document(s) selected</p>}
        </div>

        <div className="flex gap-3 pb-4">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : isEdit ? 'Update Property' : 'Create Property'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
