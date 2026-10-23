'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../../lib/api';
import { formatDate } from '../../../lib/format';
import { StatusBadge } from '../../../components/status-badge';
import { PageHeader } from '../../../components/page-header';
import { EmptyState } from '../../../components/empty-state';
import { RegistrationMarks, SpecimenLabel, FadeRule } from '../../../components/engineering';
import { MachineLoader } from '../../../components/machine-loader';
import {
  Plus,
  Search,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Client Inquiries / Leads Page conforming to Alliance Infinite design rules:
 * - 44px dense rows with 2px amber hover edge
 * - Mono font for contact coordinates and dates
 * - Machine loader integration for lead conversions
 * - Corner registration marks and specimen labels
 */
export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    clientName: '',
    source: 'manual',
    contactEmail: '',
    contactPhone: '',
    notes: ''
  });
  const [createError, setCreateError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Status transition modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [transitionError, setTransitionError] = useState('');

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (sourceFilter) params.set('source', sourceFilter);
      if (search) params.set('q', search);

      const res = await apiFetch(`/api/leads?${params.toString()}`);
      setLeads(res.leads || []);
    } catch (err) {
      toast.error('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, sourceFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setCreateError(null);

    try {
      const res = await apiFetch('/api/leads', {
        method: 'POST',
        body: JSON.stringify(createForm)
      });
      toast.success(`Lead created for ${res.lead.client_name}`);
      setShowCreateModal(false);
      setCreateForm({ clientName: '', source: 'manual', contactEmail: '', contactPhone: '', notes: '' });
      fetchLeads();
    } catch (err) {
      if (err.status === 409) {
        setCreateError(err.message || 'A duplicate lead already exists with this email/phone.');
      } else {
        setCreateError(err.message || 'Failed to create lead.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvertLead = async (leadId, clientName) => {
    try {
      await apiFetch(`/api/leads/${leadId}/convert`, { method: 'POST' });
      toast.success(`Lead converted. Proposal generated for ${clientName}`);
      router.push('/proposals');
    } catch (err) {
      toast.error(err.message || 'Failed to convert lead.');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedLead || !newStatus) return;
    setTransitionError('');

    try {
      await apiFetch(`/api/leads/${selectedLead.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      toast.success(`Status updated to '${newStatus}'`);
      setSelectedLead(null);
      fetchLeads();
    } catch (err) {
      setTransitionError(err.message || 'Illegal state transition.');
    }
  };

  const ALL_STATUSES = [
    { value: 'new', label: 'NEW' },
    { value: 'contacted', label: 'CONTACTED' },
    { value: 'proposal_sent', label: 'PROPOSAL SENT' },
    { value: 'converted', label: 'CONVERTED' },
    { value: 'lost', label: 'LOST' }
  ];

  return (
    <div className="space-y-6 select-none">
      <PageHeader
        title="Commercial Inquiries & Leads"
        description="Capture, deduplicate, and convert statutory inspection project inquiries."
        action={
          <button
            onClick={() => { setShowCreateModal(true); setCreateError(null); }}
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-xs shadow-blue-500/25 font-sans font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>NEW INQUIRY</span>
          </button>
        }
      />

      {/* Filter and Search Bar: Tier 2 Elevated Card */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#14171B] p-3.5 rounded-xl border border-slate-300 dark:border-slate-800 shadow-[0_1px_3px_0_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.06)]">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client, email, or phone..."
            className="w-full pl-9 pr-3 h-9 text-xs font-sans rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-slate-400 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all"
          />
        </form>

        <div className="flex items-center gap-2 font-sans text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-slate-400 text-slate-900 dark:text-white focus:outline-none transition-all font-medium"
          >
            <option value="">ALL STATUSES</option>
            <option value="new">NEW</option>
            <option value="contacted">CONTACTED</option>
            <option value="proposal_sent">PROPOSAL SENT</option>
            <option value="converted">CONVERTED</option>
            <option value="lost">LOST</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-slate-400 text-slate-900 dark:text-white focus:outline-none transition-all font-medium"
          >
            <option value="">ALL SOURCES</option>
            <option value="whatsapp">WHATSAPP</option>
            <option value="email">EMAIL</option>
            <option value="website">WEBSITE</option>
            <option value="manual">MANUAL</option>
          </select>

          {(search || statusFilter || sourceFilter) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); setSourceFilter(''); }}
              className="h-9 px-3 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 font-medium transition-colors"
            >
              <X className="h-3 w-3" />
              <span>RESET</span>
            </button>
          )}
        </div>
      </div>

      {/* Leads Table Container: Tier 2 Elevated Card with Registration Marks */}
      <div className="relative rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] overflow-hidden shadow-[0_1px_3px_0_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.06)]">
        <RegistrationMarks />

        {loading ? (
          <div className="p-16 flex justify-center items-center">
            <MachineLoader scene="gears" size={100} caption="LOADING CLIENT LEADS..." />
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            scene="conveyor"
            title="NO INQUIRY LEADS LOCATED"
            description="No client inquiry leads match the active filter criteria."
            action={
              <button
                onClick={() => setShowCreateModal(true)}
                className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-sans text-xs font-semibold shadow-xs"
              >
                + RECORD INQUIRY
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-sans uppercase tracking-wider text-[11px] border-b border-slate-300 dark:border-slate-700 font-bold">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Client Name</th>
                  <th className="py-2.5 px-4 font-bold">Source</th>
                  <th className="py-2.5 px-4 font-bold">Contact Coordinates</th>
                  <th className="py-2.5 px-4 text-center font-bold">Status</th>
                  <th className="py-2.5 px-4 font-bold">Sales Representative</th>
                  <th className="py-2.5 px-4 font-bold">Received Date</th>
                  <th className="py-2.5 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="h-[46px] hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors relative group font-sans"
                  >
                    <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-white relative">
                      {/* Subtle Hover Edge Indicator */}
                      <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500 dark:bg-blue-400 scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-100" />
                      <div className="font-semibold text-slate-900 dark:text-white">{lead.client_name}</div>
                      {lead.notes && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate max-w-xs">
                          {lead.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 font-sans uppercase font-medium">
                      {lead.source}
                    </td>

                    <td className="py-2.5 px-4 font-sans text-xs text-slate-600 dark:text-slate-300">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{lead.contact_email || '—'}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{lead.contact_phone || '—'}</div>
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <StatusBadge status={lead.status} />
                    </td>

                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {lead.assigned_to_name || 'Unassigned'}
                    </td>

                    <td className="py-2.5 px-4 font-sans text-slate-500 dark:text-slate-400 font-medium">
                      {formatDate(lead.created_at)}
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {lead.status !== 'converted' && lead.status !== 'lost' && (
                          <button
                            onClick={() => handleConvertLead(lead.id, lead.client_name)}
                            className="h-7 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                            title="Generate proposal and transition to proposal_sent"
                          >
                            <FileText className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                            <span>CONVERT</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setNewStatus(lead.status);
                            setTransitionError('');
                          }}
                          className="h-7 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-[11px] font-medium shadow-2xs transition-colors"
                          title="Transition status"
                        >
                          STATUS
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: New Lead with Dedupe Alert */}
      <AnimatePresence>
        {showCreateModal && (
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
                    Record New Inquiry
                  </h2>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Capture incoming client request and contact details.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {createError && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-sans flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">DUPLICATE ENTRY DETECTED</div>
                    <div>{createError}</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs font-sans">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Client Entity Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.clientName}
                    onChange={(e) => setCreateForm({ ...createForm, clientName: e.target.value })}
                    placeholder="e.g. Aramco Gas Pipeline Division"
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Channel Source *
                    </label>
                    <select
                      value={createForm.source}
                      onChange={(e) => setCreateForm({ ...createForm, source: e.target.value })}
                      className="w-full h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                    >
                      <option value="manual">Manual Entry</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                      <option value="website">Website</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={createForm.contactPhone}
                      onChange={(e) => setCreateForm({ ...createForm, contactPhone: e.target.value })}
                      placeholder="+96650..."
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={createForm.contactEmail}
                    onChange={(e) => setCreateForm({ ...createForm, contactEmail: e.target.value })}
                    placeholder="procurement@client.sa"
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Inspection Scope & Notes
                  </label>
                  <textarea
                    rows={2}
                    value={createForm.notes}
                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                    placeholder="Lifting gear proof test, forklift certification..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-sans font-semibold text-xs shadow-xs disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && <MachineLoader scene="gears" size={16} />}
                    <span>{submitting ? 'Registering...' : 'Register Inquiry'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Status Transition with All Status Options */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] max-w-sm w-full p-5 shadow-2xl space-y-4"
            >
              <div>
                <h2 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                  Update Status for {selectedLead.client_name}
                </h2>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
                  Current status: <strong className="uppercase text-slate-800 dark:text-slate-200">{selectedLead.status?.replace(/_/g, ' ')}</strong>
                </div>
              </div>

              {transitionError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-sans">
                  {transitionError}
                </div>
              )}

              <form onSubmit={handleUpdateStatus} className="space-y-3.5 text-xs font-sans">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Select Target Status:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs uppercase focus:ring-2 focus:ring-blue-500 outline-hidden font-semibold"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedLead(null)}
                    className="h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-sans font-semibold text-xs shadow-xs"
                  >
                    Update Status
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
