'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../lib/api';
import { formatDate } from '../lib/format';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Award,
  FileText,
  Clock,
  X
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Interactive Notification Center and Popover conforming to Section 10:
 * - Real-time notification log stream from /api/notifications/logs
 * - Unread / Active badge counter
 * - Quick trigger for automated expiry scan routine
 * - Direct deep-links to affected Certificates and Documents
 */
export function NotificationsPopover() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const popoverRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/notifications/logs?limit=10');
      setNotifications(res.logs || []);
    } catch (err) {
      // Quiet fail if guest or unauthenticated
      console.warn('Notifications fetch deferred:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Auto-poll notifications every 60s
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleRunExpiryScan = async () => {
    try {
      setScanning(true);
      const res = await apiFetch('/api/notifications/run-expiry-scan', { method: 'POST' });
      toast.success(`Expiry scan complete: ${res.scanned} scanned, ${res.notified} alerts queued.`);
      await fetchNotifications();
    } catch (err) {
      toast.error(err.message || 'Expiry scan routine failed.');
    } finally {
      setScanning(false);
    }
  };

  const alertCount = notifications.length;

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications"
        aria-expanded={isOpen}
        className={`relative h-9 w-9 rounded-lg border transition-all active:scale-95 shadow-2xs flex items-center justify-center ${
          isOpen
            ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:border-blue-700 dark:text-blue-400'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
        }`}
      >
        <Bell className="h-4 w-4" />
        {alertCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-600 text-white font-mono text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-in zoom-in-75 duration-200">
            {alertCount > 9 ? '9+' : alertCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 px-4 bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                System Alerts
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold">
                {alertCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRunExpiryScan}
                disabled={scanning}
                title="Trigger automated statutory expiry scan routine"
                className="h-7 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-semibold inline-flex items-center gap-1 shadow-2xs transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${scanning ? 'animate-spin text-blue-600' : ''}`} />
                <span>SCAN NOW</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List of Alerts */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="h-4 w-4 animate-spin mx-auto text-slate-400" />
                <p>Checking statutory logs…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-500" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">All Credentials & Certs Compliant</p>
                <p className="text-[11px] text-slate-400">No expiration warnings pending dispatch.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const ctx = notif.context_jsonb || {};
                const isCert = notif.template_key === 'certificate_expiry_alert';
                const isDoc = notif.template_key === 'document_expiry_alert';
                const isExpired = ctx.window === 'expired';
                const is7d = ctx.window === '7d' || ctx.window === '1d';

                const targetUrl = isCert ? '/certificates' : (isDoc ? '/documents' : '/dashboard');

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      setIsOpen(false);
                      router.push(targetUrl);
                    }}
                    className="p-3.5 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group flex items-start gap-3 relative"
                  >
                    {/* Status accent icon */}
                    <div
                      className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center border ${
                        isExpired
                          ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400'
                          : is7d
                          ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-400'
                          : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-400'
                      }`}
                    >
                      {isCert ? (
                        <Award className="h-4 w-4" />
                      ) : isDoc ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {isCert
                            ? `Certificate ${ctx.certificateNumber || 'Expiry Alert'}`
                            : (ctx.displayName || 'Document Expiry Warning')}
                        </span>

                        <span
                          className={`shrink-0 px-1.5 py-0.2 rounded font-mono text-[9px] font-bold uppercase tracking-wider ${
                            isExpired
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                          }`}
                        >
                          {isExpired ? 'EXPIRED' : (ctx.window ? `${ctx.window.toUpperCase()} ALERT` : 'NOTICE')}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {isCert
                          ? `Equipment ${ctx.equipmentSerial || 'asset'} expires on ${formatDate(ctx.expiresAt)}.`
                          : `Category ${ctx.documentType || 'credential'} requirement must be renewed.`}
                      </p>

                      <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {formatDate(notif.created_at)}
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-sans font-semibold group-hover:underline flex items-center gap-0.5">
                          View details <ExternalLink className="h-2.5 w-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 px-4 bg-slate-50/70 dark:bg-slate-850/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <Link
              href="/audit"
              onClick={() => setIsOpen(false)}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium flex items-center gap-1"
            >
              <span>View Audit Trail</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <span className="font-mono text-[10px] text-slate-400">
              Live Stream · KSA
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
