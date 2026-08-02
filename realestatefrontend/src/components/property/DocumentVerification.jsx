// src/components/property/DocumentVerification.jsx
import { useState } from 'react';
import { FileCheck, Upload, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const DocumentVerification = ({ propertyId, className = '' }) => {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Property Title Deed', status: 'pending', required: true },
    { id: 2, name: 'Tax Receipts', status: 'pending', required: true },
    { id: 3, name: 'Building Plan Approval', status: 'pending', required: true },
    { id: 4, name: 'Encumbrance Certificate', status: 'pending', required: false },
    { id: 5, name: 'Property Tax Bill', status: 'pending', required: false },
  ]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = (docId) => {
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === docId 
            ? { ...doc, status: 'verified' } 
            : doc
        )
      );
      setUploading(false);
      toast.success('Document uploaded successfully!');
    }, 2000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <FileCheck className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending Verification';
      default:
        return 'Not Uploaded';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-200 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          <FileCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Document Verification</h3>
          <p className="text-sm text-gray-500">Upload and verify property documents</p>
        </div>
      </div>

      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(doc.status)}
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {doc.name}
                  {doc.required && (
                    <span className="ml-1 text-xs text-red-500">*</span>
                  )}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(doc.status)}`}>
                  {getStatusText(doc.status)}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleFileUpload(doc.id)}
              disabled={uploading || doc.status === 'verified'}
              className="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {doc.status === 'verified' ? 'Verified' : 'Upload'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700">
          <AlertTriangle className="w-3 h-3 inline mr-1" />
          All documents are securely stored and encrypted. Required documents are marked with *.
        </p>
      </div>
    </div>
  );
};

export default DocumentVerification;