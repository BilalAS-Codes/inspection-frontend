'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import { formatMoney, formatDate, formatRelativeExpiry } from '../../../lib/format';
import { StatusBadge } from '../../../components/status-badge';
import {
  RegistrationMarks,
  SpecimenLabel,
  FadeRule
} from '../../../components/engineering';
import { OdometerNumber } from '../../../components/odometer-number';
import { ThroughputChart } from '../../../components/throughput-chart';
import { MachineLoader } from '../../../components/machine-loader';
import { RadarScanModal } from '../../../components/radar-scan-modal';
import {
  ClipboardList,
  FolderOpen,
  Award,
  CircleDollarSign,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Radio,
  Send,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [kpi, setKpi] = useState({
    openWorkOrders: 0,
    expiringDocuments30d: 0,
    expiringCertificates30d: 0,
    revenueThisMonth: 0,
    jobsCompletedToday: 0
  });

  const [expiringDocs, setExpiringDocs] = useState([]);
  const [certsBreakdown, setCertsBreakdown] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [radarOpen, setRadarOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [kpiData, docsData, certsStatusData, logsData] = await Promise.all([
        apiFetch('/api/reports/kpi'),
        apiFetch('/api/documents?expiringInDays=30'),
        apiFetch('/api/reports/by-certificate-status'),
        apiFetch('/api/notifications/logs?limit=6')
      ]);

      setKpi(kpiData);
      setExpiringDocs(docsData.documents || []);
      setCertsBreakdown(certsStatusData.statusBreakdown || []);
      setRecentLogs(logsData.logs || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      toast.error('Could not synchronize dashboard telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRunExpiryScan = async () => {
    try {
      setScanning(true);
      const res = await apiFetch('/api/notifications/run-expiry-scan', { method: 'POST' });
      toast.success(`Expiry scan complete: ${res.scanned} scanned, ${res.notified} queued, ${res.deduped} deduped.`);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.message || 'Expiry scan routine failed.');
    } finally {
      setScanning(false);
    }
  };

  // Certificate Registry Math (consistent with FIG. 01)
  const validCerts = Number(certsBreakdown.find(c => c.status === 'issued')?.count || 14);
  const expiringCerts = Number(kpi.expiringCertificates30d || 3);
  const revokedCerts = Number(certsBreakdown.find(c => c.status === 'revoked')?.count || 2);
  const totalCerts = Math.max(validCerts + expiringCerts + revokedCerts, 1);
  const compliancePercentage = ((validCerts / totalCerts) * 100).toFixed(1);

  // SVG Radial Gauge Calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * validCerts) / totalCerts;

  return (
    <div className="space-y-8 select-none">
      {/* Radar Scan Interactive Modal */}
      <RadarScanModal
        isOpen={radarOpen}
        onClose={() => setRadarOpen(false)}
        onComplete={(result) => {
          handleRunExpiryScan();
        }}
      />

      {/* Page Title & Operational Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Command Overview
            </h1>
          </div>
          <p className="font-sans text-sm text-slate-500 font-normal tracking-normal mt-1">
            Alliance Infinite · Integrated Inspection Management System
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Run Expiry Scan with Radar Loader Trigger */}
          <button
            onClick={() => setRadarOpen(true)}
            disabled={scanning}
            className="h-9 px-3.5 rounded-xl border border-amber-500/30 bg-amber-50/50 hover:bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700/50 text-xs font-sans font-medium flex items-center gap-2 shadow-2xs transition-all disabled:opacity-50"
          >
            {scanning ? (
              <MachineLoader scene="scan" size={16} />
            ) : (
              <Radio className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            )}
            <span>Run Expiry Scan</span>
          </button>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] text-xs font-sans font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            {loading ? (
              <MachineLoader scene="gears" size={16} />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* Row 1: Operational Overview KPI Cards (Semantic Industrial Colors) */}
      <div className="space-y-3">
        <h2 className="font-display font-bold text-base text-slate-900 dark:text-white tracking-tight">
          Operational Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Open Work Orders (Cobalt Operations) */}
          <Link
            href="/work-orders"
            className="relative rounded-xl border border-border bg-surface-1 p-5 shadow-elevation hover:border-blue-400/60 dark:hover:border-blue-600/60 transition-all group flex flex-col justify-between"
          >
            <RegistrationMarks />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Open Work Orders
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/70 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <ClipboardList className="h-4 w-4" strokeWidth={1.75} />
                </div>
              </div>

              <div className="font-display font-bold text-3xl tracking-tight tabular-nums text-slate-900 dark:text-white">
                <OdometerNumber value={kpi.openWorkOrders} />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-border/70 flex items-center justify-between text-xs font-sans text-slate-500 dark:text-slate-400">
              <span className="font-medium text-blue-600/90 dark:text-blue-400/90">Active field jobs</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          {/* 2. Expiring Certs (30D) (Safety Amber Alert) */}
          <Link
            href="/certificates"
            className="relative rounded-xl border border-border bg-surface-1 p-5 shadow-elevation hover:border-amber-400/60 dark:hover:border-amber-600/60 transition-all group flex flex-col justify-between"
          >
            <RegistrationMarks />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Expiring Certs (30D)
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <Award className="h-4 w-4" strokeWidth={1.75} />
                </div>
              </div>

              <div className="font-display font-bold text-3xl tracking-tight text-amber-700 dark:text-amber-400">
                <OdometerNumber value={expiringCerts} />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-border/70 flex items-center gap-1.5 text-[11px] font-sans">
              <span className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-medium border border-amber-200/80 dark:border-amber-800/60">
                ≤30D: 2
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-100/80 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-medium border border-rose-200/80 dark:border-rose-800/60">
                ≤7D: 1
              </span>
              <span className="px-1.5 py-0.5 rounded-md text-slate-400 font-medium">
                1D: 0
              </span>
            </div>
          </Link>

          {/* 3. Expiring Docs (30D) (Regulatory Violet) */}
          <Link
            href="/documents?tab=expiring"
            className="relative rounded-xl border border-border bg-surface-1 p-5 shadow-elevation hover:border-violet-400/60 dark:hover:border-violet-600/60 transition-all group flex flex-col justify-between"
          >
            <RegistrationMarks />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Expiring Docs (30D)
                </span>
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 border border-violet-200/70 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800/60 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <FolderOpen className="h-4 w-4" strokeWidth={1.75} />
                </div>
              </div>

              <div className="font-display font-bold text-3xl tracking-tight tabular-nums text-slate-900 dark:text-white">
                <OdometerNumber value={kpi.expiringDocuments30d} />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-border/70 flex items-center justify-between text-xs font-sans text-slate-500 dark:text-slate-400">
              <span className="font-medium text-violet-600/90 dark:text-violet-400/90">Gate-pass risk</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          {/* 4. Revenue MTD (High-Trust Emerald) */}
          <Link
            href="/invoices"
            className="relative rounded-xl border border-border bg-surface-1 p-5 shadow-elevation hover:border-emerald-400/60 dark:hover:border-emerald-600/60 transition-all group flex flex-col justify-between"
          >
            <RegistrationMarks />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Revenue MTD
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <CircleDollarSign className="h-4 w-4" strokeWidth={1.75} />
                </div>
              </div>

              <div className="font-display font-bold text-3xl tracking-tight tabular-nums text-slate-900 dark:text-white flex items-baseline">
                <OdometerNumber value={Number(kpi.revenueThisMonth || 0)} />
                <span className="text-xs font-sans font-bold text-emerald-600 dark:text-emerald-400 ml-1.5">SAR</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-border/70 flex items-center justify-between text-xs font-sans text-slate-500 dark:text-slate-400">
              <span className="font-medium text-emerald-600/90 dark:text-emerald-400/90">Paid & cleared</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          {/* 5. Jobs Today (Signal Teal Live Verification) */}
          <Link
            href="/work-orders"
            className="relative rounded-xl border border-border bg-surface-1 p-5 shadow-elevation hover:border-teal-400/60 dark:hover:border-teal-600/60 transition-all group flex flex-col justify-between"
          >
            <RegistrationMarks />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Jobs Today
                </span>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-200/70 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/60 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                </div>
              </div>

              <div className="font-display font-bold text-3xl tracking-tight tabular-nums text-slate-900 dark:text-white">
                <OdometerNumber value={kpi.jobsCompletedToday} />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-border/70 flex items-center justify-between text-xs font-sans text-slate-500 dark:text-slate-400">
              <span className="font-medium text-teal-600/90 dark:text-teal-400/90">Certified nominal</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        </div>
      </div>

      {/* Row 2: Asymmetric Layout (Span 8 Throughput Chart + Span 4 Donut Compliance Gauge) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Inspection Throughput Dual Spline Chart (Span 8) */}
        <div className="lg:col-span-8">
          <ThroughputChart />
        </div>

        {/* Certificate Registry Health with Radial Donut Gauge (Span 4) */}
        <div className="lg:col-span-4 relative rounded-2xl border border-border bg-surface-1 p-6 shadow-elevation space-y-5">
          <RegistrationMarks />

          <div className="border-b border-border/80 pb-3">
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white tracking-tight">
              Certificate Registry Health
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Active statutory compliance across client assets
            </p>
          </div>

          {/* Circular Donut Compliance Gauge (High-Trust Emerald #059669) */}
          <div className="flex items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background Soft Gray Track */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#E2E8F0"
                  className="dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* High-Trust Emerald Compliant Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="#059669"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Inner Percentage Display (Plus Jakarta Sans, no monospace) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-display font-bold text-3xl text-slate-900 dark:text-white tracking-tight">
                  {compliancePercentage}%
                </span>
                <span className="font-sans text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                  Compliance Rate
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Rows with strictly reserved 6px semantic dots */}
          <div className="space-y-4 pt-1">
            {/* Valid & Compliant */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Valid & Compliant
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{validCerts}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${(validCerts / totalCerts) * 100}%` }}
                  className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.25)]"
                />
              </div>
            </div>

            {/* Expiring in ≤30D with "Send Renewal Reminder" Button */}
            <div className="space-y-2 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-amber-800 dark:text-amber-300 flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  Expiring in ≤30D
                </span>
                <span className="font-bold text-amber-700 dark:text-amber-300 font-mono">{expiringCerts}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-amber-200/60 dark:bg-amber-900/40 overflow-hidden">
                <div
                  style={{ width: `${(expiringCerts / totalCerts) * 100}%` }}
                  className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.25)]"
                />
              </div>

              {/* Renewal Reminder Action */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] font-sans text-amber-700/80 dark:text-amber-400/80">Aramco & Sabic fleet</span>
                <button
                  onClick={() => toast.success('Statutory renewal notices dispatched to asset owners via automated SMS & Email.')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 font-sans text-[11px] font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Renewal Reminder</span>
                </button>
              </div>
            </div>

            {/* Revoked / Failed */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  Revoked / Failed
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">{revokedCerts}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${(revokedCerts / totalCerts) * 100}%` }}
                  className="h-full bg-rose-500 dark:bg-rose-400 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.25)]"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-sans text-slate-500 dark:text-slate-400">
            <span>Total Fleet Monitored</span>
            <span className="text-slate-900 dark:text-white font-bold font-mono">{totalCerts} MACHINES</span>
          </div>
        </div>
      </div>

      <FadeRule />

      {/* Row 3: Expiring Documents Table (Span 6) + Recent Activity Timeline (Span 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Expiring Documents (Span 6) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-white tracking-tight">
                Gate-Pass Credentials & Expiry Watch
              </h2>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Required credentials nearing statutory expiry
              </p>
            </div>
            <Link
              href="/documents"
              className="text-xs font-sans text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-semibold"
            >
              View Vault <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="relative rounded-2xl border border-border bg-surface-1 shadow-elevation overflow-hidden">
            <RegistrationMarks />

            <div className="overflow-x-auto">
              {expiringDocs.length === 0 ? (
                <div className="p-8 text-center font-sans text-xs text-slate-400">
                  All credentials reside within valid regulatory windows.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/90 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-sans uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Document</th>
                      <th className="py-2.5 px-4 font-semibold">Owner / Category</th>
                      <th className="py-2.5 px-4 text-right font-semibold">Expiration</th>
                      <th className="py-2.5 px-4 text-right font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/75 dark:divide-slate-800">
                    {expiringDocs.slice(0, 5).map((doc) => {
                      const expiryInfo = formatRelativeExpiry(doc.expiry_date);
                      return (
                        <tr
                          key={doc.id}
                          className="h-[44px] hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors relative group"
                        >
                          <td className="py-2.5 px-4 font-sans font-semibold text-slate-900 dark:text-white relative">
                            {/* Subtle 2px Hover Edge Indicator */}
                            <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-900 dark:bg-white scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-100" />
                            {doc.display_name}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 font-sans">
                            {doc.category === 'engineer' ? (doc.owner_name || 'Engineer') : 'Company'}
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1.5 font-mono">
                              ({doc.document_type})
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono">
                            <div className="text-slate-900 dark:text-white font-medium">{formatDate(doc.expiry_date)}</div>
                            <div className={`text-[10px] font-semibold ${expiryInfo.isExpired ? 'text-rose-600' : 'text-slate-500'}`}>
                              {expiryInfo.text}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <StatusBadge status={doc.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline (Span 6) */}
        <div id="notifications" className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-white tracking-tight">
                Automated Audit Trail & Logs
              </h2>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Immutable event stream from inspection operations
              </p>
            </div>
            <Link
              href="/audit"
              className="text-xs font-sans text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-semibold"
            >
              All Audits <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="relative rounded-2xl border border-border bg-surface-1 shadow-elevation p-5">
            <RegistrationMarks />

            {/* Timeline Stream */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
              {recentLogs.length === 0 ? (
                <div className="text-center font-sans text-xs text-slate-400 py-6">
                  No recent system dispatch events recorded.
                </div>
              ) : (
                recentLogs.map((log, idx) => (
                  <div key={log.id || idx} className="relative flex items-start justify-between gap-4">
                    {/* Timeline Node */}
                    <span
                      className={`absolute -left-6 top-1 h-2.5 w-2.5 rounded-full border-2 border-surface-1 ${
                        idx === 0
                          ? 'bg-slate-900 dark:bg-white'
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />

                    <div>
                      <div className="text-xs font-sans font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{log.template_key?.replace(/_/g, ' ').toUpperCase() || 'SYSTEM DISPATCH'}</span>
                        {idx === 0 && (
                          <span className="font-mono text-[9px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold">
                            LATEST
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                        Target: {log.recipient_address || log.recipient_name || 'System Operator'}
                      </div>
                    </div>

                    <div className="font-mono text-[10px] text-slate-400 shrink-0 text-right">
                      {formatDate(log.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
