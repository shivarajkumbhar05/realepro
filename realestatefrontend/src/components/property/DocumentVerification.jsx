import { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, ShieldAlert, ShieldQuestion, 
  Sparkles, ChevronDown, ChevronUp, CheckCircle, 
  AlertCircle, Clock, Download, Eye, XCircle,
  Info, Lock, Shield, Award, FileCheck, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import { verifyDocuments } from '../../api/properties';
import { motion, AnimatePresence } from 'framer-motion';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://realepro.onrender.com';

// ─── Status Configuration ─────────────────────────────────────────────
const STATUS_CONFIG = {
  verified: { 
    icon: ShieldCheck, 
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200', 
    label: 'Verified',
    bg: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200'
  },
  flagged: { 
    icon: ShieldAlert, 
    color: 'text-red-600 bg-red-50 border-red-200', 
    label: 'Needs Review',
    bg: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200'
  },
  unverified: { 
    icon: ShieldQuestion, 
    color: 'text-gray-500 bg-gray-100 border-gray-200', 
    label: 'Not Tested',
    bg: 'bg-gray-50',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200'
  },
};

// ─── Constraints Configuration ────────────────────────────────────────
const CONSTRAINTS = {
  maxDocuments: 10,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
  verification: {
    minScore: 70,
    maxRetries: 3,
  }
};

// ─── Document Item Component ──────────────────────────────────────────
function DocumentItem({ doc, index, onToggle, isOpen }) {
  const cfg = STATUS_CONFIG[doc.verificationStatus] || STATUS_CONFIG.unverified;
  const Icon = cfg.icon;
  
  const getStatusIcon = () => {
    if (doc.verificationStatus === 'verified') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (doc.verificationStatus === 'flagged') return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`border ${cfg.borderColor} rounded-xl overflow-hidden bg-white hover:shadow-sm transition-shadow`}
    >
      <div className="flex items-center gap-3 p-3.5 hover:bg-gray-50/50 transition-colors group">
        {/* Document Icon */}
        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
          <FileText className={`w-5 h-5 ${cfg.textColor}`} />
        </div>

        {/* Document Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={`${BASE}${doc.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-900 hover:text-primary-600 hover:underline truncate transition-colors"
            >
              {doc.originalName || doc.filename}
            </a>
            <span className="text-[10px] text-gray-400 uppercase flex-shrink-0 px-2 py-0.5 bg-gray-100 rounded">
              {doc.docType?.replace('_', ' ') || 'Document'}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {/* Status Badge */}
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${cfg.color}`}>
              <Icon className="w-3 h-3" /> {cfg.label}
              {doc.verificationScore !== null && doc.verificationScore !== undefined && (
                <span className={`ml-0.5 font-bold ${getScoreColor(doc.verificationScore)}`}>
                  · {doc.verificationScore}%
                </span>
              )}
            </span>

            {/* File Size */}
            {doc.size && (
              <span className="text-[10px] text-gray-400">
                {(doc.size / 1024).toFixed(0)} KB
              </span>
            )}

            {/* Upload Date */}
            {doc.uploadedAt && (
              <span className="text-[10px] text-gray-400">
                {new Date(doc.uploadedAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric' 
                })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <a
            href={`${BASE}${doc.path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition-colors"
            title="View Document"
          >
            <Eye className="w-4 h-4" />
          </a>
          <a
            href={`${BASE}${doc.path}`}
            download
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </a>
          {doc.verificationNotes?.length > 0 && (
            <button
              onClick={() => onToggle(doc.filename)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600 transition-colors"
              title={isOpen ? 'Hide details' : 'Show details'}
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* ─── Expanded Notes ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && doc.verificationNotes?.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 pt-1 border-t border-gray-100">
              <p className="text-[10px] font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                <Info className="w-3 h-3" /> Verification Notes
              </p>
              <ul className="space-y-1.5">
                {doc.verificationNotes.map((note, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      note.toLowerCase().includes('pass') || note.toLowerCase().includes('clear') 
                        ? 'bg-emerald-400' 
                        : note.toLowerCase().includes('warn') 
                        ? 'bg-amber-400' 
                        : 'bg-red-400'
                    }`} />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────
export default function DocumentVerification({ property, canVerify, onUpdated }) {
  const [documents, setDocuments] = useState(property.documents || []);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [stats, setStats] = useState({ verified: 0, flagged: 0, unverified: 0 });

  // ─── Calculate Statistics ───────────────────────────────────────────
  useEffect(() => {
    const verified = documents.filter(d => d.verificationStatus === 'verified').length;
    const flagged = documents.filter(d => d.verificationStatus === 'flagged').length;
    const unverified = documents.filter(d => !d.verificationStatus || d.verificationStatus === 'unverified').length;
    setStats({ verified, flagged, unverified });
  }, [documents]);

  // ─── Run Verification ────────────────────────────────────────────────
  const runVerification = async () => {
    if (running) return;
    
    // Check if all documents are already verified
    if (stats.verified === documents.length && documents.length > 0) {
      toast.success('All documents are already verified! ✅');
      return;
    }

    // Check retry limit
    const retryCount = documents.filter(d => d.verificationAttempts > 0).length;
    if (retryCount >= CONSTRAINTS.verification.maxRetries) {
      toast.warning(`Maximum retry limit (${CONSTRAINTS.verification.maxRetries}) reached. Please contact support.`);
      return;
    }

    setRunning(true);
    try {
      const { data } = await verifyDocuments(property._id);
      setDocuments(data.data);
      onUpdated?.(data.data);
      
      // Show result summary
      const newStats = data.data.filter(d => d.verificationStatus === 'verified').length;
      if (newStats === data.data.length) {
        toast.success('🎉 All documents verified successfully!');
      } else if (newStats > 0) {
        toast.success(`✅ ${newStats} of ${data.data.length} documents verified.`);
      } else {
        toast.warning('⚠️ Documents need manual review.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Please try again.');
    }
    setRunning(false);
  };

  // ─── Toggle Expand ───────────────────────────────────────────────────
  const toggleExpand = (filename) => {
    setExpanded(expanded === filename ? null : filename);
  };

  if (!documents || documents.length === 0) return null;

  return (
    <div className="card p-5">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-100 rounded-xl text-primary-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Document Verification</h3>
              <p className="text-xs text-gray-400">
                {documents.length} document{documents.length > 1 ? 's' : ''} uploaded
              </p>
            </div>
          </div>
        </div>

        {/* ─── Stats Badges ───────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          {stats.verified > 0 && (
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> {stats.verified} Verified
            </span>
          )}
          {stats.flagged > 0 && (
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-700 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {stats.flagged} Needs Review
            </span>
          )}
          {stats.unverified > 0 && (
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {stats.unverified} Pending
            </span>
          )}
        </div>
      </div>

      {/* ─── Verification Button ──────────────────────────────────────── */}
      {canVerify && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-br from-primary-50 to-indigo-50 rounded-xl border border-primary-100/50">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary-500" />
              AI Document Verification
            </p>
            <p className="text-xs text-gray-500">
              {running ? 'Scanning documents...' : 
               stats.verified === documents.length ? 'All documents verified ✅' : 
               `Verify ${documents.length - stats.verified} document${documents.length - stats.verified > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={runVerification}
            disabled={running || stats.verified === documents.length}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              stats.verified === documents.length
                ? 'bg-emerald-50 text-emerald-700 cursor-default'
                : running
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl'
            }`}
          >
            {running ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Scanning...
              </>
            ) : stats.verified === documents.length ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Verified
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run AI Check
              </>
            )}
          </button>
        </div>
      )}

      {/* ─── Documents List ───────────────────────────────────────────── */}
      <div className="space-y-2">
        {documents.map((doc, index) => (
          <DocumentItem
            key={doc.filename || index}
            doc={doc}
            index={index}
            isOpen={expanded === doc.filename}
            onToggle={toggleExpand}
          />
        ))}
      </div>

      {/* ─── Summary Footer ───────────────────────────────────────────── */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-500" />
            {stats.verified} verified
          </span>
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-red-500" />
            {stats.flagged} flagged
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            {stats.unverified} pending
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <Lock className="w-3 h-3" />
          <span>Secure verification</span>
          <span className="w-px h-3 bg-gray-200"></span>
          <Award className="w-3 h-3" />
          <span>AI-powered</span>
        </div>
      </div>
    </div>
  );
}