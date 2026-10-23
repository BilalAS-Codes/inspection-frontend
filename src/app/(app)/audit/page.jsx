'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { formatDateTime } from '../../../lib/format';
import { StatusBadge } from '../../../components/status-badge';
import { EmptyState } from '../../../components/empty-state';
import { MachineLoader } from '../../../components/machine-loader';
import { RegistrationMarks } from '../../../components/engineering/registration-marks';
import { SpecimenLabel } from '../../../components/engineering/specimen-label';
import { FadeRule } from '../../../components/engineering/fade-rule';
import { ScrollText, ChevronDown, ChevronRight, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const url = entityFilter ? `/api/audit-logs?entityType=${entityFilter}` : '/api/audit-logs';
      const res = await apiFetch(url);
      setLogs(res.auditLogs || []);
    } catch (err) {
      toast.error('Failed to load audit trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [entityFilter]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 select-none">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Security & Audit Ledger
            </h1>
          </div>
          <p className="font-sans text-sm text-slate-500 dark:text-slate-400 font-normal tracking-normal mt-1">
            Append-only regulatory audit log recording every state transition, certificate issuance, and credential mutation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAuditLogs}
            disabled={loading}
            className="h-9 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-slate-900 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            {loading ? <MachineLoader scene="conveyor" size={16} /> : <RefreshCw className="h-3.5 w-3.5" />}
            <span>SYNC AUDIT</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2.5 bg-white dark:bg-[#14171B] p-3 rounded-xl border border-slate-300 dark:border-slate-800 text-xs shadow-xs">
        <Filter className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
        <span className="font-sans text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Target Entity Filter:</span>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-sans text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-400/20 focus:border-slate-600 dark:focus:border-slate-400 outline-hidden font-medium"
        >
          <option value="">ALL ENTITIES</option>
          <option value="lead">LEADS</option>
          <option value="proposal">PROPOSALS</option>
          <option value="invoice">INVOICES</option>
          <option value="work_order">WORK ORDERS</option>
          <option value="inspection_submission">INSPECTIONS</option>
          <option value="certificate">CERTIFICATES</option>
          <option value="document">DOCUMENTS</option>
        </select>
      </div>

      {/* Main Table Card */}
      <div className="relative rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] overflow-hidden shadow-[0_1px_3px_0_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.06)]">
        <RegistrationMarks />

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <MachineLoader scene="conveyor" size={100} caption="LOADING IMMUTABLE AUDIT LOG…" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              scene="conveyor"
              title="NO AUDIT ENTRIES MATCH FILTER"
              description="Audit records are appended automatically on any entity mutation."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-sans text-[11px] uppercase tracking-wider font-bold select-none">
                  <th className="py-2.5 px-4 w-10 font-bold"></th>
                  <th className="py-2.5 px-4 font-bold">Timestamp</th>
                  <th className="py-2.5 px-4 font-bold">Action</th>
                  <th className="py-2.5 px-4 font-bold">Entity Type</th>
                  <th className="py-2.5 px-4 font-bold">Actor Identity</th>
                  <th className="py-2.5 px-4 font-bold text-right">Entity UUID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {logs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => toggleExpand(log.id)}
                        className="group relative h-[46px] hover:bg-slate-50/90 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-4 text-slate-400 relative">
                          {/* Hover edge */}
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500 dark:bg-blue-400 scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-100" />
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                          )}
                        </td>

                        <td className="py-2.5 px-4 font-mono text-[12px] text-slate-900 dark:text-white font-medium">
                          {formatDateTime(log.created_at)}
                        </td>

                        <td className="py-2.5 px-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold border ${
                            log.action.includes('INSERT') || log.action.includes('CREATE') || log.action.includes('ISSUE')
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                              : log.action.includes('UPDATE') || log.action.includes('STATUS')
                              ? 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
                              : log.action.includes('DELETE') || log.action.includes('REVOKE')
                              ? 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60'
                              : 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60'
                          }`}>
                            {log.action}
                          </span>
                        </td>

                        <td className="py-2.5 px-4 font-sans text-xs uppercase text-slate-600 dark:text-slate-300 font-medium">
                          {log.entity_type.replace(/_/g, ' ')}
                        </td>

                        <td className="py-2.5 px-4 text-slate-900 dark:text-white">
                          <span className="font-semibold">
                            {log.actor_name || (log.actor_user_id ? 'Authenticated Inspector' : 'System Automation / Webhook')}
                          </span>
                        </td>

                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 text-right">
                          {log.entity_id ? log.entity_id.slice(0, 8).toUpperCase() + '…' : '—'}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50/60 dark:bg-slate-900/60">
                          <td colSpan={6} className="p-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5 font-semibold">
                                  STATE BEFORE MUTATION:
                                </span>
                                <pre className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 overflow-x-auto text-[11px] text-slate-700 dark:text-slate-300 max-h-48 leading-relaxed">
                                  {log.before_jsonb ? JSON.stringify(log.before_jsonb, null, 2) : 'null (Entity Initial Creation)'}
                                </pre>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5 font-semibold">
                                  STATE AFTER MUTATION:
                                </span>
                                <pre className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 overflow-x-auto text-[11px] text-slate-900 dark:text-white max-h-48 leading-relaxed font-semibold">
                                  {log.after_jsonb ? JSON.stringify(log.after_jsonb, null, 2) : 'null'}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Strip */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
              <div>
                {logs.length > 0 ? (
                  <span>01–{String(logs.length).padStart(2, '0')} OF {String(logs.length).padStart(2, '0')}</span>
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
    </div>
  );
}
