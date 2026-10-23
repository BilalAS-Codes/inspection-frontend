'use client';

import React from 'react';

/**
 * Hydraulic Press Machine Scene (Industrial stamping ram & anvil)
 * Used for in-flight destructive confirmations (revocation, deletion).
 */
export function PressScene({ isReducedMotion = false }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Heavy Steel Frame & Bottom Anvil */}
      <g className="stroke-stone-400 dark:stroke-stone-600" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {/* Foundation Base */}
        <rect x="20" y="80" width="60" height="10" rx="1" className="fill-surface-2" />
        {/* Lower Anvil block */}
        <rect x="36" y="68" width="28" height="12" rx="1" className="fill-stone-300 dark:fill-stone-700" />
        {/* Dual Vertical Columns */}
        <line x1="26" y1="20" x2="26" y2="80" strokeWidth="2.5" />
        <line x1="74" y1="20" x2="74" y2="80" strokeWidth="2.5" />
        {/* Top Hydraulic Crown */}
        <rect x="20" y="10" width="60" height="15" rx="1" className="fill-surface-2" />
        {/* Hydraulic Cylinder */}
        <rect x="42" y="25" width="16" height="18" rx="1" className="fill-surface-1 stroke-stone-500" strokeWidth="1.5" />
      </g>

      {/* Vertical Hydraulic Ram & Tool Head (Safety Amber Piston) */}
      <g
        className={isReducedMotion ? '' : 'animate-[hydraulicPress_2s_cubic-bezier(0.8,0,0.2,1)_infinite]'}
      >
        {/* Polished Piston Rod */}
        <rect x="47" y="38" width="6" height="20" className="fill-amber-500 stroke-amber-600" strokeWidth="1" />
        {/* Stamping Die / Tool Head */}
        <path d="M 34 56 L 66 56 L 60 66 L 40 66 Z" className="fill-stone-700 dark:fill-stone-300 stroke-stone-900" strokeWidth="1.5" />
        {/* Pressure gauge indicator */}
        <circle cx="50" cy="52" r="2.5" className="fill-rose-500" />
      </g>

      <style jsx>{`
        @keyframes hydraulicPress {
          0%, 100% { transform: translateY(0px); }
          45% { transform: translateY(0px); }
          50% { transform: translateY(9px); } /* Stamp contact */
          65% { transform: translateY(9px); }
          80% { transform: translateY(0px); }
        }
      `}</style>
    </svg>
  );
}
