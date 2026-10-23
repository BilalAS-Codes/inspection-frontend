'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { formatDate, formatMoney } from '../../../lib/format';
import { StatusBadge } from '../../../components/status-badge';
import { EmptyState } from '../../../components/empty-state';
import { MachineLoader } from '../../../components/machine-loader';
import { RegistrationMarks } from '../../../components/engineering/registration-marks';
import { SpecimenLabel } from '../../../components/engineering/specimen-label';
import { FadeRule } from '../../../components/engineering/fade-rule';
import { Receipt, CreditCard, ArrowRight, ArrowUpRight, ShieldCheck, RefreshCw, Plus, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  // New Direct Invoice Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availableClients, setAvailableClients] = useState([]);
  const [availableLeads, setAvailableLeads] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');
  const [invoiceForm, setInvoiceForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    subtotal: '4500.00',
    description: 'Statutory Inspection and Compliance Certification Services',
    clientId: null,
    leadId: null
  });

  const activeUnconvertedLeads = availableLeads.filter(
    (l) => l.status !== 'converted' && l.status !== 'lost'
  );

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/invoices');
      setInvoices(res.invoices || []);
    } catch (err) {
      toast.error('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntities = async () => {
    try {
      const [cRes, lRes] = await Promise.allSettled([
        apiFetch('/api/clients'),
        apiFetch('/api/leads')
      ]);
      if (cRes.status === 'fulfilled') setAvailableClients(cRes.value.clients || []);
      if (lRes.status === 'fulfilled') setAvailableLeads(lRes.value.leads || []);
    } catch {}
  };

  useEffect(() => {
    fetchInvoices();
    fetchEntities();
  }, []);

  const handleSelectEntity = (val) => {
    setSelectedEntity(val);
    if (!val) {
      setInvoiceForm(prev => ({
        ...prev,
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientId: null,
        leadId: null
      }));
      return;
    }

    if (val.startsWith('client:')) {
      const id = val.replace('client:', '');
      const client = availableClients.find(c => c.id === id);
      if (client) {
        setInvoiceForm(prev => ({
          ...prev,
          clientName: client.name || '',
          clientEmail: client.contact_email || '',
          clientPhone: client.contact_phone || '',
          description: client.notes ? `Statutory Inspection Services for ${client.name} — ${client.notes}` : prev.description,
          clientId: client.id,
          leadId: null
        }));
      }
    } else if (val.startsWith('lead:')) {
      const id = val.replace('lead:', '');
      const lead = availableLeads.find(l => l.id === id);
      if (lead) {
        setInvoiceForm(prev => ({
          ...prev,
          clientName: lead.company_name || lead.contact_name || '',
          clientEmail: lead.contact_email || '',
          clientPhone: lead.contact_phone || '',
          description: lead.notes || prev.description,
          leadId: lead.id,
          clientId: null
        }));
      }
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setInvoiceError('');
    setSubmittingInvoice(true);

    try {
      const numSubtotal = parseFloat(invoiceForm.subtotal);
      if (isNaN(numSubtotal) || numSubtotal <= 0) {
        throw new Error('Please enter a valid subtotal amount greater than 0.');
      }
      if (!invoiceForm.clientName.trim()) {
        throw new Error('Client name is required.');
      }

      const res = await apiFetch('/api/invoices', {
        method: 'POST',
        body: JSON.stringify({
          clientName: invoiceForm.clientName.trim(),
          clientEmail: invoiceForm.clientEmail.trim(),
          clientPhone: invoiceForm.clientPhone.trim(),
          subtotal: numSubtotal,
          description: invoiceForm.description,
          clientId: invoiceForm.clientId || undefined,
          leadId: invoiceForm.leadId || undefined
        })
      });

      toast.success(res.message || 'Tax invoice generated successfully.');
      setShowCreateModal(false);
      setSelectedEntity('');
      setInvoiceForm({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        subtotal: '4500.00',
        description: 'Statutory Inspection and Compliance Certification Services',
        clientId: null,
        leadId: null
      });
      fetchInvoices();
    } catch (err) {
      setInvoiceError(err.message || 'Failed to create invoice.');
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const handlePayNow = async (invoiceId) => {
    setPayingId(invoiceId);
    try {
      const res = await apiFetch(`/api/invoices/${invoiceId}/pay`, { method: 'POST' });
      toast.success('Payment session initiated. Redirecting to payment simulation...');
      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      }
    } catch (err) {
      toast.error(err.message || 'Payment initiation failed.');
      setPayingId(null);
    }
  };

  const subtotalNum = parseFloat(invoiceForm.subtotal) || 0;
  const vatNum = subtotalNum * 0.15;
  const totalNum = subtotalNum + vatNum;

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 select-none">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Tax Invoices & Settlement
            </h1>
          </div>
          <p className="font-sans text-sm text-slate-500 dark:text-slate-400 font-normal tracking-normal mt-1">
            Statutory VAT invoices, ZATCA cryptographic hashes, and Mada / HyperPay automated payment routing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>NEW INVOICE</span>
          </button>
          <button
            onClick={fetchInvoices}
            disabled={loading}
            className="h-9 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            {loading ? <MachineLoader scene="gears" size={16} /> : <RefreshCw className="h-3.5 w-3.5" />}
            <span>SYNC INVOICES</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="relative rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] overflow-hidden shadow-[0_1px_3px_0_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.06)]">
        <RegistrationMarks />

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <MachineLoader scene="gears" size={100} caption="LOADING TAX INVOICES…" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8">
            <EmptyState
              scene="gears"
              title="NO INVOICES ISSUED"
              description="Invoices are generated automatically as soon as technical proposals are accepted."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-sans text-[11px] uppercase tracking-wider font-bold select-none">
                  <th className="py-2.5 px-4 font-bold">Invoice Ref</th>
                  <th className="py-2.5 px-4 font-bold">Client / Tax Entity</th>
                  <th className="py-2.5 px-4 font-bold text-right">Subtotal</th>
                  <th className="py-2.5 px-4 font-bold text-right">VAT (15%)</th>
                  <th className="py-2.5 px-4 font-bold text-right">Total (SAR)</th>
                  <th className="py-2.5 px-4 font-bold">Payment Status</th>
                  <th className="py-2.5 px-4 font-bold">ZATCA Hash</th>
                  <th className="py-2.5 px-4 font-bold text-right">Issue Date</th>
                  <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {invoices.map((inv) => {
                  const client = inv.client_jsonb || {};
                  const isPaying = payingId === inv.id;

                  return (
                    <tr
                      key={inv.id}
                      className="group relative h-[46px] hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-2.5 px-4 relative">
                        {/* Hover edge */}
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500 dark:bg-emerald-400 scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-100" />
                        <span className="font-mono font-semibold text-[13px] text-slate-900 dark:text-white">
                          {inv.invoice_number}
                        </span>
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white leading-snug">{client.client_name || 'Client'}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{client.contact_email || '—'}</div>
                      </td>

                      <td className="py-2.5 px-4 font-mono text-[12px] text-slate-600 dark:text-slate-300 text-right">
                        {formatMoney(inv.subtotal)}
                      </td>

                      <td className="py-2.5 px-4 font-mono text-[12px] text-slate-600 dark:text-slate-300 text-right">
                        {formatMoney(inv.vat_amount)}
                      </td>

                      <td className="py-2.5 px-4 font-mono font-bold text-[13px] text-emerald-700 dark:text-emerald-400 text-right">
                        {formatMoney(inv.total)}
                      </td>

                      <td className="py-2.5 px-4">
                        <StatusBadge status={inv.status} />
                      </td>

                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 font-sans text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                          <span className="uppercase text-[11px]">{inv.zatca_status || 'VERIFIED'}</span>
                        </span>
                      </td>

                      <td className="py-2.5 px-4 font-sans text-xs text-slate-500 dark:text-slate-400 text-right font-medium">
                        {formatDate(inv.created_at)}
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.status === 'issued' ? (
                            <button
                              onClick={() => handlePayNow(inv.id)}
                              disabled={isPaying}
                              className="h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-[11px] font-sans font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs shadow-emerald-500/20 disabled:opacity-50"
                            >
                              {isPaying ? (
                                <>
                                  <MachineLoader scene="gears" size={14} />
                                  <span>ROUTING…</span>
                                </>
                              ) : (
                                <>
                                  <CreditCard className="h-3 w-3" />
                                  <span>PAY NOW</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <Link
                              href="/work-orders"
                              className="h-7 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors"
                              title="Go to associated work order"
                            >
                              <span>WORK ORDER</span>
                              <ArrowUpRight className="h-3 w-3 text-blue-500" />
                            </Link>
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
                {invoices.length > 0 ? (
                  <span>01–{String(invoices.length).padStart(2, '0')} OF {String(invoices.length).padStart(2, '0')}</span>
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

      {/* Create Tax Invoice Modal */}
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
              className="relative z-10 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] max-w-lg w-full p-6 shadow-2xl space-y-4 font-sans"
            >
              <RegistrationMarks />

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <SpecimenLabel figure="DIRECT INVOICE" label="TAX SETTLEMENT" />
                  <h2 className="font-sans text-lg font-semibold text-slate-900 dark:text-white">
                    Issue Tax Invoice
                  </h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {invoiceError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{invoiceError}</span>
                </div>
              )}

              <form onSubmit={handleCreateInvoice} className="space-y-3.5">
                {/* Entity Selector */}
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
                    Selecting an unconverted lead will automatically mark it as converted upon invoice issuance.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Client Entity Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceForm.clientName}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, clientName: e.target.value })}
                    placeholder="e.g. Modern Petrochemical Co."
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Billing Email
                    </label>
                    <input
                      type="email"
                      value={invoiceForm.clientEmail}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, clientEmail: e.target.value })}
                      placeholder="finance@company.sa"
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={invoiceForm.clientPhone}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, clientPhone: e.target.value })}
                      placeholder="+966 11 000 0000"
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden placeholder:font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Invoice Scope / Item Description *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={invoiceForm.description}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                    placeholder="e.g. Statutory periodic inspection of 5 overhead cranes and lifting tackle."
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden leading-relaxed font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Subtotal (SAR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={invoiceForm.subtotal}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, subtotal: e.target.value })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                {/* Tax Breakdown Preview Box */}
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Taxable Subtotal</span>
                    <span className="font-mono">{formatMoney(subtotalNum)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>15% Statutory VAT (ZATCA)</span>
                    <span className="font-mono">{formatMoney(vatNum)}</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-1.5 flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>Total Payable</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{formatMoney(totalNum)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={submittingInvoice}
                    onClick={() => setShowCreateModal(false)}
                    className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInvoice}
                    className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-sans text-xs font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center gap-2"
                  >
                    {submittingInvoice ? (
                      <>
                        <MachineLoader scene="gears" size={14} />
                        <span>ISSUING TAX INVOICE…</span>
                      </>
                    ) : (
                      <>
                        <Receipt className="h-3.5 w-3.5" />
                        <span>GENERATE TAX INVOICE</span>
                      </>
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
