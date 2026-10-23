'use client';

import React from 'react';
import { MachineLoader } from './machine-loader';

/**
 * Standard Empty State container matching Section 10:
 * Frozen machine line-art icon + mono headline + one sentence + one amber CTA.
 * No illustration. No emoji. No giant icons.
 *
 * @param {{ scene?: 'crane'|'gears'|'propeller'|'conveyor'|'press'|'scan'|'certificate', title: string, description: string, action?: React.ReactNode, className?: string }} props
 */
export function EmptyState({
  scene = 'conveyor',
  title = 'NO RECORDS FOUND',
  description = 'No active assets matching the specified filter criteria.',
  action,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 ${className}`}>
      {/* Large animated machine line-art icon */}
      <div className="w-28 h-28 mb-4 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700/80 shadow-2xs hover:scale-105 transition-transform">
        <MachineLoader scene={scene} size={96} isDone={false} disableTimeout={true} />
      </div>

      <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 max-w-md font-sans leading-relaxed">
        {description}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}
