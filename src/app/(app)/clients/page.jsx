'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users2,
  Plus,
  Search,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  ClipboardCheck,
  Award,
  Layers,
  DollarSign,
  X,
  RefreshCw,
  UserPlus,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiFetch } from '../../../lib/api';
import { formatMoney } from '../../../lib/format';
import { StatusBadge } from '../../../components/status-badge';
import { MachineLoader } from '../../../components/machine-loader';
import { EmptyState } from '../../../components/empty-state';
import { RegistrationMarks } from '../../../components/engineering/registration-marks';
import { SpecimenLabel } from '../../../components/engineering/specimen-label';
import { toast } from 'sonner';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('clients'); // 'clients' | 'engineers'

  // Modals
  const [showClientModal, setShowClientModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Client Form
  const [clientForm, setClientForm] = useState({
    name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    city: 'Riyadh',
    address: '',
    cr_number: '',
    vat_number: '',
    notes: ''
  });

  // New User Form
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'engineer',
    phone: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, uRes] = await Promise.allSettled([
        apiFetch('/api/clients'),
        apiFetch('/api/users')
      ]);
      if (cRes.status === 'fulfilled') {
        setClients(cRes.value.clients || []);
      }
      if (uRes.status === 'fulfilled') {
        setEngineers(uRes.value.users || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load directory records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientForm)
      });
      toast.success(res.message || 'Client registered successfully.');
      setShowClientModal(false);
      setClientForm({
        name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        city: 'Riyadh',
        address: '',
        cr_number: '',
        vat_number: '',
        notes: ''
      });
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to register client.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(userForm)
      });
      toast.success(res.message || 'Engineer/User onboarded successfully.');
      setShowUserModal(false);
      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'engineer',
        phone: ''
      });
      await fetchData();
      setActiveSection('engineers'); // Switch to engineers list so newly added engineer is visible immediately!
    } catch (err) {
      toast.error(err.message || 'Failed to onboard user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'disabled' : 'active';
    try {
      await apiFetch(`/api/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      toast.success(`User '${user.name}' status set to ${nextStatus}.`);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to update user status.');
    }
  };

  const filteredClients = clients.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.contact_email?.toLowerCase().includes(q) ||
      c.contact_name?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

  const filteredEngineers = engineers.filter(eng => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      eng.name?.toLowerCase().includes(q) ||
      eng.email?.toLowerCase().includes(q) ||
      eng.role?.toLowerCase().includes(q) ||
      eng.phone?.toLowerCase().includes(q)
    );
  });

  // Calculate totals
  const totalWorkOrders = clients.reduce((acc, c) => acc + (c.total_work_orders || 0), 0);
  const totalInspections = clients.reduce((acc, c) => acc + (c.total_inspections || 0), 0);
  const totalCertificates = clients.reduce((acc, c) => acc + (c.total_certificates || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 select-none">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Clients & Field Personnel Directory
          </h1>
          <p className="font-sans text-sm text-slate-500 dark:text-slate-400 font-normal tracking-normal mt-1">
            Manage corporate client accounts, certified inspection engineers, and asset inspection portfolios.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={loading}
            className="h-9 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            {loading ? <MachineLoader scene="crane" size={16} /> : <RefreshCw className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">REFRESH</span>
          </button>

          <button
            onClick={() => setShowUserModal(true)}
            className="h-9 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>ADD ENGINEER</span>
          </button>

          <button
            onClick={() => setShowClientModal(true)}
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-sans text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>NEW CLIENT</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#14171B] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Corporate Clients</span>
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-sans font-bold text-2xl text-slate-900 dark:text-white">
              {clients.length}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Active Accounts</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#14171B] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Field Engineers</span>
            <Users2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-sans font-bold text-2xl text-slate-900 dark:text-white">
              {engineers.length}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Certified Staff</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#14171B] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Work Orders</span>
            <Layers className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-sans font-bold text-2xl text-slate-900 dark:text-white">
              {totalWorkOrders}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Commissioned Jobs</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#14171B] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Inspections</span>
            <ClipboardCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-sans font-bold text-2xl text-slate-900 dark:text-white">
              {totalInspections}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">{totalCertificates} Certified</span>
          </div>
        </div>
      </div>

      {/* Main Card with Section Switcher */}
      <div className="relative rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] overflow-hidden shadow-xs">
        <RegistrationMarks />

        {/* Section Switcher & Search Bar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveSection('clients')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-sans text-xs font-bold transition-all ${
                activeSection === 'clients'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Corporate Clients ({clients.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('engineers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-sans text-xs font-bold transition-all ${
                activeSection === 'engineers'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Users2 className="h-3.5 w-3.5" />
              <span>Field Engineers & Staff ({engineers.length})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeSection === 'clients' ? "Filter company, email, city..." : "Filter engineer name, email, role..."}
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
            />
          </div>
        </div>

        {/* SECTION 1: Corporate Clients Table */}
        {activeSection === 'clients' && (
          <div>
            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center">
                <MachineLoader scene="conveyor" size={100} caption="SYNCHRONIZING CLIENT DIRECTORY…" />
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  scene="crane"
                  title="NO CLIENT ACCOUNTS MATCHED"
                  description="Register a new corporate client or search with different keywords."
                  action={
                    <button
                      onClick={() => setShowClientModal(true)}
                      className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-semibold"
                    >
                      REGISTER CLIENT
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-sans text-[11px] uppercase tracking-wider font-bold select-none">
                      <th className="py-2.5 px-4 font-bold">Client Entity</th>
                      <th className="py-2.5 px-4 font-bold">Contact Person</th>
                      <th className="py-2.5 px-4 font-bold">Location</th>
                      <th className="py-2.5 px-4 font-bold text-center">Work Orders</th>
                      <th className="py-2.5 px-4 font-bold text-center">Inspections</th>
                      <th className="py-2.5 px-4 font-bold text-center">Certificates</th>
                      <th className="py-2.5 px-4 font-bold text-right">Total Billed</th>
                      <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredClients.map((client) => {
                      return (
                        <tr
                          key={client.id}
                          className="group relative h-[48px] hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-blue-700 dark:text-blue-300 text-xs shrink-0">
                                {client.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <Link
                                  href={`/clients/${client.id}`}
                                  className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                  {client.name}
                                </Link>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  CR: {client.cr_number || '1010-TPI-SA'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {client.contact_name || 'Representative'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {client.contact_email || '—'}
                            </div>
                          </td>

                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-1 font-medium">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              <span>{client.city || 'Riyadh'}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                              {client.address || 'Industrial Zone'}
                            </div>
                          </td>

                          <td className="py-2.5 px-4 text-center font-mono">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                              {client.total_work_orders} Jobs
                            </span>
                          </td>

                          <td className="py-2.5 px-4 text-center font-mono">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                              {client.total_inspections} Audits
                            </span>
                          </td>

                          <td className="py-2.5 px-4 text-center font-mono">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                              {client.total_certificates} Issued
                            </span>
                          </td>

                          <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                            {formatMoney(client.total_billed_sar || 0)} SAR
                          </td>

                          <td className="py-2.5 px-4 text-right">
                            <Link
                              href={`/clients/${client.id}`}
                              className="h-7 px-3 rounded-lg border border-blue-300 dark:border-blue-700/80 bg-blue-50/70 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-[11px] font-sans font-semibold inline-flex items-center gap-1 transition-all shadow-2xs"
                            >
                              <span>360° DOSSIER</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: Field Engineers & Staff Table */}
        {activeSection === 'engineers' && (
          <div>
            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center">
                <MachineLoader scene="crane" size={100} caption="RETRIEVING REGISTERED PERSONNEL…" />
              </div>
            ) : filteredEngineers.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  scene="crane"
                  title="NO ENGINEERS OR STAFF FOUND"
                  description="Onboard certified field inspectors or adjust your search filter."
                  action={
                    <button
                      onClick={() => setShowUserModal(true)}
                      className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-semibold"
                    >
                      ONBOARD ENGINEER
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-sans text-[11px] uppercase tracking-wider font-bold select-none">
                      <th className="py-2.5 px-4 font-bold">Field Engineer / Staff</th>
                      <th className="py-2.5 px-4 font-bold">Email & Contact</th>
                      <th className="py-2.5 px-4 font-bold">Role</th>
                      <th className="py-2.5 px-4 font-bold text-center">Gate-Pass Credential</th>
                      <th className="py-2.5 px-4 font-bold text-center">Active Jobs</th>
                      <th className="py-2.5 px-4 font-bold">Status</th>
                      <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredEngineers.map((eng) => {
                      const isValid = !eng.has_expired_docs;
                      return (
                        <tr
                          key={eng.id}
                          className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors h-[48px]"
                        >
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-300 text-xs shrink-0 font-mono">
                                {eng.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white">
                                  {eng.name}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  ID: {eng.id.slice(0, 8).toUpperCase()}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {eng.email}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {eng.phone || '—'}
                            </div>
                          </td>

                          <td className="py-2.5 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 capitalize">
                              {eng.role?.replace(/_/g, ' ')}
                            </span>
                          </td>

                          <td className="py-2.5 px-4 text-center">
                            {isValid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                <span>ALL VALID</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                                <AlertCircle className="h-3 w-3 text-rose-600" />
                                <span>EXPIRED IQAMA</span>
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-4 text-center font-mono">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                              {eng.active_work_orders_count || 0} Assigned
                            </span>
                          </td>

                          <td className="py-2.5 px-4">
                            <StatusBadge status={eng.status} />
                          </td>

                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href="/work-orders"
                                className="h-7 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs"
                                title="Assign to Work Order"
                              >
                                <span>ASSIGN JOBS</span>
                              </Link>

                              <button
                                onClick={() => handleToggleUserStatus(eng)}
                                className={`h-7 px-2 rounded-lg text-[11px] font-semibold transition-colors ${
                                  eng.status === 'active'
                                    ? 'border border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30'
                                    : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30'
                                }`}
                              >
                                {eng.status === 'active' ? 'DISABLE' : 'ACTIVATE'}
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
        )}
      </div>

      {/* Modal: New Corporate Client */}
      <AnimatePresence>
        {showClientModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setShowClientModal(false)}
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
                  <SpecimenLabel figure="CLIENT DIRECTORY" label="ONBOARD CORPORATE ENTITY" />
                  <h2 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                    Register New Client Account
                  </h2>
                </div>
                <button
                  disabled={submitting}
                  onClick={() => setShowClientModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateClient} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Corporate Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    placeholder="e.g. Saudi Aramco Petrochemical Logistics Co."
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={clientForm.contact_name}
                      onChange={(e) => setClientForm({ ...clientForm, contact_name: e.target.value })}
                      placeholder="e.g. Eng. Tariq Al-Mansoor"
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={clientForm.contact_email}
                      onChange={(e) => setClientForm({ ...clientForm, contact_email: e.target.value })}
                      placeholder="procurement@client.sa"
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={clientForm.contact_phone}
                      onChange={(e) => setClientForm({ ...clientForm, contact_phone: e.target.value })}
                      placeholder="+966 13 881 2299"
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      City / Region
                    </label>
                    <select
                      value={clientForm.city}
                      onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                      className="w-full h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                    >
                      <option value="Jubail">Jubail Industrial City</option>
                      <option value="Yanbu">Yanbu Industrial City</option>
                      <option value="Ras Tanura">Ras Tanura</option>
                      <option value="Dammam">Dammam / Khobar</option>
                      <option value="Riyadh">Riyadh Region</option>
                      <option value="Jeddah">Jeddah / Rabigh</option>
                      <option value="NEOM">NEOM / Tabuk</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Commercial Reg (CR)
                    </label>
                    <input
                      type="text"
                      value={clientForm.cr_number}
                      onChange={(e) => setClientForm({ ...clientForm, cr_number: e.target.value })}
                      placeholder="1010-XXXX-XX"
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden placeholder:font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      VAT / Tax Number
                    </label>
                    <input
                      type="text"
                      value={clientForm.vat_number}
                      onChange={(e) => setClientForm({ ...clientForm, vat_number: e.target.value })}
                      placeholder="310XXXXXXXX0003"
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden placeholder:font-sans"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setShowClientModal(false)}
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
                        <span>REGISTERING…</span>
                      </>
                    ) : (
                      <span>SAVE CLIENT ACCOUNT</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add Engineer / User */}
      <AnimatePresence>
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setShowUserModal(false)}
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
                  <SpecimenLabel figure="TEAM MANAGEMENT" label="ONBOARD INSPECTION PERSONNEL" />
                  <h2 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                    Onboard Field Engineer / User
                  </h2>
                </div>
                <button
                  disabled={submitting}
                  onClick={() => setShowUserModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                New engineers will immediately appear in the Field Engineers registry, Work Order assignment dropdown, and inspection execution queue.
              </p>

              <form onSubmit={handleCreateUser} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="e.g. Eng. Tariq Al-Otaibi"
                    className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="tariq@alliance-tpi.sa"
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Role *
                    </label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                      className="w-full h-8 px-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                    >
                      <option value="engineer">Field Engineer (Inspector)</option>
                      <option value="admin">Platform Administrator</option>
                      <option value="sales">Commercial / Sales Officer</option>
                      <option value="finance">Finance / Billing Specialist</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      placeholder="+966 50 123 4567"
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Initial Password
                    </label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder="Default: Alliance@2026"
                      className="w-full h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden font-sans"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setShowUserModal(false)}
                    className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-sans text-xs font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <MachineLoader scene="gears" size={14} />
                        <span>ONBOARDING…</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>CREATE ENGINEER</span>
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
