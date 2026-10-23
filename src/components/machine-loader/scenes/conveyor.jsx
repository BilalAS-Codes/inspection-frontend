'use client';

import React from 'react';

/**
 * Conveyor Machine Scene (Industrial roller conveyor with traveling pallets)
 * Used for inline table loading alongside skeleton data rows.
 */
export function ConveyorScene({ isReducedMotion = false }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Structural Support Legs & Guard Rails */}
      <g className="stroke-stone-300 dark:stroke-stone-700" strokeWidth="1.5" strokeLinecap="round">
        <line x1="18" y1="62" x2="18" y2="82" />
        <line x1="82" y1="62" x2="82" y2="82" />
        <line x1="12" y1="82" x2="24" y2="82" />
        <line x1="76" y1="82" x2="88" y2="82" />
        <line x1="18" y1="72" x2="82" y2="72" strokeWidth="1" strokeDasharray="3 3" />
      </g>

      {/* Main Track & Rollers */}
      <rect x="12" y="52" width="76" height="10" rx="5" className="stroke-stone-400 dark:stroke-stone-600 fill-surface-2" strokeWidth="1.5" />

      {/* Rollers spinning */}
      {[20, 32, 44, 56, 68, 80].map((cx, i) => (
        <g
          key={i}
          className={isReducedMotion ? '' : 'animate-[rollerSpin_1.5s_linear_infinite]'}
          style={{ transformOrigin: `${cx}px 57px` }}
        >
          <circle cx={cx} cy="57" r="3.5" className="stroke-stone-500 fill-surface-1" strokeWidth="1" />
          <line x1={cx - 2} y1="57" x2={cx + 2} y2="57" className="stroke-amber-500" strokeWidth="1" />
        </g>
      ))}

      {/* Traveling Specimen Pallets */}
      <g className={isReducedMotion ? '' : 'animate-[conveyorTravel_2.4s_linear_infinite]'}>
        {/* Pallet 1 */}
        <rect x="24" y="43" width="14" height="7" rx="1" className="fill-stone-300 dark:fill-stone-700 stroke-stone-400" strokeWidth="1" />
        <rect x="27" y="38" width="8" height="5" rx="0.5" className="fill-amber-500" />

        {/* Pallet 2 */}
        <rect x="58" y="43" width="14" height="7" rx="1" className="fill-stone-300 dark:fill-stone-700 stroke-stone-400" strokeWidth="1" />
        <rect x="61" y="36" width="8" height="7" rx="0.5" className="fill-stone-500 stroke-stone-600" strokeWidth="0.75" />
      </g>

      <style jsx>{`
        @keyframes rollerSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes conveyorTravel {
          0% { transform: translateX(-16px); }
          100% { transform: translateX(16px); }
        }
      `}</style>
    </svg>
  );
}
