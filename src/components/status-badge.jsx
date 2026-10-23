import React from 'react';

const STATUS_MAP = {
  // Valid / Safe / Paid / Verified / Converted / Completed / Active / Issued (Emerald with dark text)
  valid: {
    badge: 'text-slate-900 bg-emerald-50 border-emerald-300/80 dark:text-slate-100 dark:bg-emerald-950/40 dark:border-emerald-700/60',
    dot: 'bg-emerald-500',
  },
  paid: {
    badge: 'text-slate-900 bg-emerald-50 border-emerald-300/80 dark:text-slate-100 dark:bg-emerald-950/40 dark:border-emerald-700/60',
    dot: 'bg-emerald-500',
  },
  safe: {
    badge: 'text-slate-900 bg-emerald-50 border-emerald-300/80 dark:text-slate-100 dark:bg-emerald-950/40 dark:border-emerald-700/60',
    dot: 'bg-emerald-500',
  },
  active: {
    badge: 'text-slate-900 bg-emerald-50 border-emerald-300/80 dark:text-slate-100 dark:bg-emerald-950/40 dark:border-emerald-700/60',
    dot: 'bg-emerald-500',
  },
  succeeded: {
    badge: 'text-slate-900 bg-emerald-50 border-emerald-300/80 dark:text-slate-100 dark:bg-emerald-950/40 dark:border-emerald-700/60',
    dot: 'bg-emerald-500',
  },
  cleared: {
    badge: 'text-slate-900 bg-emerald-50 border-emerald-300/80 dark:text-slate-100 dark:bg-emerald-950/40 dark:border-emerald-700/60',
    dot: 'bg-emerald-500',
  },
  accepted: {
    badge: 'text-slate-900 bg-emerald-50 border-emerald-300/80 dark:text-slate-100 dark:bg-emerald-950/40 dark:border-emerald-700/60',
    dot: 'bg-emerald-500',
  },
  verified: {
    badge: 'text-slate-900 bg-emerald-50 border-emerald-300/80 dark:text-slate-100 dark:bg-emerald-950/40 dark:border-emerald-700/60',
    dot: 'bg-emerald-500',
  },
  converted: {
    badge: 'text-slate-900 bg-emerald-50 border-emerald-300/80 dark:text-slate-100 dark:bg-emerald-950/40 dark:border-emerald-700/60',
    dot: 'bg-emerald-500',
  },
  completed: {
    badge: 'text-slate-900 bg-emerald-50 border-emerald-300/80 dark:text-slate-100 dark:bg-emerald-950/40 dark:border-emerald-700/60',
    dot: 'bg-emerald-500',
  },
  issued: {
    badge: 'text-slate-900 bg-emerald-50 border-emerald-300/80 dark:text-slate-100 dark:bg-emerald-950/40 dark:border-emerald-700/60',
    dot: 'bg-emerald-500',
  },

  // Expiring / Pending / In Progress / Contacted / Conditional / Sent (Amber with dark text)
  expiring: {
    badge: 'text-slate-900 bg-amber-50 border-amber-300/80 dark:text-slate-100 dark:bg-amber-950/40 dark:border-amber-700/60',
    dot: 'bg-amber-500',
  },
  pending: {
    badge: 'text-slate-900 bg-amber-50 border-amber-300/80 dark:text-slate-100 dark:bg-amber-950/40 dark:border-amber-700/60',
    dot: 'bg-amber-500',
  },
  in_progress: {
    badge: 'text-slate-900 bg-amber-50 border-amber-300/80 dark:text-slate-100 dark:bg-amber-950/40 dark:border-amber-700/60',
    dot: 'bg-amber-500',
  },
  conditional: {
    badge: 'text-slate-900 bg-amber-50 border-amber-300/80 dark:text-slate-100 dark:bg-amber-950/40 dark:border-amber-700/60',
    dot: 'bg-amber-500',
  },
  contacted: {
    badge: 'text-slate-900 bg-amber-50 border-amber-300/80 dark:text-slate-100 dark:bg-amber-950/40 dark:border-amber-700/60',
    dot: 'bg-amber-500',
  },
  proposal_sent: {
    badge: 'text-slate-900 bg-amber-50 border-amber-300/80 dark:text-slate-100 dark:bg-amber-950/40 dark:border-amber-700/60',
    dot: 'bg-amber-500',
  },
  sent: {
    badge: 'text-slate-900 bg-amber-50 border-amber-300/80 dark:text-slate-100 dark:bg-amber-950/40 dark:border-amber-700/60',
    dot: 'bg-amber-500',
  },

  // Expired / Unsafe / Revoked / Blocked / Lost (Rose with dark text)
  expired: {
    badge: 'text-slate-900 bg-rose-50 border-rose-300/80 dark:text-slate-100 dark:bg-rose-950/40 dark:border-rose-700/60',
    dot: 'bg-rose-500',
  },
  revoked: {
    badge: 'text-slate-900 bg-rose-50 border-rose-300/80 dark:text-slate-100 dark:bg-rose-950/40 dark:border-rose-700/60',
    dot: 'bg-rose-500',
  },
  unsafe: {
    badge: 'text-slate-900 bg-rose-50 border-rose-300/80 dark:text-slate-100 dark:bg-rose-950/40 dark:border-rose-700/60',
    dot: 'bg-rose-500',
  },
  blocked: {
    badge: 'text-slate-900 bg-rose-50 border-rose-300/80 dark:text-slate-100 dark:bg-rose-950/40 dark:border-rose-700/60',
    dot: 'bg-rose-500',
  },
  lost: {
    badge: 'text-slate-900 bg-rose-50 border-rose-300/80 dark:text-slate-100 dark:bg-rose-950/40 dark:border-rose-700/60',
    dot: 'bg-rose-500',
  },
  cancelled: {
    badge: 'text-slate-900 bg-rose-50 border-rose-300/80 dark:text-slate-100 dark:bg-rose-950/40 dark:border-rose-700/60',
    dot: 'bg-rose-500',
  },
  failed: {
    badge: 'text-slate-900 bg-rose-50 border-rose-300/80 dark:text-slate-100 dark:bg-rose-950/40 dark:border-rose-700/60',
    dot: 'bg-rose-500',
  },

  // Neutral / New / Draft / Open / Assigned / Closed (Slate with dark text)
  new: {
    badge: 'text-slate-900 bg-slate-100 border-slate-300 dark:text-slate-100 dark:bg-slate-800 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  draft: {
    badge: 'text-slate-900 bg-slate-100 border-slate-300 dark:text-slate-100 dark:bg-slate-800 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  open: {
    badge: 'text-slate-900 bg-slate-100 border-slate-300 dark:text-slate-100 dark:bg-slate-800 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  assigned: {
    badge: 'text-slate-900 bg-slate-100 border-slate-300 dark:text-slate-100 dark:bg-slate-800 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  closed: {
    badge: 'text-slate-900 bg-slate-100 border-slate-300 dark:text-slate-100 dark:bg-slate-800 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  archived: {
    badge: 'text-slate-900 bg-slate-100 border-slate-300 dark:text-slate-100 dark:bg-slate-800 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
};

/**
 * StatusBadge component:
 * High-clarity semantic status pill with 6px status dot.
 */
export function StatusBadge({ status, label, className = '' }) {
  const normalized = (status || '').toLowerCase().replace(/\s+/g, '_');
  const config = STATUS_MAP[normalized] || {
    badge: 'text-slate-700 bg-slate-100 border-slate-300 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700',
    dot: null,
  };
  const displayLabel = label || (status || '').replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-sans font-medium uppercase tracking-wider border select-none transition-colors ${config.badge} ${className}`}
    >
      {config.dot && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${config.dot}`} />}
      {displayLabel}
    </span>
  );
}
