'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  ArrowLeft,
  ClipboardCheck,
  Layers,
  Award,
  DollarSign,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  FileText,
  User,
  Plus
} from 'lucide-react';
import { apiFetch } from '../../../../lib/api';
import { formatDate, formatMoney } from '../../../../lib/format';
import { StatusBadge } from '../../../../components/status-badge';
import { MachineLoader } from '../../../../components/machine-loader';
import { EmptyState } from '../../../../components/empty-state';
import { RegistrationMarks } from '../../../../components/engineering/registration-marks';
import { SpecimenLabel } from '../../../../components/engineering/specimen-label';
import { toast } from 'sonner';

export default function ClientDossierPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id;

  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inspections'); // 'inspections' | 'work-orders' | 'certificates' | 'commercials'

  useEffect(() => {
    const fetchDossier = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/api/clients/${clientId}`);
        setDossier(data);
      } catch (err) {
        toast.error(err.message || 'Failed to load client dossier.');
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchDossier();
    }
  }, [clientId]);

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center min-h-[500px]">
        <MachineLoader scene="conveyor" size={120} caption="RETRIEVING CLIENT 360° DOSSIER…" />
      </div>
    );
  }

  if (!dossier || !dossier.client) {
    return (
      <div className="p-8">
        <EmptyState
          scene="crane"
          title="CLIENT ACCOUNT NOT FOUND"
          description="The requested corporate client could not be located."
          action={
            <Link
              href="/clients"
              className="h-9 px-4 rounded-lg bg-slate-900 text-white font-sans text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>RETURN TO CLIENTS</span>
            </Link>
          }
        />
      </div>
    );
  }

  const { client, workOrders = [], inspections = [], certificates = [], invoices = [], proposals = [] } = dossier;

  const safeCount = inspections.filter(i => i.result === 'safe').length;
  const unsafeCount = inspections.filter(i => i.result === 'unsafe').length;
  const conditionalCount = inspections.filter(i => i.result === 'conditional').length;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>BACK TO CLIENT DIRECTORY</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/work-orders"
            className="h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span>CREATE WORK ORDER</span>
          </Link>

          <Link
            href="/proposals"
            className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-all"
          >
            <FileText className="h-3 w-3" />
            <span>CREATE PROPOSAL</span>
          </Link>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="relative rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] p-6 shadow-xs overflow-hidden">
        <RegistrationMarks />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20 shrink-0">
              {client.name.slice(0, 2).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {client.name}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                  Active Client
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-0.5 font-medium">
                {client.cr_number && (
                  <span>CR: <strong className="font-mono text-slate-700 dark:text-slate-300">{client.cr_number}</strong></span>
                )}
                {client.vat_number && (
                  <span>VAT: <strong className="font-mono text-slate-700 dark:text-slate-300">{client.vat_number}</strong></span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{client.city || 'Riyadh'}, KSA</span>
                </span>
              </div>

              {client.address && (
                <div className="text-xs text-slate-500 pt-0.5">
                  {client.address}
                </div>
              )}
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 text-xs space-y-1.5 shrink-0 min-w-[240px]">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-slate-200 dark:border-slate-800">
              <User className="h-3.5 w-3.5 text-blue-600" />
              <span>{client.contact_name || 'Primary Representative'}</span>
            </div>
            {client.contact_email && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <a href={`mailto:${client.contact_email}`} className="hover:underline truncate">
                  {client.contact_email}
                </a>
              </div>
            )}
            {client.contact_phone && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <a href={`tel:${client.contact_phone}`} className="hover:underline font-mono">
                  {client.contact_phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Executive Metrics Bar */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {inspections.length}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Equipment Audits
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
              {workOrders.length}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Work Orders
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold font-mono text-amber-500">
              {certificates.length}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Valid Certificates
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {invoices.length}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Invoiced Records
            </div>
          </div>
        </div>
      </div>

      {/* Dossier Tabs Container */}
      <div className="relative rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] overflow-hidden shadow-xs">
        <RegistrationMarks />

        {/* Tab Headers */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 px-4 pt-3 flex items-center gap-2 overflow-x-auto select-none">
          <button
            onClick={() => setActiveTab('inspections')}
            className={`h-9 px-4 rounded-t-lg font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'inspections'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#14171B]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            <span>ALL INSPECTIONS ({inspections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('work-orders')}
            className={`h-9 px-4 rounded-t-lg font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'work-orders'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#14171B]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>WORK ORDERS ({workOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`h-9 px-4 rounded-t-lg font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'certificates'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#14171B]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>CERTIFICATES ({certificates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('commercials')}
            className={`h-9 px-4 rounded-t-lg font-sans text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'commercials'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#14171B]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
            <span>BILLING & PROPOSALS ({invoices.length + proposals.length})</span>
          </button>
        </div>

        {/* Tab 1: Inspections List */}
        {activeTab === 'inspections' && (
          <div>
            {inspections.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  scene="crane"
                  title="NO INSPECTIONS ON RECORD"
                  description="No equipment inspections have been submitted for this client yet."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-sans text-[11px] uppercase tracking-wider font-bold">
                      <th className="py-2.5 px-4 font-bold">Equipment Spec / Serial</th>
                      <th className="py-2.5 px-4 font-bold">Audit Category</th>
                      <th className="py-2.5 px-4 font-bold">Work Order Ref</th>
                      <th className="py-2.5 px-4 font-bold">Field Engineer</th>
                      <th className="py-2.5 px-4 font-bold text-center">Test Result</th>
                      <th className="py-2.5 px-4 font-bold">Date Audited</th>
                      <th className="py-2.5 px-4 font-bold text-right">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {inspections.map((insp) => {
                      const eq = insp.equipment_jsonb || {};
                      const isSafe = insp.result === 'safe';
                      const isUnsafe = insp.result === 'unsafe';

                      return (
                        <tr
                          key={insp.id}
                          className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {eq.description || eq.type || 'Industrial Asset'}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              SN: {eq.serialNumber || eq.serial_number || 'SN-TPI-889'}
                            </div>
                          </td>

                          <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 capitalize font-medium">
                            {insp.inspection_category || insp.service_type || 'Statutory TPI'}
                          </td>

                          <td className="py-2.5 px-4 font-mono font-medium">
                            <Link
                              href={`/work-orders/${insp.work_order_id}`}
                              className="text-blue-600 hover:underline dark:text-blue-400"
                            >
                              {insp.wo_number || 'WO-RECORD'}
                            </Link>
                          </td>

                          <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {insp.engineer_name || 'Inspector'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {insp.engineer_email}
                            </div>
                          </td>

                          <td className="py-2.5 px-4 text-center">
                            {isSafe && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                <span>SAFE (PASS)</span>
                              </span>
                            )}
                            {isUnsafe && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                                <XCircle className="h-3 w-3 text-rose-600" />
                                <span>UNSAFE (FAIL)</span>
                              </span>
                            )}
                            {!isSafe && !isUnsafe && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                <AlertTriangle className="h-3 w-3 text-amber-600" />
                                <span>CONDITIONAL</span>
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-4 font-sans text-xs text-slate-500">
                            {formatDate(insp.submitted_at)}
                          </td>

                          <td className="py-2.5 px-4 text-right">
                            {insp.certificate_number ? (
                              <Link
                                href="/certificates"
                                className="h-7 px-2.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-mono text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs"
                              >
                                <span>{insp.certificate_number}</span>
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">Pending cert</span>
                            )}
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

        {/* Tab 2: Work Orders */}
        {activeTab === 'work-orders' && (
          <div>
            {workOrders.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  scene="crane"
                  title="NO WORK ORDERS COMMISSIONED"
                  description="No work orders currently assigned to this client."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-sans text-[11px] uppercase tracking-wider font-bold">
                      <th className="py-2.5 px-4 font-bold">WO Number</th>
                      <th className="py-2.5 px-4 font-bold">Service Category</th>
                      <th className="py-2.5 px-4 font-bold">Assigned Field Engineer</th>
                      <th className="py-2.5 px-4 font-bold">Status</th>
                      <th className="py-2.5 px-4 font-bold text-right">Due Date</th>
                      <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {workOrders.map((wo) => {
                      return (
                        <tr
                          key={wo.id}
                          className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-2.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                            <Link href={`/work-orders/${wo.id}`} className="hover:underline text-blue-600 dark:text-blue-400">
                              {wo.wo_number}
                            </Link>
                          </td>

                          <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 capitalize font-medium">
                            {wo.inspection_category || wo.service_type || 'Industrial Audit'}
                          </td>

                          <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                            {wo.assigned_engineer_name || (
                              <span className="text-amber-600 dark:text-amber-400 italic">Unassigned</span>
                            )}
                          </td>

                          <td className="py-2.5 px-4">
                            <StatusBadge status={wo.status} />
                          </td>

                          <td className="py-2.5 px-4 text-right font-sans text-xs text-slate-500 font-medium">
                            {wo.due_date ? formatDate(wo.due_date) : 'Flexible'}
                          </td>

                          <td className="py-2.5 px-4 text-right">
                            <Link
                              href={`/work-orders/${wo.id}`}
                              className="h-7 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors"
                            >
                              <span>INSPECT</span>
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

        {/* Tab 3: Certificates */}
        {activeTab === 'certificates' && (
          <div>
            {certificates.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  scene="crane"
                  title="NO CERTIFICATES ISSUED"
                  description="No statutory compliance certificates have been issued yet."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-sans text-[11px] uppercase tracking-wider font-bold">
                      <th className="py-2.5 px-4 font-bold">Certificate No</th>
                      <th className="py-2.5 px-4 font-bold">Equipment Serial</th>
                      <th className="py-2.5 px-4 font-bold">Certification Standard</th>
                      <th className="py-2.5 px-4 font-bold">Status</th>
                      <th className="py-2.5 px-4 font-bold">Issued Date</th>
                      <th className="py-2.5 px-4 font-bold text-right">Expires On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {certificates.map((cert) => {
                      return (
                        <tr
                          key={cert.id}
                          className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {cert.certificate_number}
                          </td>

                          <td className="py-2.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                            {cert.equipment_serial}
                          </td>

                          <td className="py-2.5 px-4 capitalize text-slate-700 dark:text-slate-300 font-medium">
                            {cert.certificate_type?.replace(/_/g, ' ')}
                          </td>

                          <td className="py-2.5 px-4">
                            <StatusBadge status={cert.status} />
                          </td>

                          <td className="py-2.5 px-4 font-sans text-xs text-slate-500 font-medium">
                            {formatDate(cert.issued_at)}
                          </td>

                          <td className="py-2.5 px-4 text-right font-sans text-xs text-slate-500 font-medium">
                            {formatDate(cert.expires_at)}
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

        {/* Tab 4: Commercials (Invoices & Proposals) */}
        {activeTab === 'commercials' && (
          <div className="p-4 space-y-6">
            {/* Invoices List */}
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Statutory Tax Invoices ({invoices.length})
                </h3>
              </div>

              {invoices.length === 0 ? (
                <div className="text-xs text-slate-500 p-4 italic">No invoices issued for this client entity.</div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900/40 text-[11px] uppercase font-bold text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="py-2 px-3">Invoice Number</th>
                        <th className="py-2 px-3">Subtotal</th>
                        <th className="py-2 px-3">VAT (15%)</th>
                        <th className="py-2 px-3 text-right">Total (SAR)</th>
                        <th className="py-2 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-mono font-semibold">{inv.invoice_number}</td>
                          <td className="py-2 px-3 font-mono">{formatMoney(inv.subtotal)} SAR</td>
                          <td className="py-2 px-3 font-mono">{formatMoney(inv.vat_amount)} SAR</td>
                          <td className="py-2 px-3 font-mono font-bold text-right text-emerald-600">{formatMoney(inv.total)} SAR</td>
                          <td className="py-2 px-3 text-right"><StatusBadge status={inv.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Proposals List */}
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Proposals & Inspection Agreements ({proposals.length})
                </h3>
              </div>

              {proposals.length === 0 ? (
                <div className="text-xs text-slate-500 p-4 italic">No proposals drafted or sent for this client.</div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900/40 text-[11px] uppercase font-bold text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="py-2 px-3">Proposal Ref</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3 text-right">Contract Fee</th>
                        <th className="py-2 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {proposals.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-mono font-semibold">PROP-{p.id.slice(0, 8).toUpperCase()}</td>
                          <td className="py-2 px-3 capitalize font-medium">{p.type}</td>
                          <td className="py-2 px-3 font-mono font-bold text-right">{formatMoney(p.content_jsonb?.amount || 0)} SAR</td>
                          <td className="py-2 px-3 text-right"><StatusBadge status={p.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
