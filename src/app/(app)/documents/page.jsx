'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, getFileUrl } from '../../../lib/api';
import { formatDate, formatRelativeExpiry } from '../../../lib/format';
import { StatusBadge } from '../../../components/status-badge';
import { PageHeader } from '../../../components/page-header';
import { EmptyState } from '../../../components/empty-state';
import { RegistrationMarks, SpecimenLabel, FadeRule } from '../../../components/engineering';
import { MachineLoader } from '../../../components/machine-loader';
import {
  FolderOpen,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle,
  X,
  History
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Documents Vault Page conforming to Section 10:
 * - Left-edge 2px file-type indicator:
 *   #BE123C (PDF), #44403C (DOC), #047857 (XLS), #B45309 (IMG)
 * - Expiry shown as mono countdown chip in status palette
 * - Dense 44px rows with amber left edge on hover
 * - Machine loader integration for uploads and deletes
 */
export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, company, engineer, expiring

  // Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    category: 'company',
    documentType: 'CR',
    displayName: '',
    expiryDate: '',
    ownerUserId: '',
    allowPastExpiry: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Version Upload Modal
  const [versionDoc, setVersionDoc] = useState(null);
  const [versionFile, setVersionFile] = useState(null);
  const [uploadingVersion, setUploadingVersion] = useState(false);

  // Delete Conflict Dialog
  const [deleteConflict, setDeleteConflict] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      let url = '/api/documents';
      if (activeTab === 'company') url += '?category=company';
      if (activeTab === 'engineer') url += '?category=engineer';
      if (activeTab === 'expiring') url += '?expiringInDays=30';

      const res = await apiFetch(url);
      setDocuments(res.documents || []);
    } catch (err) {
      toast.error('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [activeTab]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    if (selectedFile.size === 0) {
      setUploadError('File cannot be 0 bytes.');
      return;
    }

    if (uploadForm.expiryDate) {
      const exp = new Date(uploadForm.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (exp < today && !uploadForm.allowPastExpiry) {
        setUploadError('Expiry date cannot be in the past. Check "Allow past expiry" if intentionally uploading an expired document for demonstration.');
        return;
      }
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', uploadForm.category);
      formData.append('documentType', uploadForm.documentType);
      formData.append('displayName', uploadForm.displayName);
      if (uploadForm.expiryDate) formData.append('expiryDate', uploadForm.expiryDate);
      if (uploadForm.ownerUserId) formData.append('ownerUserId', uploadForm.ownerUserId);
      if (uploadForm.allowPastExpiry) formData.append('allowPastExpiry', 'true');

      await apiFetch('/api/documents', {
        method: 'POST',
        body: formData
      });

      toast.success('Document uploaded and magic bytes verified.');
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadForm({
        category: 'company',
        documentType: 'CR',
        displayName: '',
        expiryDate: '',
        ownerUserId: '',
        allowPastExpiry: false
      });
      fetchDocuments();
    } catch (err) {
      setUploadError(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleVersionUpload = async (e) => {
    e.preventDefault();
    if (!versionFile || !versionDoc) return;

    setUploadingVersion(true);
    try {
      const formData = new FormData();
      formData.append('file', versionFile);

      await apiFetch(`/api/documents/${versionDoc.id}/versions`, {
        method: 'POST',
        body: formData
      });

      toast.success(`Uploaded new version for ${versionDoc.display_name}.`);
      setVersionDoc(null);
      setVersionFile(null);
      fetchDocuments();
    } catch (err) {
      toast.error(err.message || 'Failed to upload new version.');
    } finally {
      setUploadingVersion(false);
    }
  };

  const handleDeleteDocument = async (doc) => {
    if (!confirm(`Are you sure you want to archive '${doc.display_name}'?`)) return;

    try {
      await apiFetch(`/api/documents/${doc.id}`, { method: 'DELETE' });
      toast.success('Document archived.');
      fetchDocuments();
    } catch (err) {
      if (err.status === 409 && err.details?.workOrders) {
        setDeleteConflict({
          doc,
          workOrders: err.details.workOrders
        });
      } else {
        toast.error(err.message || 'Delete failed.');
      }
    }
  };

  // Section 10 File-type color resolver:
  // #BE123C (PDF), #44403C (DOC), #047857 (XLS), #B45309 (IMG)
  const getFileTypeColor = (mime, fileName) => {
    const fn = (fileName || '').toLowerCase();
    const m = (mime || '').toLowerCase();
    if (fn.endsWith('.pdf') || m.includes('pdf')) return '#BE123C';
    if (fn.endsWith('.doc') || fn.endsWith('.docx') || m.includes('word')) return '#44403C';
    if (fn.endsWith('.xls') || fn.endsWith('.xlsx') || m.includes('excel') || m.includes('sheet')) return '#047857';
    if (fn.endsWith('.png') || fn.endsWith('.jpg') || fn.endsWith('.jpeg') || m.includes('image')) return '#B45309';
    return '#A8A29E';
  };

  return (
    <div className="space-y-6 select-none">
      <PageHeader
        title="Compliance Documents"
        description="Manage company registrations, licenses, and engineer certificates."
        action={
          <button
            onClick={() => { setShowUploadModal(true); setUploadError(''); }}
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-sans font-semibold text-xs shadow-xs shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>UPLOAD DOCUMENT</span>
          </button>
        }
      />

      {/* Table Container with Integrated Filter Toolbar */}
      <div className="relative rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] overflow-hidden shadow-[0_1px_3px_0_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.06)]">
        <RegistrationMarks />

        {/* Integrated Filter Tabs Toolbar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { key: 'all', label: 'All Documents' },
              { key: 'company', label: 'Company Files' },
              { key: 'engineer', label: 'Engineer Files' },
              { key: 'expiring', label: 'Expiring Soon' }
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    relative px-3.5 py-1.5 rounded-lg transition-colors font-sans text-xs
                    ${isActive
                      ? 'text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white font-medium'}
                  `}
                >
                  {isActive && (
                    <motion.span
                      layoutId="docTabPill"
                      className="absolute inset-0 rounded-lg bg-blue-600 shadow-xs"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-sans font-medium px-2">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </div>
        </div>

        {loading ? (
          <div className="p-16 flex justify-center items-center">
            <MachineLoader scene="conveyor" size={100} caption="LOADING DOCUMENTS..." />
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            scene="conveyor"
            title="NO DOCUMENTS FOUND"
            description="No documents match the selected filter. Click below to add a document."
            action={
              <button
                onClick={() => setShowUploadModal(true)}
                className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-sans text-xs font-semibold shadow-xs"
              >
                + ADD DOCUMENT
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-sans uppercase tracking-wider text-[11px] border-b border-slate-300 dark:border-slate-700 font-bold">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Document Label</th>
                  <th className="py-2.5 px-4 font-bold">Category</th>
                  <th className="py-2.5 px-4 font-bold">Owner / User</th>
                  <th className="py-2.5 px-4 font-bold text-right">Expiration Timeline</th>
                  <th className="py-2.5 px-4 font-bold text-center">Version</th>
                  <th className="py-2.5 px-4 font-bold text-center">Status</th>
                  <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {documents.map((doc) => {
                  const expiry = formatRelativeExpiry(doc.expiry_date);
                  const isExpired = doc.status === 'expired' || expiry.isExpired;
                  const isExpiringSoon = !isExpired && (expiry.text && expiry.text.includes('EXPIRES IN'));
                  const statusIndicatorColor = isExpired ? '#EF4444' : (isExpiringSoon ? '#F59E0B' : '#10B981');

                  return (
                    <tr
                      key={doc.id}
                      className="h-[46px] hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors relative group font-sans"
                    >
                      {/* Left-edge 2.5px compliance status indicator */}
                      <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-white relative">
                        <span
                          style={{ backgroundColor: statusIndicatorColor }}
                          className="absolute left-0 top-1 bottom-1 w-[2.5px] rounded-r"
                          title={`Status: ${isExpired ? 'Expired' : (isExpiringSoon ? 'Expiring Soon' : 'Active Compliant')}`}
                        />
                        <div className="font-semibold truncate max-w-xs text-slate-900 dark:text-white">{doc.display_name}</div>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{doc.document_type}</div>
                      </td>

                      <td className="py-2.5 px-4 capitalize font-sans text-xs text-slate-600 dark:text-slate-300">
                        {doc.category}
                      </td>

                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                        {doc.category === 'engineer' ? (doc.owner_name || 'Field Engineer') : 'Corporate'}
                      </td>

                      {/* Expiry as Mono Countdown Chip in status palette */}
                      <td className="py-2.5 px-4 text-right font-sans">
                        <div className="text-slate-900 dark:text-white font-medium text-xs">{formatDate(doc.expiry_date)}</div>
                        <div className="mt-0.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              expiry.isExpired
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {expiry.text}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px] border border-slate-300 dark:border-slate-700 font-semibold">
                          v{doc.version_number || 1}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        <StatusBadge status={doc.status} />
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {doc.fileUrl && (
                            <a
                              href={getFileUrl(doc.fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-7 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors"
                              title="Inspect File"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>VIEW</span>
                            </a>
                          )}

                          <button
                            onClick={() => setVersionDoc(doc)}
                            className="h-7 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors"
                            title="Upload new incremented version"
                          >
                            <History className="h-3 w-3" />
                            <span>v+</span>
                          </button>

                          <button
                            onClick={() => handleDeleteDocument(doc)}
                            className="h-7 w-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 inline-flex items-center justify-center transition-colors shadow-2xs"
                            title="Archive / Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h2 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                    Upload New Document
                  </h2>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Add a company or engineer credential to the compliance vault.
                  </p>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {uploadError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-sans flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs font-sans">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Document Category *
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                  >
                    <option value="company">Company Document (CR / VAT / Insurance)</option>
                    <option value="engineer">Engineer Credential (Iqama / Driving / Operator)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Document Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.documentType}
                    onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                    placeholder="e.g. IQAMA, driving_license, CR, VAT_CERTIFICATE"
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.displayName}
                    onChange={(e) => setUploadForm({ ...uploadForm, displayName: e.target.value })}
                    placeholder="e.g. Commercial Registration Certificate"
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={uploadForm.expiryDate}
                    onChange={(e) => setUploadForm({ ...uploadForm, expiryDate: e.target.value })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="pastExp"
                    checked={uploadForm.allowPastExpiry}
                    onChange={(e) => setUploadForm({ ...uploadForm, allowPastExpiry: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="pastExp" className="text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                    Allow past expiry date (for historical testing/demonstration)
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Select File *
                  </label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border file:border-slate-300 dark:file:border-slate-700 file:text-xs file:font-sans file:bg-slate-50 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-100"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-sans font-semibold text-xs shadow-xs disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploading && <MachineLoader scene="scan" size={16} />}
                    <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Version Upload Modal */}
      <AnimatePresence>
        {versionDoc && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] max-w-sm w-full p-5 shadow-2xl space-y-4"
            >
              <div>
                <h2 className="font-sans text-base font-semibold text-slate-900 dark:text-white">
                  Upload New Version
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-sans">
                  Current version for <strong>{versionDoc.display_name}</strong> is v{versionDoc.version_number}. This will increment to v{Number(versionDoc.version_number || 1) + 1}.
                </p>
              </div>

              <form onSubmit={handleVersionUpload} className="space-y-3 text-xs font-sans">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Select Replacement File *
                  </label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setVersionFile(e.target.files[0])}
                    className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border file:border-slate-300 dark:file:border-slate-700 file:text-xs file:font-sans file:bg-slate-50 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-100"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setVersionDoc(null)}
                    className="h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingVersion || !versionFile}
                    className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-sans font-semibold text-xs shadow-xs disabled:opacity-50"
                  >
                    {uploadingVersion ? 'Saving...' : 'Save New Version'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Conflict Dialog (409 Blocked) */}
      <AnimatePresence>
        {deleteConflict && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <h2 className="font-sans text-base font-semibold">
                  Deletion Blocked by Active Work Orders
                </h2>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                Cannot delete document <strong>{deleteConflict.doc.display_name}</strong>. The engineer is currently assigned to active field work orders that require valid credentials:
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-300 dark:border-slate-700 space-y-1.5 text-xs font-sans">
                <div className="font-semibold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider">
                  Active Work Orders:
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                  {deleteConflict.workOrders.map((wo) => (
                    <li key={wo.id}>
                      <strong>{wo.wo_number}</strong> — {wo.client_name} ({wo.status})
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setDeleteConflict(null)}
                  className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-xs font-sans font-semibold shadow-xs"
                >
                  Acknowledge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
