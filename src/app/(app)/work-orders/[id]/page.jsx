'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../../../lib/api';
import { formatDate, formatDateTime } from '../../../../lib/format';
import { StatusBadge } from '../../../../components/status-badge';
import { RegistrationMarks, SpecimenLabel, FadeRule } from '../../../../components/engineering';
import { MachineLoader } from '../../../../components/machine-loader';
import { IndustrialLoader } from '../../../../components/industrial-loader';
import {
  ArrowLeft,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  ClipboardCheck,
  Award,
  AlertTriangle,
  FileText,
  RotateCcw,
  ExternalLink,
  X,
  Plus,
  CheckCircle2,
  MapPin,
  Lock,
  Unlock,
  Sparkles,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * 6.3 Work Order Detail — "The Job Docket"
 * Precision instrument panel layout:
 * - Header: WO-000123 in 32px Geist Mono with corner registration marks
 * - Left column (span 8): Scope / Assignment / Inspection panels
 * - Designed "GATE-PASS DENIED" barrier-gate panel in rose-50 with blocked document list
 * - Inspection checklist with YES / NO / N/A 32px segmented buttons (selecting NO draws 2px rose edge and blocks SAFE)
 * - Right column (span 4): Sticky certificate panel with hover scan-line on 160px QR
 * - Bottom: Horizontal status timeline with animated connector
 */
export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Assignment Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEngineerId, setSelectedEngineerId] = useState('');
  const [gatePassError, setGatePassError] = useState(null);
  const [assigning, setAssigning] = useState(false);

  // Quick Add Engineer Submodal
  const [showNewEngineerModal, setShowNewEngineerModal] = useState(false);
  const [newEngineerForm, setNewEngineerForm] = useState({ name: '', email: '', phone: '' });
  const [addingEngineer, setAddingEngineer] = useState(false);

  // Inspection Checklist Modal
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [checklist, setChecklist] = useState(null);
  const [answers, setAnswers] = useState({});
  const [equipmentForm, setEquipmentForm] = useState({
    manufacturer: 'Caterpillar / Grove',
    model: 'RT-880E Heavy Duty',
    serial: 'CAT-50T-88902',
    year: 2021,
    capacity: '50-Ton Rated Dynamic'
  });
  const [resultOutcome, setResultOutcome] = useState('safe');
  const [inspectNotes, setInspectNotes] = useState('');
  const [submittingInspect, setSubmittingInspect] = useState(false);
  const [inspectError, setInspectError] = useState('');

  // Certificate Issuance Modal
  const [showCertModal, setShowCertModal] = useState(false);
  const [certType, setCertType] = useState('safety_compliance');
  const [issuingCert, setIssuingCert] = useState(false);

  // Certificate Revocation Modal
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState('Annual safety inspection expired or critical structural crack detected.');
  const [revoking, setRevoking] = useState(false);

  // QR Hover Scan Line State
  const [isScanningQr, setIsScanningQr] = useState(false);

  const fetchWorkOrder = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/work-orders/${id}`);
      setData(res);
    } catch (err) {
      toast.error('Failed to load work order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchWorkOrder();
  }, [id]);

  const openInspectModal = async () => {
    try {
      const res = await apiFetch(`/api/work-orders/${id}/checklist`);
      setChecklist(res.checklist);

      const initialAnswers = {};
      const items = res.checklist?.items_jsonb || [];
      items.forEach(item => {
        initialAnswers[item.key] = { status: 'yes', comment: '' };
      });
      setAnswers(initialAnswers);
      setResultOutcome('safe');
      setInspectError('');
      setShowInspectModal(true);
    } catch (err) {
      toast.error('Could not load inspection checklist template.');
    }
  };

  const handleAssignEngineer = async (e) => {
    e.preventDefault();
    if (!selectedEngineerId) return;

    setAssigning(true);
    setGatePassError(null);

    try {
      await apiFetch(`/api/work-orders/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ engineerId: selectedEngineerId })
      });

      toast.success('Engineer gate-pass validated and assigned successfully.');
      setShowAssignModal(false);
      fetchWorkOrder();
    } catch (err) {
      if (err.status === 422 && err.details?.blockedBy) {
        setGatePassError(err.details.blockedBy);
      } else {
        toast.error(err.message || 'Failed to assign engineer.');
      }
    } finally {
      setAssigning(false);
    }
  };

  const handleQuickAddEngineer = async (e) => {
    e.preventDefault();
    setAddingEngineer(true);
    try {
      const res = await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          ...newEngineerForm,
          role: 'engineer'
        })
      });
      toast.success(res.message || 'Engineer created successfully.');
      setShowNewEngineerModal(false);
      setNewEngineerForm({ name: '', email: '', phone: '' });
      await fetchWorkOrder();
      if (res.user?.id) {
        setSelectedEngineerId(res.user.id);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to onboard engineer.');
    } finally {
      setAddingEngineer(false);
    }
  };

  const handleAnswerChange = (itemKey, status) => {
    const updated = {
      ...answers,
      [itemKey]: { ...answers[itemKey], status }
    };
    setAnswers(updated);

    const hasAnyNo = Object.values(updated).some(a => a.status === 'no');
    if (hasAnyNo && resultOutcome === 'safe') {
      setResultOutcome('unsafe');
    }
  };

  const hasFailingAnswers = Object.values(answers).some(a => a?.status === 'no');

  const handleSubmitInspection = async (e) => {
    e.preventDefault();
    setSubmittingInspect(true);
    setInspectError('');

    try {
      await apiFetch('/api/inspections', {
        method: 'POST',
        body: JSON.stringify({
          workOrderId: id,
          checklistId: checklist?.id,
          answers,
          equipment: equipmentForm,
          result: resultOutcome,
          notes: inspectNotes
        })
      });

      await apiFetch(`/api/work-orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed' })
      }).catch(() => {});

      toast.success(`Inspection submitted with outcome '${resultOutcome}'.`);
      setShowInspectModal(false);
      fetchWorkOrder();
    } catch (err) {
      setInspectError(err.message || 'Inspection submission failed.');
    } finally {
      setSubmittingInspect(false);
    }
  };

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    setIssuingCert(true);

    try {
      const res = await apiFetch('/api/certificates', {
        method: 'POST',
        body: JSON.stringify({
          workOrderId: id,
          certificateType: certType
        })
      });

      toast.success(`Certificate ${res.certificate?.certificate_number} issued successfully!`);
      setShowCertModal(false);
      fetchWorkOrder();
    } catch (err) {
      if (err.status === 409) {
        toast.error('Certificate already issued for this equipment and type today.');
      } else {
        toast.error(err.message || 'Certificate issuance failed.');
      }
    } finally {
      setIssuingCert(false);
    }
  };

  const handleRevokeCertificate = async (e) => {
    e.preventDefault();
    if (!data?.certificate?.id) return;
    setRevoking(true);

    try {
      await apiFetch(`/api/certificates/${data.certificate.id}/revoke`, {
        method: 'POST',
        body: JSON.stringify({ reason: revokeReason })
      });

      toast.success('Certificate revoked.');
      setShowRevokeModal(false);
      fetchWorkOrder();
    } catch (err) {
      toast.error(err.message || 'Revocation failed.');
    } finally {
      setRevoking(false);
    }
  };

  const handleReopenWorkOrder = async () => {
    if (!confirm('Reopening will delete the current inspection submission and reset status to assigned. Proceed?')) return;

    try {
      await apiFetch(`/api/work-orders/${id}/reopen`, { method: 'PATCH' });
      toast.success('Work order reopened. Ready for re-inspection.');
      fetchWorkOrder();
    } catch (err) {
      toast.error(err.message || 'Could not reopen work order.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <MachineLoader scene="crane" size={100} caption="RETRIEVING JOB DOCKET..." />
      </div>
    );
  }

  if (!data?.workOrder) {
    return (
      <div className="p-8 text-center font-mono text-xs text-text-muted">
        WORK ORDER SPECIFICATION NOT LOCATED.{' '}
        <Link href="/work-orders" className="underline font-600 text-amber-700 dark:text-amber-400">
          RETURN TO DOCKET INDEX
        </Link>
      </div>
    );
  }

  const wo = data.workOrder;
  const submission = data.submission;
  const cert = data.certificate;

  // Timeline nodes
  const steps = ['open', 'assigned', 'in_progress', 'completed', 'closed'];
  const currentStepIdx = steps.indexOf(wo.status) !== -1 ? steps.indexOf(wo.status) : 1;

  return (
    <div className="space-y-8 select-none">
      {/* Docket Header Card with Registration Marks & 5-Stage Stepper */}
      <div className="relative rounded-2xl border border-border bg-surface-1 p-6 md:p-8 shadow-elevation space-y-6">
        <RegistrationMarks />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
          <div className="flex items-start gap-4">
            <Link
              href="/work-orders"
              className="mt-1 h-9 w-9 rounded-xl border border-border bg-surface-2/60 hover:bg-surface-2 flex items-center justify-center text-text-muted hover:text-text-main transition-colors shrink-0 shadow-xs"
              title="Return to work orders"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-mono text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {wo.wo_number}
                </h1>
                <StatusBadge status={wo.status} />
              </div>

              {/* Subline with client · category pill · due date */}
              <div className="font-sans text-sm text-slate-600 dark:text-slate-400 mt-2 flex flex-wrap items-center gap-2.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{wo.client_name}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-[10px] uppercase font-bold border border-amber-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {wo.inspection_category || 'LIFTING'}
                </span>
                <span>·</span>
                <span className="font-mono text-xs text-text-muted">Due Date: <strong>{formatDate(wo.due_date)}</strong></span>
              </div>
            </div>
          </div>

          {/* Admin Emergency Reopen Action */}
          {submission && (
            <button
              onClick={handleReopenWorkOrder}
              className="h-8 px-3 rounded-lg border border-border bg-surface-1 text-text-muted hover:bg-surface-2 text-xs font-mono inline-flex items-center gap-1.5 shadow-xs transition-all"
              title="Admin Emergency Reopen to re-submit inspection"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>REOPEN DOCKET</span>
            </button>
          )}
        </div>

        {/* 5-Stage Visual Workflow Pipeline Stepper */}
        <div className="space-y-2 pt-1">
          <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center justify-between">
            <span>STATUTORY EXECUTION PIPELINE</span>
            <span className="text-amber-600 dark:text-amber-400">
              {cert ? 'STAGE 5 OF 5 · CERTIFICATE ISSUED' : submission ? 'STAGE 4 OF 5 · INSPECTION EVALUATED' : wo.assigned_engineer_id ? 'STAGE 2 OF 5 · ENGINEER DISPATCHED' : 'STAGE 1 OF 5 · OPEN'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
            {[
              { num: '1', title: 'Open', desc: 'Docket Created', active: true, done: !!wo.assigned_engineer_id },
              { num: '2', title: 'Gate-Pass Validated', desc: wo.assigned_engineer_name ? wo.assigned_engineer_name : 'Unassigned', active: !!wo.assigned_engineer_id, done: !!submission },
              { num: '3', title: 'Field Inspection', desc: submission ? 'Submitted' : 'Telemetry Syncing', active: wo.status === 'in_progress' || !!submission, done: !!submission },
              { num: '4', title: 'Evaluated (SAFE)', desc: submission?.result ? `Marked ${submission.result.toUpperCase()}` : 'Pending', active: !!submission, done: submission?.result === 'safe' },
              { num: '5', title: 'QR Certificate', desc: cert ? cert.certificate_number : 'Awaiting Seal', active: !!cert, done: !!cert }
            ].map((step, idx) => {
              const isCurrent = (
                (idx === 0 && !wo.assigned_engineer_id) ||
                (idx === 1 && wo.assigned_engineer_id && !submission) ||
                (idx === 2 && submission && !cert) ||
                (idx === 4 && !!cert)
              );

              return (
                <div
                  key={step.title}
                  className={`relative p-3 rounded-xl border transition-all ${
                    step.done
                      ? 'bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-950/20'
                      : isCurrent
                      ? 'bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/20 shadow-xs'
                      : 'bg-surface-2/40 border-border text-slate-400'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -top-1.5 right-2 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-mono text-[9px] font-bold shadow-xs">
                      ACTIVE
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                      step.done
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-amber-500 text-slate-950 animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {step.done ? <Check className="w-3 h-3" /> : step.num}
                    </span>
                    <span className={`font-sans font-bold text-xs truncate ${
                      step.done ? 'text-emerald-700 dark:text-emerald-300' : isCurrent ? 'text-amber-800 dark:text-amber-300' : 'text-slate-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 truncate pl-7">
                    {step.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (span 8): Scope / Assignment / Inspection Panels */}
        <div className="lg:col-span-8 space-y-6">
          {/* Panel 1: Rich Asset Specification Card */}
          <div className="relative rounded-2xl border border-border bg-surface-1 p-6 shadow-elevation hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4">
            <RegistrationMarks />
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div>
                <SpecimenLabel figure="SEC. 01" label="JOB SCOPE & STATUTORY TECHNICAL SPECIFICATION" />
                <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white mt-0.5">
                  Heavy Machinery Asset Specification
                </h3>
              </div>
              <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-border">
                SASO / ISO 17020
              </span>
            </div>

            {/* Target Asset Title & Technical Pills */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/5 via-surface-2/40 to-surface-1 border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wider font-bold">
                  TARGET INSPECTION ASSET
                </div>
                <div className="font-display font-extrabold text-lg text-slate-900 dark:text-slate-100 mt-0.5">
                  50-Ton Overhead Traveling Crane & Hoist
                </div>
              </div>

              {/* Technical Metadata Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-surface-1 border border-border text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold shadow-xs">
                  Proof Load: <strong>125% Dynamic</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-surface-1 border border-border text-slate-700 dark:text-slate-300 font-mono text-[11px] font-semibold shadow-xs">
                  Cycle: <strong>12 Months</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-surface-1 border border-border text-amber-700 dark:text-amber-400 font-mono text-[11px] font-semibold shadow-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  <span>Sabic Logistics ↗</span>
                </span>
              </div>
            </div>

            {/* Detailed Key-Value Grid with High Readability */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-3 rounded-xl bg-surface-2/40 border border-border/80 space-y-1">
                <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider font-semibold">
                  SERVICE TYPE
                </span>
                <div className="font-sans font-semibold text-sm text-slate-800 dark:text-slate-200">
                  {wo.service_type || 'Lifting Gear Proof Test'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-2/40 border border-border/80 space-y-1">
                <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider font-semibold">
                  CLASSIFICATION
                </span>
                <div className="font-sans font-semibold text-sm text-slate-800 dark:text-slate-200 uppercase">
                  {wo.inspection_category || 'LIFTING'} · CLASS A
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-2/40 border border-border/80 space-y-1">
                <span className="text-slate-400 block text-[10px] font-mono uppercase tracking-wider font-semibold">
                  CLIENT REPRESENTATIVE
                </span>
                <div className="font-sans font-semibold text-sm text-slate-800 dark:text-slate-200">
                  {wo.client_name}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/80">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                Scope of Statutory Audit:
              </span>
              <div className="p-3.5 rounded-xl bg-surface-2/40 border border-border font-sans text-xs text-text-muted leading-relaxed">
                {wo.scope || 'Full statutory engineering inspection as per SASO / ISO third-party verification standards.'}
              </div>
            </div>
          </div>

          {/* Panel 2: Inspector Credential Shield (SEC. 02) */}
          <div className="relative rounded-2xl border border-border bg-surface-1 p-6 shadow-elevation hover:border-amber-500/40 transition-all space-y-4">
            <RegistrationMarks />
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div>
                <SpecimenLabel figure="SEC. 02" label="ENGINEER ASSIGNMENT & GATE-PASS VALIDATION" />
                <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white mt-0.5">
                  Inspector Credential Shield
                </h3>
              </div>
              {wo.assigned_engineer_id && (
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25">
                  GATE-PASS APPROVED
                </span>
              )}
            </div>

            {wo.assigned_engineer_id ? (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-surface-2/40 to-surface-1 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-amber-400 flex items-center justify-center font-mono font-bold text-sm shadow-md">
                      {wo.assigned_engineer_name?.[0] || 'E'}
                    </div>
                    <div>
                      <div className="font-sans font-bold text-sm text-slate-900 dark:text-white">
                        {wo.assigned_engineer_name}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold flex items-center gap-1.5 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>GATE-PASS VALIDATED · CREDENTIALS NOMINAL</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setShowAssignModal(true); setGatePassError(null); }}
                    className="h-8 px-3 rounded-lg border border-border bg-surface-1 hover:bg-surface-2 text-xs font-mono font-semibold text-text-muted hover:text-text-main transition-colors shadow-xs"
                  >
                    REASSIGN
                  </button>
                </div>

                {/* 4 Mini Verification Pills Proving Gate-Pass Validation */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/70">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-1 border border-border text-[11px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>IQAMA: Valid</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-1 border border-border text-[11px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Passport: Valid</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-1 border border-border text-[11px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>License: Valid</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-1 border border-border text-[11px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>TPI Cert: Valid</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3 p-4 rounded-xl border border-dashed border-border bg-surface-2/30">
                <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
                  No engineer assigned. Engineer credentials (IQAMA, Driving License, TPI Crane Certification) must be validated before dispatch to ensure Aramco/Sabic site access.
                </p>
                <button
                  onClick={() => { setShowAssignModal(true); setGatePassError(null); }}
                  className="h-9 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-sans font-bold text-xs transition-all shadow-amber-glow inline-flex items-center gap-2"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Assign Validated Engineer</span>
                </button>
              </div>
            )}
          </div>

          {/* Panel 3: Field Inspection Checklist & Evaluation */}
          <div className="relative rounded-2xl border border-border bg-surface-1 p-6 shadow-elevation hover:border-amber-500/40 transition-all space-y-5">
            <RegistrationMarks />
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div>
                <SpecimenLabel figure="SEC. 03" label="FIELD INSPECTION CHECKLIST EVALUATION" />
                <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white mt-0.5">
                  SASO / ISO 17020 Statutory Audit Protocol
                </h3>
              </div>
              {submission && <StatusBadge status={submission.result} />}
            </div>

            {!submission ? (
              <div className="space-y-4">
                {/* 4 Interactive Protocol Verification Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-surface-2/40 border border-border/80 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                      01
                    </div>
                    <div>
                      <div className="font-sans font-semibold text-xs text-slate-800 dark:text-slate-200">
                        Structural Integrity & Weld NDT
                      </div>
                      <div className="font-mono text-[10px] text-text-muted mt-0.5">
                        Magnetic Particle & Dye Penetrant joint verification
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-2/40 border border-border/80 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                      02
                    </div>
                    <div>
                      <div className="font-sans font-semibold text-xs text-slate-800 dark:text-slate-200">
                        Hoist Brake & 125% Load Hold
                      </div>
                      <div className="font-mono text-[10px] text-text-muted mt-0.5">
                        Dynamic brake slippage & 10-minute hold test
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-2/40 border border-border/80 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                      03
                    </div>
                    <div>
                      <div className="font-sans font-semibold text-xs text-slate-800 dark:text-slate-200">
                        Hydraulic Pressure & Fluid Seals
                      </div>
                      <div className="font-mono text-[10px] text-text-muted mt-0.5">
                        0-400 bar relief valve calibration & leak check
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-2/40 border border-border/80 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                      04
                    </div>
                    <div>
                      <div className="font-sans font-semibold text-xs text-slate-800 dark:text-slate-200">
                        Geotagged Photo & Serial Verification
                      </div>
                      <div className="font-mono text-[10px] text-text-muted mt-0.5">
                        Physical chassis stamp matched to Aramco register
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-surface-2/30 border border-dashed border-border">
                  <div className="text-xs text-text-muted font-sans">
                    {wo.status === 'open'
                      ? 'Work order is unassigned. Assign an engineer in SEC. 02 above to conduct physical inspection.'
                      : 'Engineer credentials validated. Ready to execute digital field inspection checklist on site.'}
                  </div>
                  {wo.status !== 'open' && (
                    <button
                      onClick={openInspectModal}
                      className="h-9 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-sans font-bold text-xs transition-all shadow-amber-glow inline-flex items-center justify-center gap-2 shrink-0"
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      <span>Launch Field Checklist</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs font-mono">
                {/* Result Callout Banner */}
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  submission.result === 'safe'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      submission.result === 'safe' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      {submission.result === 'safe' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        STATUTORY EVALUATION OUTCOME
                      </div>
                      <div className="font-display font-extrabold text-base tracking-tight">
                        ASSET CLASSIFIED AS: {submission.result.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 text-right sm:border-l sm:border-border/70 sm:pl-4">
                    <div>Audited by <strong>{submission.engineer_name}</strong></div>
                    <div>{formatDateTime(submission.submitted_at)}</div>
                  </div>
                </div>

                {/* Audited Equipment Specs */}
                <div className="p-4 border border-border/80 rounded-xl bg-surface-2/30 space-y-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Physical Equipment Specification Confirmed On-Site:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-surface-1 border border-border">
                      <span className="text-[10px] text-slate-400 block font-mono">MANUFACTURER</span>
                      <strong className="text-slate-900 dark:text-white font-sans">{submission.equipment_jsonb?.manufacturer || 'Caterpillar'}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-1 border border-border">
                      <span className="text-[10px] text-slate-400 block font-mono">MODEL</span>
                      <strong className="text-slate-900 dark:text-white font-sans">{submission.equipment_jsonb?.model || 'RT-880E'}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-1 border border-border">
                      <span className="text-[10px] text-slate-400 block font-mono">SERIAL NO.</span>
                      <strong className="text-amber-600 dark:text-amber-400 font-mono font-bold">{submission.equipment_jsonb?.serial || 'CAT-50T-88902'}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-1 border border-border">
                      <span className="text-[10px] text-slate-400 block font-mono">RATED CAPACITY</span>
                      <strong className="text-slate-900 dark:text-white font-mono">{submission.equipment_jsonb?.capacity || '50-Ton Dynamic'}</strong>
                    </div>
                  </div>
                </div>

                {/* Answered Items Grid Preview */}
                {submission.answers_jsonb && Object.keys(submission.answers_jsonb).length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Audited Verification Points:
                    </div>
                    <div className="space-y-1.5">
                      {Object.entries(submission.answers_jsonb).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-1 border border-border text-xs">
                          <span className="font-sans font-medium text-slate-700 dark:text-slate-300 capitalize">
                            {key.replace(/_/g, ' ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase ${
                            val.status === 'yes'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                              : val.status === 'no'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-border'
                          }`}>
                            {val.status === 'yes' ? 'PASSED' : val.status === 'no' ? 'FAILED' : 'N/A'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {submission.result !== 'safe' && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-rose-500" />
                    <div>
                      <div className="font-sans font-bold text-xs">Statutory Compliance Breach</div>
                      <div className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
                        Checklist failed one or more critical safety points. Certification is strictly blocked until corrective maintenance is completed and re-inspection is executed.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (span 4): Sticky Certificate Panel & Studio */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          {/* Sticky Certificate Panel */}
          <div className="relative rounded-2xl border border-border bg-surface-1 p-6 shadow-elevation space-y-5">
            <RegistrationMarks />

            <div className="border-b border-border/80 pb-3 flex items-center justify-between">
              <div>
                <SpecimenLabel figure="SEC. 04" label="STATUTORY CERTIFICATE" />
                <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                  Certification Studio
                </h3>
              </div>
              {cert && <StatusBadge status={cert.status} />}
            </div>

            {!submission ? (
              <div className="py-2">
                <IndustrialLoader
                  variant="certificate-telemetry"
                  caption="AWAITING FIELD INSPECTION SUBMISSION"
                />
                <p className="text-[11px] font-mono text-slate-400 text-center mt-3">
                  Cryptographic seal awaiting field inspection checklist submission.
                </p>
              </div>
            ) : submission.result !== 'safe' ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
                <div className="font-sans font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />
                  <span>CERTIFICATE ISSUANCE BLOCKED</span>
                </div>
                <p className="text-[11px] text-rose-600 dark:text-rose-300 leading-relaxed">
                  Field outcome was marked as <strong>{submission.result.toUpperCase()}</strong>. Statutory safety protocols prohibit issuance of SASO/ISO accreditation. Corrective actions required.
                </p>
              </div>
            ) : !cert ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <div className="font-sans font-bold text-sm text-slate-900 dark:text-white">
                    Audit Verified Nominal (SAFE)
                  </div>
                  <p className="text-xs text-text-muted max-w-xs mx-auto mt-1 leading-relaxed">
                    Proof load and NDT criteria satisfied. Ready to issue official cryptographic QR certificate.
                  </p>
                </div>
                <button
                  onClick={() => setShowCertModal(true)}
                  className="w-full h-10 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-sans font-bold text-xs transition-all shadow-amber-glow inline-flex items-center justify-center gap-2"
                >
                  <Award className="h-4 w-4" />
                  <span>ISSUE OFFICIAL CERTIFICATE</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs font-mono">
                {/* Official Certificate Visual Studio Card */}
                <div className="p-4 rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-500/5 via-surface-1 to-surface-2/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-border/80 pb-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
                      ACCREDITED TPI DOCUMENT
                    </span>
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25">
                      SAUDI SASO CERTIFIED
                    </span>
                  </div>

                  {/* High-Impact Certificate Title with Cinzel font */}
                  <div className="text-center py-1">
                    <div className="font-certificate text-xs tracking-widest font-bold text-slate-800 dark:text-slate-200 uppercase">
                      Alliance Infinite Inspection
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 uppercase mt-0.5">
                      Statutory Certificate of Conformance
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-1 border border-border/80 space-y-1.5">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">CERTIFICATE NUMBER</div>
                    <div className="font-mono text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      {cert.certificate_number}
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-1 border-t border-border/60">
                      <span className="text-slate-400">Asset Serial:</span>
                      <strong className="text-amber-600 dark:text-amber-400 font-mono">{cert.equipment_serial}</strong>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Validity:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">12 Months</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Expires:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatDate(cert.expires_at)}</strong>
                    </div>
                  </div>

                  {/* 160px QR Code with Scan Line on Hover */}
                  <div
                    onMouseEnter={() => setIsScanningQr(true)}
                    onMouseLeave={() => setIsScanningQr(false)}
                    className="relative mx-auto w-[160px] h-[160px] rounded-xl border border-border bg-white p-2.5 shadow-md overflow-hidden flex items-center justify-center cursor-pointer group transition-transform hover:scale-[1.02]"
                    title="Hover to simulate optical inspection scan"
                  >
                    <img
                      src={`http://localhost:4000/api/certificates/${cert.id}/qr.png`}
                      alt="Certificate QR"
                      className="w-full h-full object-contain"
                    />

                    {/* Signal Amber Hover Scan-Line Traveling Top to Bottom */}
                    {isScanningQr && (
                      <div className="pointer-events-none absolute left-0 right-0 h-[2px] bg-amber-500 shadow-[0_0_12px_#F59E0B] animate-scanline" />
                    )}
                  </div>

                  <div className="flex items-center justify-center">
                    <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      HOVER TO SIMULATE OPTICAL SCAN
                    </span>
                  </div>
                </div>

                {/* Download PDF & Revoke Buttons */}
                <div className="pt-2 space-y-2">
                  <a
                    href={`http://localhost:4000/api/certificates/${cert.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-9 rounded-xl border border-border bg-surface-1 hover:bg-surface-2 text-slate-900 dark:text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 shadow-xs transition-all hover:border-amber-500/40"
                  >
                    <FileText className="h-4 w-4 text-amber-500" />
                    <span>DOWNLOAD OFFICIAL PDF</span>
                  </a>

                  {cert.status === 'issued' && (
                    <button
                      onClick={() => setShowRevokeModal(true)}
                      className="w-full h-9 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-mono font-semibold transition-colors"
                    >
                      REVOKE CERTIFICATE
                    </button>
                  )}
                </div>

                {cert.status === 'revoked' && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs space-y-1">
                    <div className="font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                      Revocation Recorded in Live Registry
                    </div>
                    <div>Reason: {cert.revocation_reason}</div>
                    <div className="text-[10px] text-rose-500">Timestamp: {formatDateTime(cert.revoked_at)}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <FadeRule />

      {/* Horizontal Status Timeline */}
      <div className="relative rounded-2xl border border-border bg-surface-1 p-6 shadow-elevation space-y-4">
        <RegistrationMarks />
        <SpecimenLabel figure="SEC. 05" label="STATUTORY EXECUTION PIPELINE TIMELINE" />

        <div className="relative flex items-center justify-between pt-4 pb-2 px-4 max-w-4xl mx-auto">
          {/* Background Track Line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] bg-border select-none" />

          {/* Active Filled Track Line */}
          <div
            style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
            className="absolute left-8 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700 select-none shadow-[0_0_8px_rgba(245,158,11,0.5)]"
          />

          {steps.map((st, idx) => {
            const isDone = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={st} className="relative z-10 flex flex-col items-center">
                <div
                  className={`
                    w-7 h-7 rounded-full flex items-center justify-center font-mono text-[10px] transition-all
                    ${isDone
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : isCurrent
                        ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 font-bold shadow-amber-glow'
                        : 'bg-surface-1 border-2 border-slate-300 dark:border-slate-700 text-text-faint'
                    }
                  `}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <span
                  className={`font-mono text-[10px] uppercase tracking-wider mt-2 whitespace-nowrap ${
                    isCurrent ? 'text-amber-700 dark:text-amber-400 font-bold' : isDone ? 'text-slate-800 dark:text-slate-200' : 'text-text-faint'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: Assign Engineer with Gate-Pass Verification */}
      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <SpecimenLabel figure="MODAL" label="GATE-PASS ENGINEER ASSIGNMENT" />
                <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Designed Barrier-Gate Denial Panel */}
              {gatePassError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs space-y-3 font-sans">
                  <div className="flex items-center gap-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#BE123C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <rect x="3" y="14" width="4" height="7" rx="0.5" />
                      <line x1="5" y1="14" x2="21" y2="7" strokeWidth="2" strokeDasharray="3 2" />
                      <circle cx="5" cy="14" r="1.5" fill="#BE123C" />
                      <line x1="21" y1="7" x2="21" y2="12" />
                    </svg>
                    <div>
                      <div className="font-sans font-bold text-sm tracking-tight text-rose-900 dark:text-rose-100">
                        GATE-PASS ACCESS DENIED (422)
                      </div>
                      <div className="text-[11px] text-rose-700 dark:text-rose-400 font-mono">
                        BARRIER LOCKDOWN: STATUTORY COMPLIANCE VIOLATION
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed">
                    Industrial security protocols prohibit dispatching this engineer to site due to expired or missing credentials:
                  </p>

                  <div className="bg-rose-100/60 dark:bg-rose-900/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-800 font-mono text-[11px] space-y-1">
                    {gatePassError.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span>• {item.displayName || item.documentType}:</span>
                        <span className="font-semibold text-rose-800 dark:text-rose-300">EXPIRED ({formatDate(item.expiryDate)})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleAssignEngineer} className="space-y-4 text-xs font-sans">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Select Certified Field Inspector:
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewEngineerModal(true)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold text-xs inline-flex items-center gap-1"
                    >
                      <span>+ Onboard New Inspector</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(data?.availableEngineers && data.availableEngineers.length > 0) ? (
                      data.availableEngineers.map((eng) => (
                        <label
                          key={eng.id}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                            selectedEngineerId === eng.id
                              ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="eng"
                            value={eng.id}
                            checked={selectedEngineerId === eng.id}
                            onChange={() => setSelectedEngineerId(eng.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-sans font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{eng.name} (Field Inspector)</span>
                              {eng.has_expired_docs ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-mono font-bold">
                                  EXPIRED IQAMA
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                                  ALL VALID
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
                              {eng.has_expired_docs
                                ? 'Expired credential on file. Will trigger designed 422 barrier gate-pass denial.'
                                : 'IQAMA and Driving License valid. Assignment passes site security.'}
                            </div>
                          </div>
                        </label>
                      ))
                    ) : (
                      <div className="text-slate-400 p-3 text-center">Loading registered engineers…</div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={assigning || !selectedEngineerId}
                    className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold text-xs shadow-xs disabled:opacity-50 transition-all"
                  >
                    {assigning ? 'VERIFYING CREDENTIALS...' : 'CONFIRM ASSIGNMENT'}
                  </button>
                </div>
              </form>

              {/* Sub-Modal: Quick Onboard Engineer */}
              {showNewEngineerModal && (
                <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-[#14171B] border border-slate-300 dark:border-slate-800 rounded-xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white">
                        Onboard Field Inspector
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowNewEngineerModal(false)}
                        className="text-slate-400 hover:text-slate-700 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleQuickAddEngineer} className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                          Engineer Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newEngineerForm.name}
                          onChange={(e) => setNewEngineerForm({ ...newEngineerForm, name: e.target.value })}
                          placeholder="e.g. Eng. Tariq Al-Otaibi"
                          className="w-full h-8 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={newEngineerForm.email}
                          onChange={(e) => setNewEngineerForm({ ...newEngineerForm, email: e.target.value })}
                          placeholder="tariq@alliance-tpi.sa"
                          className="w-full h-8 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                          Contact Phone
                        </label>
                        <input
                          type="text"
                          value={newEngineerForm.phone}
                          onChange={(e) => setNewEngineerForm({ ...newEngineerForm, phone: e.target.value })}
                          placeholder="+966 50 123 4567"
                          className="w-full h-8 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setShowNewEngineerModal(false)}
                          className="h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={addingEngineer}
                          className="h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs disabled:opacity-50"
                        >
                          {addingEngineer ? 'Saving…' : 'Save & Select'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Inspection Checklist Dialog with 32px Square Segmented Buttons */}
      <AnimatePresence>
        {showInspectModal && checklist && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <SpecimenLabel figure="EVALUATION" label="TECHNICAL FIELD CHECKLIST" />
                  <h2 className="font-sans text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    Category: <span className="uppercase">{checklist.equipment_type}</span>
                  </h2>
                </div>
                <button onClick={() => setShowInspectModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {inspectError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-sans">
                  {inspectError}
                </div>
              )}

              <form onSubmit={handleSubmitInspection} className="space-y-4 text-xs font-sans">
                {/* Equipment Physical Identification */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    Equipment Physical Identification:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Manufacturer</label>
                      <input
                        type="text"
                        required
                        value={equipmentForm.manufacturer}
                        onChange={(e) => setEquipmentForm({ ...equipmentForm, manufacturer: e.target.value })}
                        className="w-full h-8 px-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Model</label>
                      <input
                        type="text"
                        required
                        value={equipmentForm.model}
                        onChange={(e) => setEquipmentForm({ ...equipmentForm, model: e.target.value })}
                        className="w-full h-8 px-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Serial Number *</label>
                      <input
                        type="text"
                        required
                        value={equipmentForm.serial}
                        onChange={(e) => setEquipmentForm({ ...equipmentForm, serial: e.target.value })}
                        className="w-full h-8 px-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Checklist Question Rows with Segmented Buttons */}
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                  <div className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-2">
                    Checklist Items Verification:
                  </div>
                  {(checklist.items_jsonb || []).map((item, idx) => {
                    const currentAns = answers[item.key]?.status || 'yes';
                    const isFailing = currentAns === 'no';

                    return (
                      <div
                        key={item.key}
                        className={`relative p-3 rounded-xl border transition-colors ${
                          isFailing
                            ? 'border-rose-300 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40'
                        }`}
                      >
                        {isFailing && (
                          <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-rose-600 rounded-l-xl" />
                        )}

                        <div className="flex items-center justify-between gap-4">
                          <span className="font-sans font-medium text-xs text-slate-900 dark:text-white">
                            {idx + 1}. {item.label}
                          </span>

                          {/* Segmented control buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            {['yes', 'no', 'na'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleAnswerChange(item.key, opt)}
                                className={`
                                  w-9 h-8 rounded-lg border font-mono text-[11px] uppercase tracking-wider font-bold flex items-center justify-center transition-all
                                  ${currentAns === opt
                                    ? opt === 'no'
                                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                      : 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-xs'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}
                                `}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Outcome Selection */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Inspection Outcome:
                    </label>
                    {hasFailingAnswers && (
                      <span className="text-[11px] font-sans text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>BLOCKED: 1+ ITEM MARKED NO</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={hasFailingAnswers}
                      onClick={() => setResultOutcome('safe')}
                      className={`
                        p-2.5 rounded-xl border text-center font-sans font-bold text-xs transition-all
                        ${hasFailingAnswers ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-100 dark:bg-slate-800' : ''}
                        ${resultOutcome === 'safe' && !hasFailingAnswers ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'}
                      `}
                    >
                      SAFE (PASSED)
                    </button>

                    <button
                      type="button"
                      onClick={() => setResultOutcome('conditional')}
                      className={`
                        p-2.5 rounded-xl border text-center font-sans font-bold text-xs transition-all
                        ${resultOutcome === 'conditional' ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'}
                      `}
                    >
                      CONDITIONAL
                    </button>

                    <button
                      type="button"
                      onClick={() => setResultOutcome('unsafe')}
                      className={`
                        p-2.5 rounded-xl border text-center font-sans font-bold text-xs transition-all
                        ${resultOutcome === 'unsafe' ? 'bg-rose-600 text-white border-rose-700 shadow-xs' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'}
                      `}
                    >
                      UNSAFE (FAILED)
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowInspectModal(false)}
                    className="h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInspect}
                    className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold text-xs shadow-xs disabled:opacity-50 transition-all"
                  >
                    {submittingInspect ? 'SUBMITTING CHECKLIST...' : 'COMMIT EVALUATION'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Issue Certificate Dialog */}
      <AnimatePresence>
        {showCertModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] max-w-md w-full p-6 shadow-2xl space-y-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <SpecimenLabel figure="CERTIFICATE" label="ISSUE ACCREDITED CERTIFICATE" />
                <button onClick={() => setShowCertModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleIssueCertificate} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Accredited Certificate Type:
                  </label>
                  <select
                    value={certType}
                    onChange={(e) => setCertType(e.target.value)}
                    className="w-full h-9 px-3 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
                  >
                    <option value="safety_compliance">Safety Compliance (SASO / ISO 17020)</option>
                    <option value="operational_efficiency">Operational Efficiency</option>
                    <option value="environmental_conformance">Environmental Conformance</option>
                    <option value="quality_assurance">Quality Assurance</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  Will sign cryptographic JWT, embed public QR verification code, render official PDF with watermark, and register to Alliance Infinite live registry.
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCertModal(false)}
                    className="h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={issuingCert}
                    className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold text-xs shadow-xs disabled:opacity-50 transition-all"
                  >
                    {issuingCert ? 'ISSUING & RENDERING...' : 'CONFIRM & SIGN CERTIFICATE'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: Revoke Certificate Confirmation Dialog */}
      <AnimatePresence>
        {showRevokeModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] max-w-md w-full p-6 shadow-2xl space-y-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <SpecimenLabel figure="REVOCATION" label="PERMANENT CERTIFICATE REVOCATION" />
                <button onClick={() => setShowRevokeModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs space-y-1 font-sans">
                <div className="font-bold uppercase">Warning: Irreversible Regulatory Action</div>
                <p className="text-[11px]">
                  Revoking this certificate immediately updates the public registry. Anyone scanning the physical QR code will see a live RED REVOKED status.
                </p>
              </div>

              <form onSubmit={handleRevokeCertificate} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Mandatory Revocation Reason:
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-hidden font-medium"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowRevokeModal(false)}
                    className="h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={revoking}
                    className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-sans font-bold text-xs shadow-xs disabled:opacity-50 flex items-center gap-2 transition-colors"
                  >
                    {revoking && <MachineLoader scene="press" size={16} />}
                    <span>COMMIT REVOCATION</span>
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
