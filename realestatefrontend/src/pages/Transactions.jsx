import { useEffect, useState } from 'react';
import { Check, CircleDollarSign, FileCheck2, FileSignature, Home, Loader2, ShieldAlert, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTransactions, updateTransactionStatus } from '../api/transactions';

const statusLabels = {
  offer_accepted: 'Offer accepted',
  documents_pending: 'Documents pending',
  contract_pending: 'Contract pending',
  payment_pending: 'Payment or escrow pending',
  inspection_pending: 'Inspection pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
};

const nextStatus = {
  offer_accepted: 'documents_pending',
  documents_pending: 'contract_pending',
  contract_pending: 'payment_pending',
  payment_pending: 'inspection_pending',
  inspection_pending: 'completed',
};

const milestoneIcons = {
  documents: FileCheck2,
  contract: FileSignature,
  payment: CircleDollarSign,
  inspection: Wrench,
  settlement: Home,
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const loadTransactions = async () => {
    try {
      const { data } = await getTransactions();
      setTransactions(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTransactions(); }, []);

  const advance = async (transaction) => {
    const status = nextStatus[transaction.status];
    if (!status) return;
    setUpdating(transaction._id);
    try {
      await updateTransactionStatus(transaction._id, status);
      toast.success('Transaction milestone updated.');
      await loadTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update transaction.');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Transaction workspace</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">Move every deal forward</h1>
        <p className="text-gray-500 mt-2">Offers, documents, agreements, payment, inspection, and settlement in one timeline.</p>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <ShieldAlert className="w-10 h-10 mx-auto text-gray-300" />
          <h2 className="font-semibold text-gray-900 mt-3">No active transactions</h2>
          <p className="text-sm text-gray-500 mt-1">An accepted offer will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {transactions.map((transaction) => {
            const next = nextStatus[transaction.status];
            return (
              <section key={transaction._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{transaction.property?.title || 'Property transaction'}</h2>
                    <p className="text-sm text-gray-500 mt-1">Agreed price: <strong className="text-gray-800">₹{transaction.agreedPrice?.toLocaleString('en-IN')}</strong></p>
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">{statusLabels[transaction.status] || transaction.status}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
                  {(transaction.milestones || []).map((milestone) => {
                    const Icon = milestoneIcons[milestone.key] || Check;
                    return <div key={milestone.key} className={`rounded-xl border p-3 ${milestone.status === 'complete' ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
                      <Icon className={`w-5 h-5 ${milestone.status === 'complete' ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <p className="text-xs font-medium text-gray-700 mt-2">{milestone.label}</p>
                      <p className="text-[11px] text-gray-500 mt-1">{milestone.status === 'complete' ? 'Complete' : 'Pending'}</p>
                    </div>;
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Buyer: {transaction.buyer?.name || 'Unknown'} · Agent: {transaction.agent?.name || 'Unknown'}</p>
                  {next && <button disabled={updating === transaction._id} onClick={() => advance(transaction)} className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-60">
                    {updating === transaction._id ? 'Updating...' : `Mark ${statusLabels[next].toLowerCase()}`}
                  </button>}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
