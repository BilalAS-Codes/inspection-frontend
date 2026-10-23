'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { PageHeader } from '../../../components/page-header';
import { RegistrationMarks, SpecimenLabel } from '../../../components/engineering';
import { MachineLoader } from '../../../components/machine-loader';
import {
  Download,
  Users,
  Building,
  ShieldCheck,
  MapPin,
  Layers,
  Calendar,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Analytical Reports Page conforming to Proposal Module 8:
 * - Rail of report types: Engineer, Client, Branch, Category, Certificate
 * - Date Range Filter (All Time, MTD, YTD, Custom)
 * - Multi-format export: CSV, Excel (.csv UTF-8 BOM), Tabular PDF
 * - Live preview data table
 */
export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('engineer');
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf'); // 'pdf' | 'csv' | 'excel'
  const [timestamp, setTimestamp] = useState('');

  // Date filters
  const [datePreset, setDatePreset] = useState('all'); // 'all' | 'mtd' | 'ytd' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const REPORT_RAIL = [
    {
      id: 'engineer',
      code: 'REP-01',
      title: 'ENGINEER PRODUCTIVITY',
      subtitle: 'Inspection completion rates & work orders',
      icon: Users,
      endpoint: 'by-engineer'
    },
    {
      id: 'client',
      code: 'REP-02',
      title: 'CLIENT BILLING AUDIT',
      subtitle: 'Invoiced, paid & outstanding SAR balances',
      icon: Building,
      endpoint: 'by-client'
    },
    {
      id: 'branch',
      code: 'REP-03',
      title: 'BRANCH / SITE WORKLOAD',
      subtitle: 'Jobs per geographic site & client reach',
      icon: MapPin,
      endpoint: 'by-branch'
    },
    {
      id: 'category',
      code: 'REP-04',
      title: 'EQUIPMENT CATEGORIES',
      subtitle: 'Lifting, petroleum, trailer & forklift pass rates',
      icon: Layers,
      endpoint: 'by-category'
    },
    {
      id: 'certificate',
      code: 'REP-05',
      title: 'CERTIFICATE BREAKDOWN',
      subtitle: 'Statutory compliance & revocation counts',
      icon: ShieldCheck,
      endpoint: 'by-certificate-status'
    }
  ];

  const currentReportConfig = REPORT_RAIL.find(r => r.id === selectedReport) || REPORT_RAIL[0];

  // Set date preset helpers
  const applyPreset = (preset) => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'mtd') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(today);
    } else if (preset === 'ytd') {
      const firstDay = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(today);
    }
  };

  // Fetch preview data whenever report or dates change
  useEffect(() => {
    setTimestamp(new Date().toLocaleString('en-US', { timeZoneName: 'short' }));

    if (selectedReport === 'certificate') {
      setPreviewLoading(true);
      apiFetch('/api/reports/by-certificate-status')
        .then((res) => setStatusBreakdown(res.statusBreakdown || []))
        .catch(() => toast.error('Failed to load certificate breakdown.'))
        .finally(() => setPreviewLoading(false));
    } else {
      setPreviewLoading(true);
      const params = new URLSearchParams({ format: 'json' });
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      apiFetch(`/api/reports/${currentReportConfig.endpoint}?${params.toString()}`)
        .then((res) => {
          setPreviewData(res.data || []);
        })
        .catch(() => toast.error('Failed to load report preview.'))
        .finally(() => setPreviewLoading(false));
    }
  }, [selectedReport, startDate, endDate]);

  const handleExport = (format) => {
    setIsExporting(true);
    setExportFormat(format);

    const params = new URLSearchParams({ format });
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const url = `/api/reports/${currentReportConfig.endpoint}?${params.toString()}`;
    const filename = `${currentReportConfig.endpoint}_report.${format === 'pdf' ? 'pdf' : 'csv'}`;

    apiFetch(url, { responseType: 'blob' })
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        toast.success(`${format.toUpperCase()} export generated successfully.`);
      })
      .catch((err) => {
        toast.error(err.message || 'Export failed.');
      })
      .finally(() => {
        setIsExporting(false);
      });
  };

  return (
    <div className="space-y-6 select-none">
      <PageHeader
        title="Statutory Reports & Analytics"
        description="Comprehensive statutory reports for operations, client revenue, geographic branches, equipment categories, and certification compliance."
      />

      {/* Main Layout: Left Rail of Report Types + Large Right Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Rail (span 4): Mono Report Selectors */}
        <div className="lg:col-span-4 space-y-4">
          <div className="space-y-2">
            <SpecimenLabel figure="RAIL" label="REPORT PROTOCOLS" />
            <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] p-2 space-y-1 shadow-xs">
              {REPORT_RAIL.map((rep) => {
                const Icon = rep.icon;
                const isActive = selectedReport === rep.id;

                return (
                  <button
                    key={rep.id}
                    onClick={() => setSelectedReport(rep.id)}
                    className={`
                      w-full text-left p-3 rounded-lg transition-all flex items-start gap-3 relative
                      ${isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border border-slate-300 dark:border-slate-700 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white border border-transparent'}
                    `}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-[3.5px] bg-blue-600 dark:bg-blue-500 rounded-r-full" />
                    )}

                    <Icon
                      className={`h-4 w-4 shrink-0 mt-0.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
                      strokeWidth={1.85}
                    />

                    <div>
                      <div className="font-mono text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 font-semibold">
                        <span>{rep.code}</span>
                        <span>·</span>
                        <span>{rep.title}</span>
                      </div>
                      <div className="font-sans text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {rep.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Filter Panel */}
          {selectedReport !== 'certificate' && (
            <div className="space-y-2">
              <SpecimenLabel figure="FILTER" label="DATE RANGE INTERVAL" />
              <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] p-3 space-y-3 shadow-xs text-xs">
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'all', label: 'ALL TIME' },
                    { id: 'mtd', label: 'MTD' },
                    { id: 'ytd', label: 'YTD' },
                    { id: 'custom', label: 'CUSTOM' }
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      className={`px-2.5 py-1 rounded-md font-mono text-[11px] uppercase transition-colors ${
                        datePreset === preset.id
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {datePreset === 'custom' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-500">From Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full mt-1 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-500">To Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full mt-1 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Large Right Canvas (span 8): Report Content & Multi-Format Downloader */}
        <div className="lg:col-span-8 space-y-4">
          <SpecimenLabel figure="DATA" label="REPORT PREVIEW & EXPORT SUITE" />

          <div className="relative rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.06)] space-y-6">
            <RegistrationMarks />

            {/* Generated At Header & Export Action Suite */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="font-sans text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedReport === 'engineer' && 'Engineer Inspection Performance'}
                  {selectedReport === 'client' && 'Corporate Client Revenue & Invoicing'}
                  {selectedReport === 'branch' && 'Branch & Operational Location Workload'}
                  {selectedReport === 'category' && 'Equipment Classification & Compliance'}
                  {selectedReport === 'certificate' && 'Certificate Status Distribution'}
                </h2>
                <div className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-1">
                  GENERATED AT: {timestamp} · {startDate && endDate ? `${startDate} to ${endDate}` : 'ALL TIME'}
                </div>
              </div>

              {selectedReport !== 'certificate' && (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* PDF Export */}
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-sans font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isExporting && exportFormat === 'pdf' ? (
                      <MachineLoader scene="propeller" size={16} />
                    ) : (
                      <FileText className="h-3.5 w-3.5" />
                    )}
                    <span>PDF REPORT</span>
                  </button>

                  {/* Excel Export */}
                  <button
                    onClick={() => handleExport('excel')}
                    disabled={isExporting}
                    className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-sans font-medium text-xs shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isExporting && exportFormat === 'excel' ? (
                      <MachineLoader scene="propeller" size={16} />
                    ) : (
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                    <span>EXCEL</span>
                  </button>

                  {/* CSV Export */}
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={isExporting}
                    className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-sans font-medium text-xs shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isExporting && exportFormat === 'csv' ? (
                      <MachineLoader scene="propeller" size={16} />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    <span>CSV</span>
                  </button>
                </div>
              )}
            </div>

            {/* Live Data Preview Table */}
            {previewLoading ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <MachineLoader scene="propeller" size={70} caption="RETRIEVING REPORT TELEMETRY…" />
              </div>
            ) : selectedReport === 'certificate' ? (
              <div className="space-y-4 font-sans text-xs">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 space-y-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Live Status Distribution Breakdown:
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-1">
                    {statusBreakdown.map((row) => (
                      <div key={row.status} className="p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">{row.status}</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{row.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : previewData.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-mono">
                NO RECORDS FOUND FOR THE SELECTED DATE RANGE
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-sans text-[11px] uppercase tracking-wider font-bold">
                      {selectedReport === 'engineer' && (
                        <>
                          <th className="py-2.5 px-4">Engineer</th>
                          <th className="py-2.5 px-4">Email</th>
                          <th className="py-2.5 px-4 text-center">Completed</th>
                          <th className="py-2.5 px-4 text-center">In Progress</th>
                          <th className="py-2.5 px-4 text-center">Total Assigned</th>
                        </>
                      )}
                      {selectedReport === 'client' && (
                        <>
                          <th className="py-2.5 px-4">Client Name</th>
                          <th className="py-2.5 px-4 text-center">Invoices</th>
                          <th className="py-2.5 px-4 text-right">Paid Revenue (SAR)</th>
                          <th className="py-2.5 px-4 text-right">Outstanding (SAR)</th>
                          <th className="py-2.5 px-4 text-right">Total Billed (SAR)</th>
                        </>
                      )}
                      {selectedReport === 'branch' && (
                        <>
                          <th className="py-2.5 px-4">Branch / Site Location</th>
                          <th className="py-2.5 px-4 text-center">Total Jobs</th>
                          <th className="py-2.5 px-4 text-center">Completed</th>
                          <th className="py-2.5 px-4 text-center">In Progress</th>
                          <th className="py-2.5 px-4 text-center">Open</th>
                          <th className="py-2.5 px-4 text-center">Clients</th>
                        </>
                      )}
                      {selectedReport === 'category' && (
                        <>
                          <th className="py-2.5 px-4">Category</th>
                          <th className="py-2.5 px-4 text-center">Work Orders</th>
                          <th className="py-2.5 px-4 text-center">Inspections</th>
                          <th className="py-2.5 px-4 text-center">Safe (Passed)</th>
                          <th className="py-2.5 px-4 text-center">Unsafe</th>
                          <th className="py-2.5 px-4 text-center">Certs Issued</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        {selectedReport === 'engineer' && (
                          <>
                            <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">{row.engineer_name}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-500">{row.engineer_email}</td>
                            <td className="py-2.5 px-4 text-center font-mono font-medium text-emerald-600 dark:text-emerald-400">{row.jobs_completed}</td>
                            <td className="py-2.5 px-4 text-center font-mono font-medium text-amber-600 dark:text-amber-400">{row.jobs_in_progress}</td>
                            <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">{row.total_assigned}</td>
                          </>
                        )}
                        {selectedReport === 'client' && (
                          <>
                            <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">{row.client_name || 'N/A'}</td>
                            <td className="py-2.5 px-4 text-center font-mono">{row.total_invoices}</td>
                            <td className="py-2.5 px-4 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                              {Number(row.paid_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-medium text-amber-600 dark:text-amber-400">
                              {Number(row.outstanding_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                              {Number(row.total_billed).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                          </>
                        )}
                        {selectedReport === 'branch' && (
                          <>
                            <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">{row.branch_location}</td>
                            <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">{row.total_jobs}</td>
                            <td className="py-2.5 px-4 text-center font-mono font-medium text-emerald-600 dark:text-emerald-400">{row.completed_jobs}</td>
                            <td className="py-2.5 px-4 text-center font-mono font-medium text-amber-600 dark:text-amber-400">{row.in_progress_jobs}</td>
                            <td className="py-2.5 px-4 text-center font-mono font-medium text-blue-600 dark:text-blue-400">{row.open_jobs}</td>
                            <td className="py-2.5 px-4 text-center font-mono">{row.clients_served}</td>
                          </>
                        )}
                        {selectedReport === 'category' && (
                          <>
                            <td className="py-2.5 px-4 font-semibold uppercase text-slate-900 dark:text-white">{row.category}</td>
                            <td className="py-2.5 px-4 text-center font-mono">{row.total_work_orders}</td>
                            <td className="py-2.5 px-4 text-center font-mono">{row.total_inspections}</td>
                            <td className="py-2.5 px-4 text-center font-mono font-medium text-emerald-600 dark:text-emerald-400">{row.safe_inspections}</td>
                            <td className="py-2.5 px-4 text-center font-mono font-medium text-rose-600 dark:text-rose-400">{row.unsafe_inspections}</td>
                            <td className="py-2.5 px-4 text-center font-mono font-bold text-blue-600 dark:text-blue-400">{row.certificates_issued}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer with statement info */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-sans text-slate-500 dark:text-slate-400 font-medium">
              <span>STATUTORY REPORTING SUITE · CSV / EXCEL / PDF READY</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                SQL CURSOR READY · 30S STATEMENT TIMEOUT
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

