'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../../lib/api';
import { formatDate } from '../../../lib/format';
import { StatusBadge } from '../../../components/status-badge';
import { EmptyState } from '../../../components/empty-state';
import { MachineLoader } from '../../../components/machine-loader';
import { RegistrationMarks } from '../../../components/engineering/registration-marks';
import { SpecimenLabel } from '../../../components/engineering/specimen-label';
import { FadeRule } from '../../../components/engineering/fade-rule';
import { ArrowRight, UserCheck, ShieldAlert, Award, Filter, RefreshCw, Plus, X, AlertCircle, Calendar, MapPin, Wrench } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Create Work Order Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availableClients, setAvailableClients] = useState([]);
  const [availableLeads, setAvailableLeads] = useState([]);
  const [availableEngineers, setAvailableEngineers] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');
  const [woForm, setWoForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    locationText: '',
    serviceType: 'Regulatory Conformance',
    inspectionCategory: 'lifting',
    scope: 'Statutory Periodic Crane & Lifting Tackle Load Test Inspection',
    assignedEngineerId: '',
    dueDate: '',
    certificateValidityDays: 365
  });

  const activeUnconvertedLeads = availableLeads.filter(
    (l) => l.status !== 'converted' && l.status !== 'lost'
  );

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/api/work-orders?status=${statusFilter}` : '/api/work-orders';
      const res = await apiFetch(url);
      setWorkOrders(res.workOrders || []);
    } catch (err) {
      toast.error('Failed to load work orders.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [cRes, lRes, uRes] = await Promise.allSettled([
        apiFetch('/api/clients'),
        apiFetch('/api/leads'),
        apiFetch('/api/users?role=engineer')
      ]);
      if (cRes.status === 'fulfilled') setAvailableClients(cRes.value.clients || []);
      if (lRes.status === 'fulfilled') setAvailableLeads(lRes.value.leads || []);
      if (uRes.status === 'fulfilled') setAvailableEngineers(uRes.value.users || []);
    } catch {}
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [statusFilter]);

  useEffect(() => {
    fetchDependencies();
  }, []);

  const handleSelectEntity = (val) => {
    setSelectedEntity(val);
    if (!val) {
      setWoForm(prev => ({
        ...prev,
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        locationText: ''
      }));
      return;
    }

    if (val.startsWith('client:')) {
      const id = val.replace('client:', '');
      const client = availableClients.find(c => c.id === id);
      if (client) {
        setWoForm(prev => ({
          ...prev,
          clientName: client.name || '',
          clientEmail: client.contact_email || '',
          clientPhone: client.contact_phone || '',
          locationText: client.address ? `${client.address}, ${client.city || 'Riyadh'}` : (client.city || ''),
          scope: client.notes ? `Periodic inspection for ${client.name} — ${client.notes}` : prev.scope
        }));
      }
    } else if (val.startsWith('lead:')) {
      const id = val.replace('lead:', '');
      const lead = availableLeads.find(l => l.id === id);
      if (lead) {
        setWoForm(prev => ({
          ...prev,
          clientName: lead.company_name || lead.contact_name || '',
          clientEmail: lead.contact_email || '',
          clientPhone: lead.contact_phone || '',
          locationText: '',
          scope: lead.notes || prev.scope
        }));
      }
    }
  };

  const handleCreateWorkOrder = async (e) => {
    e.preventDefault();
    setCreateError('');
    setSubmitting(true);

    try {
      if (!woForm.clientName.trim()) {
        throw new Error('Client name is required.');
      }

      const res = await apiFetch('/api/work-orders', {
        method: 'POST',
        body: JSON.stringify({
          clientName: woForm.clientName.trim(),
          clientEmail: woForm.clientEmail.trim() || undefined,
          clientPhone: woForm.clientPhone.trim() || undefined,
          locationText: woForm.locationText.trim() || undefined,
          serviceType: woForm.serviceType,
          inspectionCategory: woForm.inspectionCategory,
          scope: woForm.scope.trim(),
          assignedEngineerId: woForm.assignedEngineerId || undefined,
          dueDate: woForm.dueDate || undefined,
          certificateValidityDays: Number(woForm.certificateValidityDays) || 365
        })
      });

      toast.success(res.message || 'Work Order registered successfully.');
      setShowCreateModal(false);
      setSelectedEntity('');
      setWoForm({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        locationText: '',
        serviceType: 'Regulatory Conformance',
        inspectionCategory: 'lifting',
        scope: 'Statutory Periodic Crane & Lifting Tackle Load Test Inspection',
        assignedEngineerId: '',
        dueDate: '',
        certificateValidityDays: 365
      });
      fetchWorkOrders();
    } catch (err) {
      setCreateError(err.message || 'Failed to create work order.');
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
              Field Work Orders
            </h1>
          </div>
          <p className="font-sans text-sm text-slate-500 dark:text-slate-400 font-normal tracking-normal mt-1">
            Gate-pass validated engineer dispatch, equipment checklist execution, and certificate authorization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>NEW WORK ORDER</span>
          </button>
          <button
            onClick={fetchWorkOrders}
            disabled={loading}
            className="h-9 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            {loading ? <MachineLoader scene="conveyor" size={16} /> : <RefreshCw className="h-3.5 w-3.5" />}
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-300 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
        {[
          { id: '', label: 'ALL WORK ORDERS' },
          { id: 'open', label: 'OPEN' },
          { id: 'assigned', label: 'ASSIGNED' },
          { id: 'in_progress', label: 'IN PROGRESS' },
          { id: 'completed', label: 'COMPLETED' },
          { id: 'closed', label: 'CLOSED' },
        ].map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`
                relative px-3 py-1.5 rounded-lg font-sans text-xs uppercase tracking-wider transition-colors
                ${isActive
                  ? 'text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 font-medium'}
              `}
            >
              {isActive && (
                <motion.span
                  layoutId="woTabPill"
                  className="absolute inset-0 rounded-lg bg-blue-600 shadow-xs"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Table Card */}
      <div className="relative rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] overflow-hidden shadow-[0_1px_3px_0_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.06)]">
        <RegistrationMarks />

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <MachineLoader scene="conveyor" size={100} caption="LOADING WORK ORDERS…" />
          </div>
        ) : workOrders.length === 0 ? (
          <div className="p-8">
            <EmptyState
              scene="conveyor"
              title="NO WORK ORDERS FOUND"
              description="Work orders are created automatically when invoices are paid."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-sans text-[11px] uppercase tracking-wider font-bold select-none">
                  <th className="py-2.5 px-4 font-bold">WO Number</th>
                  <th className="py-2.5 px-4 font-bold">Client / Site</th>
                  <th className="py-2.5 px-4 font-bold">Category & Service</th>
                  <th className="py-2.5 px-4 font-bold">Status</th>
                  <th className="py-2.5 px-4 font-bold">Assigned Engineer</th>
                  <th className="py-2.5 px-4 font-bold text-right">Due Date</th>
                  <th className="py-2.5 px-4 font-bold">Inspection</th>
                  <th className="py-2.5 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {workOrders.map((wo) => (
                  <tr
                    key={wo.id}
                    className="group relative h-[46px] hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-2.5 px-4 relative">
                      {/* Hover edge */}
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500 dark:bg-blue-400 scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-100" />
                      <span className="font-mono font-semibold text-[13px] text-slate-900 dark:text-white">
                        {wo.wo_number}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white leading-snug">{wo.client_name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{wo.client_phone || '—'}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200 leading-snug font-medium">{wo.service_type || 'General Inspection'}</div>
                      <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase">
                        [{wo.inspection_category || 'lifting'}]
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusBadge status={wo.status} />
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                      {wo.assigned_engineer_name ? (
                        <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                          <span>{wo.assigned_engineer_name}</span>
                        </span>
                      ) : (
                        <span className="font-sans text-[11px] text-slate-400 dark:text-slate-500 uppercase font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-xs text-slate-500 dark:text-slate-400 text-right font-medium">
                      {formatDate(wo.due_date)}
                    </td>
                    <td className="py-2.5 px-4">
                      {wo.inspection_result ? (
                        <StatusBadge status={wo.inspection_result} />
                      ) : (
                        <span className="font-sans text-[11px] text-slate-400 dark:text-slate-500 uppercase font-medium">PENDING</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <Link
                        href={`/work-orders/${wo.id}`}
                        className="h-7 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <span>MANAGE</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Strip */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
              <div>
                {workOrders.length > 0 ? (
                  <span>01–{String(workOrders.length).padStart(2, '0')} OF {String(workOrders.length).padStart(2, '0')}</span>
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

      {/* Commission Work Order Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setShowCreateModal(false)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative z-10 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] max-w-xl w-full p-6 shadow-2xl space-y-4 font-sans max-h-[90vh] overflow-y-auto"
            >
              <RegistrationMarks />

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <SpecimenLabel figure="DIRECT COMMISSION" label="STATUTORY FIELD INSPECTION" />
                  <h2 className="font-sans text-lg font-semibold text-slate-900 dark:text-white">
                    Commission New Work Order
                  </h2>
                </div>
                <button
                  disabled={submitting}
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {createError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateWorkOrder} className="space-y-3.5">
                {/* Entity Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Select Client Account
                  </label>
                  <select
                    value={selectedEntity}
                    onChange={(e) => handleSelectEntity(e.target.value)}
                    className="w-full h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                  >
                    <option value="">-- Choose Corporate Client or Active Lead (or type manually) --</option>
                    
                    {availableClients.length > 0 && (
                      <optgroup label="🏢 Corporate Clients">
                        {availableClients.map((client) => (
                          <option key={`client-${client.id}`} value={`client:${client.id}`}>
                            {client.name} {client.city ? `(${client.city})` : ''}
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
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Client Legal Entity Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={woForm.clientName}
                    onChange={(e) => setWoForm({ ...woForm, clientName: e.target.value })}
                    placeholder="e.g. Modern Petrochemical Co."
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={woForm.clientEmail}
                      onChange={(e) => setWoForm({ ...woForm, clientEmail: e.target.value })}
                      placeholder="site.manager@client.sa"
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Site Phone
                    </label>
                    <input
                      type="text"
                      value={woForm.clientPhone}
                      onChange={(e) => setWoForm({ ...woForm, clientPhone: e.target.value })}
                      placeholder="+966 11 000 0000"
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden placeholder:font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Inspection Site Location / Coordinates
                  </label>
                  <input
                    type="text"
                    value={woForm.locationText}
                    onChange={(e) => setWoForm({ ...woForm, locationText: e.target.value })}
                    placeholder="e.g. Jubail Industrial Zone 2, Berth 4"
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Equipment Category *
                    </label>
                    <select
                      value={woForm.inspectionCategory}
                      onChange={(e) => setWoForm({ ...woForm, inspectionCategory: e.target.value })}
                      className="w-full h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                    >
                      <option value="lifting">Lifting Equipment & Cranes</option>
                      <option value="pressure_vessels">Boilers & Pressure Vessels</option>
                      <option value="heavy_machinery">Earthmoving & Heavy Machinery</option>
                      <option value="ndt">Non-Destructive Testing (NDT)</option>
                      <option value="scaffolding">Access & Scaffolding Systems</option>
                      <option value="electrical">Industrial Electrical Safety</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Target Due Date
                    </label>
                    <input
                      type="date"
                      value={woForm.dueDate}
                      onChange={(e) => setWoForm({ ...woForm, dueDate: e.target.value })}
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Inspection Scope & Equipment Specification *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={woForm.scope}
                    onChange={(e) => setWoForm({ ...woForm, scope: e.target.value })}
                    placeholder="e.g. Statutory periodic load test, deflection check, and NDT crack assessment."
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden leading-relaxed font-sans"
                  />
                </div>

                {/* Dispatch Engineer */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Assign Field Engineer (Optional)
                  </label>
                  <select
                    value={woForm.assignedEngineerId}
                    onChange={(e) => setWoForm({ ...woForm, assignedEngineerId: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                  >
                    <option value="">-- Leave Unassigned (Dispatch Later) --</option>
                    {availableEngineers.map((eng) => (
                      <option key={eng.id} value={eng.id}>
                        {eng.name} — {eng.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setShowCreateModal(false)}
                    className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-sans text-xs font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <MachineLoader scene="gears" size={14} />
                        <span>COMMISSIONING…</span>
                      </>
                    ) : (
                      <>
                        <Wrench className="h-3.5 w-3.5" />
                        <span>COMMISSION WORK ORDER</span>
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
