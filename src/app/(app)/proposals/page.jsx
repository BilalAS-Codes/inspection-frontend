'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch, getFileUrl } from '../../../lib/api';
import { formatDate, formatMoney } from '../../../lib/format';
import { StatusBadge } from '../../../components/status-badge';
import { EmptyState } from '../../../components/empty-state';
import { MachineLoader } from '../../../components/machine-loader';
import { RegistrationMarks } from '../../../components/engineering/registration-marks';
import { SpecimenLabel } from '../../../components/engineering/specimen-label';
import { FadeRule } from '../../../components/engineering/fade-rule';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Send,
  Copy,
  Check,
  ExternalLink,
  Eye,
  Plus,
  X,
  AlertCircle,
  RefreshCw,
  PenTool,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Link Dialog (Store-and-show-once UX)
  const [clientLinkModal, setClientLinkModal] = useState(null);
  const [copied, setCopied] = useState(false);

  // View Sheet
  const [viewProposal, setViewProposal] = useState(null);

  // Manual Sign Modal
  const [signTargetProposal, setSignTargetProposal] = useState(null);
  const [signingSubmitting, setSigningSubmitting] = useState(false);
  const [signForm, setSignForm] = useState({
    signatoryName: '',
    signatoryEmail: '',
    poNumber: '',
    signingMethod: 'wet_signature',
    notes: ''
  });

  // Available Leads & Corporate Clients for quick selection
  const [availableLeads, setAvailableLeads] = useState([]);
  const [availableClients, setAvailableClients] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState('');

  // Filter to show ONLY active leads that are not converted or lost
  const activeUnconvertedLeads = availableLeads.filter(
    (lead) => lead.status !== 'converted' && lead.status !== 'lost'
  );

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    leadId: '',
    clientId: '',
    type: 'commercial',
    client_name: '',
    scope: 'Statutory dynamic load testing and compliance inspection',
    amount: '4500.00',
    currency: 'SAR',
    validity_days: '30'
  });
  const [createError, setCreateError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sendingId, setSendingId] = useState(null);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const [pRes, lRes, cRes] = await Promise.allSettled([
        apiFetch('/api/proposals'),
        apiFetch('/api/leads'),
        apiFetch('/api/clients')
      ]);
      if (pRes.status === 'fulfilled') {
        setProposals(pRes.value.proposals || []);
      }
      if (lRes.status === 'fulfilled') {
        setAvailableLeads(lRes.value.leads || []);
      }
      if (cRes.status === 'fulfilled') {
        setAvailableClients(cRes.value.clients || []);
      }
    } catch (err) {
      toast.error('Failed to load proposals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleSelectEntity = (value) => {
    setSelectedEntity(value);
    if (!value) {
      setCreateForm(prev => ({ ...prev, leadId: '', clientId: '' }));
      return;
    }

    if (value.startsWith('client:')) {
      const clientId = value.replace('client:', '');
      const client = availableClients.find(c => c.id === clientId);
      if (client) {
        setCreateForm(prev => ({
          ...prev,
          leadId: '',
          clientId: client.id,
          client_name: client.name || '',
          scope: client.notes ? `Periodic compliance inspection for ${client.name} — ${client.notes}` : prev.scope
        }));
      }
    } else if (value.startsWith('lead:')) {
      const leadId = value.replace('lead:', '');
      const lead = availableLeads.find(l => l.id === leadId);
      if (lead) {
        setCreateForm(prev => ({
          ...prev,
          leadId: lead.id,
          clientId: '',
          client_name: lead.company_name || lead.contact_name || '',
          scope: lead.notes || prev.scope
        }));
      }
    }
  };

  const handleSend = async (id, clientName) => {
    setSendingId(id);
    try {
      const res = await apiFetch(`/api/proposals/${id}/send`, { method: 'POST' });
      toast.success(`Proposal sent for ${clientName}`);
      setClientLinkModal({
        clientLink: res.clientLink,
        expiresAt: res.expiresAt,
        clientName
      });
      fetchProposals();
    } catch (err) {
      toast.error(err.message || 'Failed to send proposal.');
    } finally {
      setSendingId(null);
    }
  };

  const handleCopyLink = () => {
    if (!clientLinkModal) return;
    navigator.clipboard.writeText(clientLinkModal.clientLink);
    setCopied(true);
    toast.success('Public proposal link copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const openSignModal = (p) => {
    const content = p.content_jsonb || {};
    setSignTargetProposal(p);
    setSignForm({
      signatoryName: content.client_name || p.client_name || '',
      signatoryEmail: content.contact_email || 'client@signatory.sa',
      poNumber: '',
      signingMethod: 'wet_signature',
      notes: ''
    });
  };

  const handleManualSign = async (e) => {
    e.preventDefault();
    if (!signTargetProposal) return;
    setSigningSubmitting(true);
    try {
      const res = await apiFetch(`/api/proposals/${signTargetProposal.id}/manual-sign`, {
        method: 'POST',
        body: JSON.stringify(signForm)
      });
      toast.success(res.message || `Proposal signed! Tax invoice ${res.invoiceNumber} created.`);
      setSignTargetProposal(null);
      if (viewProposal?.id === signTargetProposal.id) {
        setViewProposal(null);
      }
      fetchProposals();
    } catch (err) {
      toast.error(err.message || 'Failed to record manual signature.');
    } finally {
      setSigningSubmitting(false);
    }
  };

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setCreateError('');

    try {
      await apiFetch('/api/proposals', {
        method: 'POST',
        body: JSON.stringify({
          leadId: createForm.leadId || undefined,
          type: createForm.type,
          variables: {
            client_name: createForm.client_name,
            scope: createForm.scope,
            amount: Number(createForm.amount),
            currency: createForm.currency,
            validity_days: Number(createForm.validity_days)
          }
        })
      });

      toast.success('Proposal draft created.');
      setShowCreateModal(false);
      setSelectedEntity('');
      setCreateForm({
        leadId: '',
        clientId: '',
        type: 'commercial',
        client_name: '',
        scope: 'Statutory dynamic load testing and compliance inspection',
        amount: '4500.00',
        currency: 'SAR',
        validity_days: '30'
      });
      fetchProposals();
    } catch (err) {
      setCreateError(err.message || 'Failed to create proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 select-none">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Proposals & Contracts
            </h1>
          </div>
          <p className="font-sans text-sm text-slate-500 dark:text-slate-400 font-normal tracking-normal mt-1">
            Generate branded PDF proposals, issue tamper-evident digital acceptance links, and trigger automated invoicing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProposals}
            disabled={loading}
            className="h-9 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            {loading ? <MachineLoader scene="crane" size={16} /> : <RefreshCw className="h-3.5 w-3.5" />}
            <span>SYNC PROPOSALS</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-sans text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>NEW PROPOSAL</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="relative rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] overflow-hidden shadow-[0_1px_3px_0_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.06)]">
        <RegistrationMarks />

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <MachineLoader scene="conveyor" size={100} caption="LOADING PROPOSAL LEDGER…" />
          </div>
        ) : proposals.length === 0 ? (
          <div className="p-8">
            <EmptyState
              scene="crane"
              title="NO PROPOSALS REGISTERED"
              description="Create a proposal draft or convert an incoming lead into an inspection agreement."
              action={
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-sans text-xs font-semibold shadow-xs"
                >
                  CREATE PROPOSAL
                </button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-sans text-[11px] uppercase tracking-wider font-bold select-none">
                  <th className="py-2.5 px-4 font-bold">Proposal Ref</th>
                  <th className="py-2.5 px-4 font-bold">Client Entity</th>
                  <th className="py-2.5 px-4 font-bold">Agreement Type</th>
                  <th className="py-2.5 px-4 font-bold text-right">Fee (SAR)</th>
                  <th className="py-2.5 px-4 font-bold">Status</th>
                  <th className="py-2.5 px-4 font-bold text-right">Created</th>
                  <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {proposals.map((p) => {
                  const content = p.content_jsonb || {};
                  const isSending = sendingId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className="group relative h-[46px] hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-2.5 px-4 relative">
                        {/* Hover edge */}
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500 dark:bg-indigo-400 scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-100" />
                        <span className="font-mono font-semibold text-[13px] text-slate-900 dark:text-white">
                          PROP-{p.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {content.client_name || p.client_name || 'Client'}
                      </td>

                      <td className="py-2.5 px-4 capitalize font-sans text-xs text-slate-600 dark:text-slate-300">
                        {p.type}
                      </td>

                      <td className="py-2.5 px-4 font-mono font-semibold text-[13px] text-slate-900 dark:text-white text-right">
                        {formatMoney(content.amount || 0)}
                      </td>

                      <td className="py-2.5 px-4">
                        <StatusBadge status={p.status} />
                      </td>

                      <td className="py-2.5 px-4 font-sans text-xs text-slate-500 dark:text-slate-400 text-right font-medium">
                        {formatDate(p.created_at)}
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewProposal(p)}
                            className="h-7 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors"
                            title="Preview Content"
                          >
                            <Eye className="h-3 w-3" />
                            <span>DETAILS</span>
                          </button>

                          {p.pdfUrl && (
                            <a
                              href={getFileUrl(p.pdfUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-7 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors"
                              title="View Generated PDF"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>PDF</span>
                            </a>
                          )}

                          {p.status === 'draft' && (
                            <button
                              onClick={() => handleSend(p.id, content.client_name)}
                              disabled={isSending}
                              className="h-7 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-[11px] font-sans font-semibold inline-flex items-center gap-1 transition-colors shadow-xs disabled:opacity-50"
                            >
                              {isSending ? (
                                <>
                                  <MachineLoader scene="crane" size={14} />
                                  <span>GENERATING…</span>
                                </>
                              ) : (
                                <>
                                  <Send className="h-3 w-3" />
                                  <span>DISPATCH</span>
                                </>
                              )}
                            </button>
                          )}

                          {(p.status === 'draft' || p.status === 'sent') && (
                            <button
                              onClick={() => openSignModal(p)}
                              className="h-7 px-2.5 rounded-lg border border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-sans font-semibold inline-flex items-center gap-1 transition-all shadow-2xs"
                              title="Record client signature and generate tax invoice"
                            >
                              <PenTool className="h-3 w-3" />
                              <span>SIGN & INVOICE</span>
                            </button>
                          )}

                          {p.status === 'accepted' && (
                            <span className="font-sans text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Signed</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Strip */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
              <div>
                {proposals.length > 0 ? (
                  <span>01–{String(proposals.length).padStart(2, '0')} OF {String(proposals.length).padStart(2, '0')}</span>
                ) : (
                  <span>00 OF 00</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled
                  className="px-2.5 py-1 border border-slate-300 dark:border-slate-700 rounded-md opacity-40 cursor-not-allowed uppercase text-[11px]"
                >
                  PREV
                </button>
                <button
                  disabled
                  className="px-2.5 py-1 border border-slate-300 dark:border-slate-700 rounded-md opacity-40 cursor-not-allowed uppercase text-[11px]"
                >
                  NEXT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Store-and-show-once UX Modal for Client Link */}
      <AnimatePresence>
        {clientLinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setClientLinkModal(null)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative z-10 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <RegistrationMarks />

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <SpecimenLabel figure="LINK DISPATCH" label="TAMPER-EVIDENT CLIENT ACCESS" />
                  <h2 className="font-sans text-base font-semibold text-slate-900 dark:text-white">
                    Proposal Dispatched Successfully
                  </h2>
                </div>
                <button
                  onClick={() => setClientLinkModal(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                The tamper-evident PDF has been generated. Share this secure, single-use public link with{' '}
                <strong className="text-slate-900 dark:text-white">{clientLinkModal.clientName}</strong> for digital acceptance:
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg space-y-2">
                <div className="text-[11px] font-mono text-slate-900 dark:text-white break-all select-all bg-white dark:bg-slate-800 p-2 border border-slate-300 dark:border-slate-700 rounded-md">
                  {clientLinkModal.clientLink}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-sans">
                  <span className="font-medium">EXPIRES IN 7 DAYS</span>
                  <button
                    onClick={handleCopyLink}
                    className="h-8 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-sans font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'COPIED' : 'COPY PUBLIC LINK'}</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                TIP: Open in an incognito window to simulate client digital acceptance and watch the invoice be created automatically.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal for Proposal Details */}
      <AnimatePresence>
        {viewProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewProposal(null)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative z-10 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <RegistrationMarks />

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <SpecimenLabel figure="SPECIMEN" label="PROPOSAL AUDIT" />
                  <h2 className="font-sans text-base font-semibold text-slate-900 dark:text-white">
                    Proposal <span className="font-mono">PROP-{viewProposal.id.slice(0, 8).toUpperCase()}</span>
                  </h2>
                </div>
                <button onClick={() => setViewProposal(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">Status</span>
                  <StatusBadge status={viewProposal.status} />
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">Agreement Type</span>
                  <span className="capitalize font-medium text-slate-900 dark:text-white">{viewProposal.type}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">Client Entity</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{viewProposal.content_jsonb?.client_name || viewProposal.client_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">Contract Fee</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatMoney(viewProposal.content_jsonb?.amount)} SAR</span>
                </div>
                {viewProposal.accepted_at && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 font-sans text-xs">
                    Accepted by <strong>{viewProposal.accepted_by_email}</strong> on {formatDate(viewProposal.accepted_at)}
                  </div>
                )}
                <div>
                  <span className="text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px] block mb-1">Scope of Work:</span>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-sans">
                    {viewProposal.content_jsonb?.scope}
                  </div>
                </div>

                {/* Quick sign trigger if pending client acceptance */}
                {(viewProposal.status === 'draft' || viewProposal.status === 'sent') && (
                  <div className="p-3 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-sans font-semibold text-xs text-blue-900 dark:text-blue-100">
                        Client signed offline or issued a PO?
                      </div>
                      <div className="text-[11px] text-blue-700 dark:text-blue-300 font-sans mt-0.5">
                        Record signature to officially transition status and create the Tax Invoice.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openSignModal(viewProposal)}
                      className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-sans text-xs font-semibold shrink-0 shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <PenTool className="h-3 w-3" />
                      <span>SIGN & INVOICE</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setViewProposal(null)}
                  className="h-9 px-4 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Contract Signing Modal */}
      <AnimatePresence>
        {signTargetProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !signingSubmitting && setSignTargetProposal(null)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative z-10 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <RegistrationMarks />

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <SpecimenLabel figure="CONTRACT EXECUTION" label="OFFLINE / PO ACCEPTANCE" />
                  <h2 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                    Record Signature & Issue Tax Invoice
                  </h2>
                </div>
                <button
                  disabled={signingSubmitting}
                  onClick={() => setSignTargetProposal(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Context Summary */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Proposal Ref</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    PROP-{signTargetProposal.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Client</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {signTargetProposal.content_jsonb?.client_name || signTargetProposal.client_name || 'Client'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Amount</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatMoney(signTargetProposal.content_jsonb?.amount || 0)} SAR
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                Recording contract signature confirms official client agreement. This transitions the proposal to <strong className="text-emerald-600 dark:text-emerald-400">Accepted</strong>, converts linked leads, and automatically generates the binding, ZATCA-compliant <strong className="text-slate-900 dark:text-white">Tax Invoice</strong>.
              </p>

              <form onSubmit={handleManualSign} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Signatory Name / Representative *
                  </label>
                  <input
                    type="text"
                    required
                    value={signForm.signatoryName}
                    onChange={(e) => setSignForm({ ...signForm, signatoryName: e.target.value })}
                    placeholder="e.g. Eng. Tariq Al-Mansoor"
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Signatory Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={signForm.signatoryEmail}
                      onChange={(e) => setSignForm({ ...signForm, signatoryEmail: e.target.value })}
                      placeholder="signatory@company.sa"
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Signing Method *
                    </label>
                    <select
                      value={signForm.signingMethod}
                      onChange={(e) => setSignForm({ ...signForm, signingMethod: e.target.value })}
                      className="w-full h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                    >
                      <option value="wet_signature">Wet Ink / Signed Scan</option>
                      <option value="purchase_order">Official Purchase Order (PO)</option>
                      <option value="email_approval">Corporate Email Approval</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Client PO / Contract Reference
                  </label>
                  <input
                    type="text"
                    value={signForm.poNumber}
                    onChange={(e) => setSignForm({ ...signForm, poNumber: e.target.value })}
                    placeholder="e.g. PO-2026-9941 (optional)"
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden placeholder:font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Audit Notes / Comments
                  </label>
                  <textarea
                    rows={2}
                    value={signForm.notes}
                    onChange={(e) => setSignForm({ ...signForm, notes: e.target.value })}
                    placeholder="e.g. Signed physical document received via courier / stamped PO attached."
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden leading-relaxed font-sans"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={signingSubmitting}
                    onClick={() => setSignTargetProposal(null)}
                    className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={signingSubmitting}
                    className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-sans text-xs font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center gap-2"
                  >
                    {signingSubmitting ? (
                      <>
                        <MachineLoader scene="gears" size={14} />
                        <span>ISSUING INVOICE…</span>
                      </>
                    ) : (
                      <>
                        <PenTool className="h-3.5 w-3.5" />
                        <span>CONFIRM SIGNATURE & INVOICE</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Proposal Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative z-10 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <RegistrationMarks />

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <SpecimenLabel figure="NEW DRAFT" label="CONTRACT GENERATION" />
                  <h2 className="font-sans text-lg font-semibold text-slate-900 dark:text-white">Create Proposal Draft</h2>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {createError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateProposal} className="space-y-3.5">
                {/* Corporate Client or Active Lead Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Select Client or Active Lead
                  </label>
                  <select
                    value={selectedEntity}
                    onChange={(e) => handleSelectEntity(e.target.value)}
                    className="w-full h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                  >
                    <option value="">-- Choose Corporate Client or Active Lead (or enter manually) --</option>
                    
                    {availableClients.length > 0 && (
                      <optgroup label="🏢 Corporate Clients">
                        {availableClients.map((client) => (
                          <option key={`client-${client.id}`} value={`client:${client.id}`}>
                            {client.name} {client.industry ? `(${client.industry})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {activeUnconvertedLeads.length > 0 && (
                      <optgroup label="📋 Active Inquiries / Leads (Unconverted)">
                        {activeUnconvertedLeads.map((lead) => (
                          <option key={`lead-${lead.id}`} value={`lead:${lead.id}`}>
                            {lead.company_name || lead.contact_name} — Status: {lead.status}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Only active leads (excluding converted or lost) and registered corporate clients are shown.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Proposal Type *
                  </label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400/20 focus:border-slate-600 dark:focus:border-slate-400 outline-hidden font-sans"
                  >
                    <option value="commercial">Commercial Inspection</option>
                    <option value="technical">Technical Heavy Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Client Entity Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.client_name}
                    onChange={(e) => setCreateForm({ ...createForm, client_name: e.target.value })}
                    placeholder="e.g. Sabic Petrochemicals Co."
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400/20 focus:border-slate-600 dark:focus:border-slate-400 outline-hidden placeholder:text-slate-400 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Amount (SAR) *
                    </label>
                    <input
                      type="number"
                      required
                      value={createForm.amount}
                      onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400/20 focus:border-slate-600 dark:focus:border-slate-400 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Validity (Days) *
                    </label>
                    <input
                      type="number"
                      required
                      value={createForm.validity_days}
                      onChange={(e) => setCreateForm({ ...createForm, validity_days: e.target.value })}
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400/20 focus:border-slate-600 dark:focus:border-slate-400 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Scope of Inspection *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={createForm.scope}
                    onChange={(e) => setCreateForm({ ...createForm, scope: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400/20 focus:border-slate-600 dark:focus:border-slate-400 outline-hidden leading-relaxed font-sans"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-xs font-sans font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <MachineLoader scene="gears" size={14} />
                        <span>CREATING…</span>
                      </>
                    ) : (
                      <span>CREATE PROPOSAL</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
