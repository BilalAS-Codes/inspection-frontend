'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { formatDate } from '../../../lib/format';
import { StatusBadge } from '../../../components/status-badge';
import { PageHeader } from '../../../components/page-header';
import { EmptyState } from '../../../components/empty-state';
import { RegistrationMarks, SpecimenLabel, FadeRule } from '../../../components/engineering';
import { MachineLoader } from '../../../components/machine-loader';
import {
  Award,
  FileText,
  Copy,
  Check,
  X,
  ExternalLink,
  Ban
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Accredited Certificates Page conforming to Section 10:
 * - 32px inline QR thumbnail per row with 120px hover preview tooltip
 * - Dense 44px rows with 2px amber hover edge
 * - Machine loader integration for revocation confirmations
 * - Specimen labels and corner registration marks
 */
export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // QR Modal
  const [selectedQrCert, setSelectedQrCert] = useState(null);
  const [copied, setCopied] = useState(false);

  // Hover QR Tooltip
  const [hoveredQrId, setHoveredQrId] = useState(null);

  // Revoke Modal
  const [selectedRevokeCert, setSelectedRevokeCert] = useState(null);
  const [revokeReason, setRevokeReason] = useState('Critical safety non-conformance identified post-inspection.');
  const [revoking, setRevoking] = useState(false);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/certificates');
      setCertificates(res.certificates || []);
    } catch (err) {
      toast.error('Failed to load certificates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleCopyVerifyUrl = (jwt) => {
    const url = `${window.location.origin}/verify/${jwt}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Public QR verification URL copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevokeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRevokeCert) return;

    setRevoking(true);
    try {
      await apiFetch(`/api/certificates/${selectedRevokeCert.id}/revoke`, {
        method: 'POST',
        body: JSON.stringify({ reason: revokeReason })
      });

      toast.success(`Certificate ${selectedRevokeCert.certificate_number} revoked.`);
      setSelectedRevokeCert(null);
      fetchCertificates();
    } catch (err) {
      toast.error(err.message || 'Revocation failed.');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      <PageHeader
        title="Accredited Safety Certificates"
        description="Tamper-evident equipment certificates with embedded cryptographic QR codes and live public verification."
      />

      {/* Table Container with Registration Marks */}
      <div className="relative rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] overflow-hidden shadow-[0_1px_3px_0_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.06)]">
        <RegistrationMarks />

        {loading ? (
          <div className="p-16 flex justify-center items-center">
            <MachineLoader scene="scan" size={100} caption="LOADING CERTIFICATE REGISTRY..." />
          </div>
        ) : certificates.length === 0 ? (
          <EmptyState
            scene="certificate"
            title="NO CERTIFICATES ISSUED"
            description="Certificates are generated when an engineer evaluates an asset as SAFE in field inspection."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-sans uppercase tracking-wider text-[11px] border-b border-slate-300 dark:border-slate-700 font-bold">
                <tr>
                  <th className="py-2.5 px-4 text-center w-12 font-bold">QR</th>
                  <th className="py-2.5 px-4 font-bold">Certificate #</th>
                  <th className="py-2.5 px-4 font-bold">Equipment Serial</th>
                  <th className="py-2.5 px-4 font-bold">Accreditation Type</th>
                  <th className="py-2.5 px-4 text-center font-bold">Status</th>
                  <th className="py-2.5 px-4 font-bold">Issued Date</th>
                  <th className="py-2.5 px-4 text-right font-bold">Expiration Timeline</th>
                  <th className="py-2.5 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {certificates.map((cert) => (
                  <tr
                    key={cert.id}
                    className="h-[46px] hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors relative group font-sans"
                  >
                    {/* Inline QR Thumbnail with Hover Preview */}
                    <td className="py-1 px-4 text-center relative">
                      <div
                        onMouseEnter={() => setHoveredQrId(cert.id)}
                        onMouseLeave={() => setHoveredQrId(null)}
                        onClick={() => setSelectedQrCert(cert)}
                        className="w-8 h-8 mx-auto rounded-lg border border-slate-300 dark:border-slate-700 bg-white p-0.5 cursor-pointer shadow-2xs relative flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        <img
                          src={`http://localhost:4000/api/certificates/${cert.id}/qr.png`}
                          alt="QR"
                          className="w-full h-full object-contain"
                        />

                        {/* Hover Zoom Preview Tooltip */}
                        {hoveredQrId === cert.id && (
                          <div className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 z-30 w-[120px] h-[120px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-100">
                            <img
                              src={`http://localhost:4000/api/certificates/${cert.id}/qr.png`}
                              alt="Enlarged QR"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-900 dark:text-white relative">
                      {/* Hover Edge Indicator */}
                      <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-teal-500 dark:bg-teal-400 scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-100" />
                      {cert.certificate_number}
                    </td>

                    <td className="py-2.5 px-4 font-mono text-slate-800 dark:text-slate-200 font-semibold">
                      {cert.equipment_serial}
                    </td>

                    <td className="py-2.5 px-4 capitalize font-sans text-xs text-slate-600 dark:text-slate-300">
                      {(cert.certificate_type || '').replace(/_/g, ' ')}
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <StatusBadge status={cert.status} />
                    </td>

                    <td className="py-2.5 px-4 font-sans text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {formatDate(cert.issued_at)}
                    </td>

                    <td className="py-2.5 px-4 text-right font-sans text-xs text-slate-900 dark:text-white font-medium">
                      {formatDate(cert.expires_at)}
                    </td>

                    <td className="py-2.5 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedQrCert(cert)}
                          className="h-7 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors"
                          title="Open Full QR Verification"
                        >
                          <span>INSPECT</span>
                        </button>

                        <a
                          href={`http://localhost:4000/api/certificates/${cert.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-7 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors"
                          title="Download Official PDF"
                        >
                          <FileText className="h-3 w-3" />
                          <span>PDF</span>
                        </a>

                        {cert.status === 'issued' && (
                          <button
                            onClick={() => setSelectedRevokeCert(cert)}
                            className="h-7 px-3 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-700 dark:text-rose-400 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                            title="Revoke Certificate"
                          >
                            <Ban className="h-3 w-3" />
                            <span>REVOKE</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Modal with Public Verify Link */}
      {selectedQrCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] max-w-sm w-full p-6 shadow-2xl space-y-4 text-center animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 text-left">
              <div>
                <SpecimenLabel figure="REGISTRY" label="CRYPTOGRAPHIC QR VERIFICATION" />
                <div className="font-mono text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{selectedQrCert.certificate_number}</div>
              </div>
              <button onClick={() => setSelectedQrCert(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* QR Image Frame */}
            <div className="flex justify-center p-4 bg-white rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs">
              <img
                src={`http://localhost:4000/api/certificates/${selectedQrCert.id}/qr.png`}
                alt="Certificate QR"
                className="h-44 w-44"
              />
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 text-left font-sans leading-relaxed">
              Scannable by any industrial auditor smartphone to cryptographically verify live certification authenticity against the Alliance Infinite registry.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <button
                onClick={() => handleCopyVerifyUrl(selectedQrCert.qr_payload)}
                className="w-full h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-sans font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY PUBLIC VERIFICATION LINK'}</span>
              </button>
              <a
                href={`/verify/${selectedQrCert.qr_payload}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors font-medium"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>OPEN REGISTRY VERIFICATION PAGE</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Revocation Reason Dialog */}
      {selectedRevokeCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in-0 zoom-in-95 duration-150">
            <div>
              <SpecimenLabel figure="REGULATORY" label="IRREVERSIBLE REVOCATION" />
              <h2 className="font-sans text-base font-semibold text-rose-700 dark:text-rose-400 mt-1">
                Revoke {selectedRevokeCert.certificate_number}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-sans">
                Revoking immediately updates the public QR code registry to indicate "Revoked".
              </p>
            </div>

            <form onSubmit={handleRevokeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Revocation Rationale *
                </label>
                <textarea
                  rows={3}
                  required
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Detail safety defect or structural failure..."
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedRevokeCert(null)}
                  className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={revoking}
                  className="h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-sans font-semibold text-xs shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {revoking && <MachineLoader scene="press" size={16} />}
                  <span>{revoking ? 'COMMITTING...' : 'COMMIT REVOCATION'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
