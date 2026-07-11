import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyPurchases, getReceivedPurchases, updatePurchaseStatus } from '../api/purchases';
import { ShoppingBag, Inbox, Check, X, Ban, MapPin, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://realepro.onrender.com';

const STATUS_STYLE = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

function PurchaseCard({ p, mode, onAction }) {
  const img = p.property?.images?.[0] ? `${BASE}${p.property.images[0].path}` : null;
  const otherParty = mode === 'sent' ? p.agent : p.buyer;

  return (
    <div className="card p-4 flex flex-col sm:flex-row gap-4">
      <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : (
          <div className="w-full h-full flex items-center justify-center"><Building2 className="w-8 h-8 text-gray-300" /></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <Link to={`/properties/${p.property?._id}`} className="font-semibold text-gray-900 hover:text-primary-600 truncate">
            {p.property?.title || 'Property'}
          </Link>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLE[p.status]}`}>{p.status}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
          <MapPin className="w-3 h-3" />{p.property?.location?.city}
        </div>
        <p className="text-sm mt-2">
          <span className="text-gray-500">Offer: </span>
          <span className="font-bold text-primary-600">₹{p.offerPrice?.toLocaleString('en-IN')}</span>
          <span className="text-gray-400"> · listed ₹{p.property?.price?.toLocaleString('en-IN')}</span>
        </p>
        {p.message && <p className="text-xs text-gray-500 mt-1 line-clamp-2">"{p.message}"</p>}
        <p className="text-xs text-gray-400 mt-2">
          {mode === 'sent' ? 'To' : 'From'}: {otherParty?.name} {otherParty?.phone && `· ${otherParty.phone}`}
        </p>

        {mode === 'received' && p.status === 'pending' && (
          <div className="flex gap-2 mt-3">
            <button onClick={() => onAction(p._id, 'accepted')} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Accept
            </button>
            <button onClick={() => onAction(p._id, 'rejected')} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Decline
            </button>
          </div>
        )}
        {mode === 'sent' && p.status === 'pending' && (
          <button onClick={() => onAction(p._id, 'cancelled')} className="text-xs text-gray-500 hover:text-red-600 mt-3 flex items-center gap-1">
            <Ban className="w-3.5 h-3.5" /> Cancel request
          </button>
        )}
      </div>
    </div>
  );
}

export default function Purchases() {
  const { user } = useAuth();
  const canReceive = user?.role === 'agent' || user?.role === 'admin';
  const [tab, setTab] = useState('sent');
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [sentRes, receivedRes] = await Promise.all([
        getMyPurchases(),
        canReceive ? getReceivedPurchases() : Promise.resolve({ data: { data: [] } }),
      ]);
      setSent(sentRes.data.data || []);
      setReceived(receivedRes.data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id, status) => {
    try {
      await updatePurchaseStatus(id, status);
      toast.success(`Request ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update request');
    }
  };

  const list = tab === 'sent' ? sent : received;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Purchases</h1>
        <p className="text-sm text-gray-500 mt-1">Track offers you've sent, and manage offers on your listings.</p>
      </div>

      {canReceive && (
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setTab('sent')}
            className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-1.5 ${tab === 'sent' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <ShoppingBag className="w-4 h-4" /> Sent ({sent.length})
          </button>
          <button
            onClick={() => setTab('received')}
            className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-1.5 ${tab === 'received' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Inbox className="w-4 h-4" /> Received ({received.length})
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
      ) : list.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          No {tab === 'sent' ? 'offers sent yet' : 'offers received yet'}.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((p) => (
            <PurchaseCard key={p._id} p={p} mode={tab} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
}
