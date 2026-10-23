import React from 'react';
import { SpecimenLabel } from './engineering/specimen-label';

/**
 * Standard Page Header conforming to the Command Overview executive benchmark.
 * Title: font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white
 * Subtitle: font-sans text-sm text-slate-500 dark:text-slate-400 font-normal tracking-normal mt-1
 *
 * @param {{ title: string, figure?: string, description?: string, action?: React.ReactNode }} props
 */
export function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4 select-none">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
        </div>
        {description && (
          <p className="font-sans text-sm text-slate-500 dark:text-slate-400 font-normal tracking-normal mt-1">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
    </div>
  );
}
