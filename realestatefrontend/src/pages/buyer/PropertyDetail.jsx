import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProperty, deleteProperty, approveProperty } from '../../api/properties';
import { MapPin, Bed, Bath, Square, Car, CheckCircle, Edit, Trash2, ArrowLeft, Phone, Mail, Building2, ShoppingBag, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import PhotoGallery from '../../components/property/PhotoGallery';
import ReviewSection from '../../components/property/ReviewSection';
import DocumentVerification from '../../components/property/DocumentVerification';
import BuyModal from '../../components/property/BuyModal';
import WhatsAppButton from '../../components/chat/WhatsAppButton';
import PropertyMap from '../../components/map/PropertyMap';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://realepro.onrender.com';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isAgent } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  useEffect(() => {
    getProperty(id).then(({ data }) => {
      setProperty(data.data);
      setLoading(false);
    }).catch(() => {
      toast.error('Property not found');
      navigate('/properties');
    });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this property?')) return;
    try {
      await deleteProperty(id);
      toast.success('Property deleted');
      navigate('/properties');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleApprove = async () => {
    try {
      await approveProperty(id);
      toast.success('Property approved!');
      setProperty(p => ({ ...p, isApproved: true }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!property) return null;

  const isOwner = property.agent?._id === user?.id || property.agent === user?.id;
  const canEdit = isAdmin || isOwner;
  const canBuy = user?.role === 'buyer' || (user?.role === 'agent' && !isOwner);
  const isUnavailable = property.status === 'sold' || property.status === 'rented';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1 truncate">{property.title}</h1>
        <div className="flex gap-2">
          {!property.isApproved && isAdmin && (
            <button onClick={handleApprove} className="btn-primary text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
          )}
          {canEdit && (
            <>
              <Link to={`/agent/my-listings/${id}/edit`} className="btn-secondary text-sm flex items-center gap-2">
                <Edit className="w-4 h-4" /> Edit
              </Link>
              <button onClick={handleDelete} className="btn-danger text-sm flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Photo Gallery with lightbox + per-photo details */}
      <PhotoGallery propertyId={id} images={property.images} canEdit={canEdit} />

      {property.numReviews > 0 && (
        <div className="flex items-center gap-1.5 -mt-3">
          <Star className="w-4 h-4 fill-gold-400 text-gold-500" />
          <span className="text-sm font-semibold text-gray-900">{property.avgRating}</span>
          <span className="text-xs text-gray-500">({property.numReviews} review{property.numReviews > 1 ? 's' : ''})</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${property.status === 'sale' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                For {property.status}
              </span>
              <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">{property.type}</span>
              {property.isApproved
                ? <span className="badge-approved">Approved</span>
                : <span className="badge-pending">Pending Approval</span>}
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-3xl font-bold text-primary-600 mb-1">₹{property.price?.toLocaleString()}</p>
              {canBuy && (
                <button
                  onClick={() => setBuyModalOpen(true)}
                  disabled={isUnavailable}
                  className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4" /> {isUnavailable ? 'Unavailable' : 'Buy / contact Agent'}
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <MapPin className="w-4 h-4" />
              {property.location?.address}, {property.location?.city}, {property.location?.state}
              {property.location?.pincode && ` - ${property.location.pincode}`}
            </div>
          </div>

          {/* Specs */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Property Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: Square, label: 'Area', value: `${property.area} ${property.areaUnit}` },
                { icon: Bed, label: 'Bedrooms', value: property.bedrooms || 'N/A' },
                { icon: Bath, label: 'Bathrooms', value: property.bathrooms || 'N/A' },
                { icon: Building2, label: 'Floors', value: property.floors || 1 },
                { icon: Car, label: 'Parking', value: property.parking ? 'Yes' : 'No' },
                { icon: CheckCircle, label: 'Furnished', value: property.furnished?.replace('-', ' ') },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-primary-500" />
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                  <p className="font-medium text-gray-900 capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{property.description}</p>
          </div>

          {/* Location map — visible to everyone once admin-approved; owner/admin get a preview beforehand */}
          <PropertyMap property={property} canPreview={canEdit} />

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map(a => (
                  <span key={a} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews & Ratings */}
          <ReviewSection propertyId={id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Agent info */}
          {property.agent && typeof property.agent === 'object' && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Listed By</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                  {property.agent.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{property.agent.name}</p>
                  <p className="text-xs text-gray-500">Agent</p>
                </div>
              </div>
              {property.agent.email && (
                <a href={`mailto:${property.agent.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 mb-2">
                  <Mail className="w-4 h-4" />{property.agent.email}
                </a>
              )}
              {property.agent.phone && (
                <a href={`tel:${property.agent.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 mb-3">
                  <Phone className="w-4 h-4" />{property.agent.phone}
                </a>
              )}
              {!isOwner && (
                <WhatsAppButton
                  phone={property.agent.phone}
                  message={`Hi, I'm interested in "${property.title}" listed on PropEstate. Is it still available?`}
                />
              )}
            </div>
          )}

          {/* AI Document Verification */}
          <DocumentVerification property={property} canVerify={canEdit} />
        </div>
      </div>

      {buyModalOpen && (
        <BuyModal
          property={property}
          onClose={() => setBuyModalOpen(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
