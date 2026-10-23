'use client';

import React from 'react';

/**
 * Propeller / Turbine Machine Scene (Aerodynamic rotor in housing)
 * Used for report generation, analytics, and CSV streaming exports.
 */
export function PropellerScene({ isReducedMotion = false }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Outer Housing & Stator Struts */}
      <circle cx="50" cy="50" r="38" className="stroke-stone-300 dark:stroke-stone-700" strokeWidth="2" strokeDasharray="6 2" />
      <circle cx="50" cy="50" r="42" className="stroke-stone-200 dark:stroke-stone-800" strokeWidth="1" />
      <line x1="50" y1="8" x2="50" y2="18" className="stroke-stone-400" strokeWidth="1.5" />
      <line x1="50" y1="82" x2="50" y2="92" className="stroke-stone-400" strokeWidth="1.5" />
      <line x1="8" y1="50" x2="18" y2="50" className="stroke-stone-400" strokeWidth="1.5" />
      <line x1="82" y1="50" x2="92" y2="50" className="stroke-stone-400" strokeWidth="1.5" />

      {/* Rotating 4-Blade Impeller (Amber leading edges) */}
      <g
        className={isReducedMotion ? '' : 'animate-[rotorSpin_1.8s_linear_infinite]'}
        style={{ transformOrigin: '50px 50px' }}
      >
        {/* Blade 1 (North) */}
        <path d="M 47 44 C 44 26, 56 22, 53 14 C 51 22, 53 38, 50 44 Z" className="fill-stone-300 dark:fill-stone-700 stroke-stone-400" strokeWidth="1" />
        <circle cx="53" cy="14" r="2" className="fill-amber-500" />

        {/* Blade 2 (East) */}
        <path d="M 56 47 C 74 44, 78 56, 86 53 C 78 51, 62 53, 56 50 Z" className="fill-stone-300 dark:fill-stone-700 stroke-stone-400" strokeWidth="1" />
        <circle cx="86" cy="53" r="2" className="fill-amber-500" />

        {/* Blade 3 (South) */}
        <path d="M 53 56 C 56 74, 44 78, 47 86 C 49 78, 47 62, 50 56 Z" className="fill-stone-300 dark:fill-stone-700 stroke-stone-400" strokeWidth="1" />
        <circle cx="47" cy="86" r="2" className="fill-amber-500" />

        {/* Blade 4 (West) */}
        <path d="M 44 53 C 26 56, 22 44, 14 47 C 22 49, 38 47, 44 50 Z" className="fill-stone-300 dark:fill-stone-700 stroke-stone-400" strokeWidth="1" />
        <circle cx="14" cy="47" r="2" className="fill-amber-500" />

        {/* Center Spinner Cone */}
        <circle cx="50" cy="50" r="8" className="fill-surface-1 stroke-stone-500" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="3" className="fill-amber-500" />
      </g>

      <style jsx>{`
        @keyframes rotorSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}
