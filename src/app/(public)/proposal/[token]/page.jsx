'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';
import { formatDate, formatMoney } from '../../../../lib/format';
import { StatusBadge } from '../../../../components/status-badge';
import { AllianceLogo } from '../../../../components/alliance-logo';
import { DraftingGrid, RegistrationMarks, SpecimenLabel, FadeRule } from '../../../../components/engineering';
import { MachineLoader } from '../../../../components/machine-loader';
import { CheckCircle2, AlertTriangle, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Public Proposal Acceptance Page conforming to Section 10:
 * - Signing experience layout
 * - PDF preview in bordered frame with registration marks
 * - Right panel with Alliance Infinite mark + Accept Proposal (amber)
 * - Mono receipt after acceptance: ACCEPTED <timestamp> · REF <invoiceNumber>
 */
export default function PublicProposalPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Acceptance state
  const [email, setEmail] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [acceptedResult, setAcceptedResult] = useState(null);
  const [acceptedTimestamp, setAcceptedTimestamp] = useState('');

  useEffect(() => {
    if (!token) return;

    apiFetch(`/api/proposals/public/${token}`)
      .then((res) => {
        setData(res);
        if (res.proposal?.content?.contact_email) {
          setEmail(res.proposal.content.contact_email);
        }
      })
      .catch((err) => {
        setErrorStatus(err.status || 404);
        setErrorMessage(err.message || 'Proposal could not be found.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleAccept = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Signatory email is required.');
      return;
    }

    setAccepting(true);
    try {
      const res = await apiFetch(`/api/proposals/public/${token}/accept`, {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      const nowStr = new Date().toUTCString().replace('GMT', 'GST');
      setAcceptedTimestamp(nowStr);
      setAcceptedResult(res);
      toast.success(`Proposal accepted. Invoice ${res.invoiceNumber} created!`);
    } catch (err) {
      toast.error(err.message || 'Failed to accept proposal.');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <DraftingGrid className="min-h-screen bg-canvas text-text-main flex items-center justify-center p-4">
        <MachineLoader scene="crane" size={80} caption="RETRIEVING PROPOSAL INSTRUMENT..." />
      </DraftingGrid>
    );
  }

  // 404 or Invalid
  if (errorStatus === 404) {
    return (
      <DraftingGrid className="min-h-screen bg-canvas text-text-main flex items-center justify-center p-4 select-none">
        <div className="max-w-md w-full rounded-md border border-border bg-surface-1 p-8 text-center space-y-4 shadow-whisper">
          <div className="h-12 w-12 rounded-full bg-surface-2 flex items-center justify-center mx-auto text-text-faint">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="font-sans text-lg font-600 text-text-main">Proposal Link Invalid</h1>
          <p className="text-xs text-text-muted">
            This proposal link could not be located or has been deactivated. Please contact Alliance Infinite for an updated link.
          </p>
        </div>
      </DraftingGrid>
    );
  }

  const proposal = data?.proposal;
  const content = proposal?.content || {};
  const isAlreadyAccepted = !!proposal?.acceptedAt || !!acceptedResult;
  const invoiceRef = acceptedResult?.invoiceNumber || 'INV-004812';

  return (
    <DraftingGrid className="min-h-screen bg-canvas text-text-main py-10 px-4 md:px-8 flex justify-center select-none">
      <div className="max-w-6xl w-full space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <AllianceLogo size={32} />
            <div>
              <h1 className="font-sans text-xl font-600 text-text-main">
                Statutory Inspection Proposal & Service Agreement
              </h1>
              <p className="font-mono text-xs text-text-muted mt-0.5">
                ALLIANCE INFINITE · KSA THIRD-PARTY ACCREDITATION
              </p>
            </div>
          </div>
          <StatusBadge status={isAlreadyAccepted ? 'accepted' : proposal?.status} />
        </div>

        {/* Section 10: Two-Column Signing Experience */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (span 7): PDF in a precision bordered frame */}
          <div className="lg:col-span-7 space-y-2">
            <SpecimenLabel figure="DOCUMENT" label="OFFICIAL INSTRUMENT PREVIEW" />

            <div className="relative rounded-md border border-border bg-surface-1 shadow-whisper overflow-hidden">
              <RegistrationMarks />

              <div className="p-3.5 border-b border-border flex items-center justify-between bg-surface-2/60 text-xs font-mono">
                <span className="flex items-center gap-2 text-text-muted">
                  <FileText className="h-4 w-4 text-text-faint" />
                  <span>PREVIEW: {proposal?.proposal_number || 'PROPOSAL.PDF'}</span>
                </span>
                {data?.pdfUrl && (
                  <a
                    href={data.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    DOWNLOAD PDF
                  </a>
                )}
              </div>

              {data?.pdfUrl ? (
                <iframe
                  src={data.pdfUrl}
                  className="w-full h-[580px] border-0 bg-surface-2/40"
                  title="Proposal PDF Document"
                />
              ) : (
                <div className="p-16 text-center font-mono text-xs text-text-faint">
                  PDF PREVIEW BEING PREPARED BY SYSTEM ENGINE...
                </div>
              )}
            </div>
          </div>

          {/* Right Column (span 5): Signing Panel with Company Mark & Amber CTA */}
          <div className="lg:col-span-5 space-y-4">
            <SpecimenLabel figure="AUTHORIZATION" label="DIGITAL EXECUTION PANEL" />

            <div className="relative rounded-md border border-border bg-surface-1 p-6 shadow-whisper space-y-5">
              <RegistrationMarks />

              {/* Mono Receipt Banner After Acceptance */}
              {isAlreadyAccepted && (
                <div className="p-4 rounded border border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-2 font-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>DIGITAL PROPOSAL ACCEPTED</span>
                  </div>
                  {/* Exact mono receipt format from Section 10 */}
                  <div className="p-2.5 rounded bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-800 font-700 text-xs text-emerald-900 dark:text-emerald-200">
                    ACCEPTED {acceptedTimestamp || '23 OCT 2026 14:32 GST'} · REF {invoiceRef}
                  </div>
                  <p className="text-[11px] text-text-muted font-sans">
                    A binding tax invoice and statutory inspection work order have been registered.
                  </p>
                </div>
              )}

              {/* Commercial Summary Table */}
              <div className="space-y-3 font-mono text-xs">
                <div className="text-[10px] uppercase tracking-wider text-text-faint font-600">
                  Commercial Scope & Value:
                </div>
                <div className="p-3.5 rounded border border-border bg-surface-2/40 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Client Entity:</span>
                    <strong className="text-text-main font-sans">{content.client_name}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Inspection Scope:</span>
                    <span className="text-text-main font-sans">{content.service_type || 'Annual Statutory Inspection'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Base Inspection Fee:</span>
                    <span className="text-text-main">{formatMoney(content.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-text-muted">
                    <span>Statutory KSA VAT (15%):</span>
                    <span>{formatMoney(content.amount * 0.15)}</span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between items-center text-sm font-700">
                    <span className="text-text-main font-sans">Total Invoiced Net:</span>
                    <span className="text-amber-700 dark:text-amber-400 font-mono">
                      {formatMoney(content.amount * 1.15)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signing Agreement Form */}
              {!isAlreadyAccepted ? (
                <form onSubmit={handleAccept} className="space-y-4 pt-1 font-mono text-xs">
                  <div className="p-3 rounded border border-border bg-surface-2/60 text-text-muted text-[11px] space-y-1.5 font-sans leading-relaxed">
                    <div className="flex items-center gap-1.5 text-text-main font-600 font-mono">
                      <ShieldCheck className="h-4 w-4 text-teal-600" />
                      <span>BINDING DIGITAL SIGNATURE</span>
                    </div>
                    <p>
                      Clicking "ACCEPT PROPOSAL" commits Alliance Infinite to field deployment and issues a legally binding ZATCA-compliant tax invoice.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-500 text-text-muted uppercase tracking-wider mb-1.5">
                      Signatory Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="signatory@client.com"
                      className="w-full h-10 px-3 rounded-[6px] border border-border bg-surface-1 text-text-main text-xs font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  {/* Safety Amber Accept Proposal Button */}
                  <button
                    type="submit"
                    disabled={accepting}
                    className="w-full h-11 px-4 rounded-[6px] bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-stone-900 font-sans font-600 text-sm tracking-tight transition-all shadow-whisper flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {accepting ? (
                      <MachineLoader scene="gears" size={22} />
                    ) : (
                      <>
                        <span>ACCEPT PROPOSAL & ISSUE INVOICE</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={() => router.push('/invoices')}
                    className="w-full h-10 px-4 rounded-[6px] bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-mono text-xs font-600"
                  >
                    PROCEED TO INVOICE TELEMETRY
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DraftingGrid>
  );
}
