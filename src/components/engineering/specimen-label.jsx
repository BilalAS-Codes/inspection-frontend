'use client';

import React from 'react';

/**
 * 4. Specimen labels on section headers.
 * Mono metadata label like "FIG. 01 — OPERATIONAL STATUS" or "SEC. 03 — EXPIRING DOCUMENTS"
 */
export function SpecimenLabel({ figure, label, className = '' }) {
  return (
    <div className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 select-none ${className}`}>
      {figure && (
        <span className="px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20">
          {figure}
        </span>
      )}
      {figure && label && <span className="text-slate-300 dark:text-slate-700">/</span>}
      {label && <span className="font-semibold tracking-wider text-slate-600 dark:text-slate-400">{label}</span>}
    </div>
  );
}
