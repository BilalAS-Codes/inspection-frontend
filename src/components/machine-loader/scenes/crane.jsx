'use client';

import React from 'react';

/**
 * Crane Machine Scene (Industrial tower crane with moving trolley & hoist)
 * Used for full-page route transitions, login submits, proposal PDF generation.
 */
export function CraneScene({ isReducedMotion = false }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Base & Mast (Static technical structure) */}
      <g className="stroke-stone-400 dark:stroke-stone-600" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Base pads */}
        <line x1="15" y1="92" x2="45" y2="92" />
        {/* Vertical mast truss */}
        <line x1="25" y1="92" x2="25" y2="28" />
        <line x1="35" y1="92" x2="35" y2="28" />
        {/* Cross lattice diagonals */}
        <line x1="25" y1="84" x2="35" y2="76" />
        <line x1="35" y1="76" x2="25" y2="68" />
        <line x1="25" y1="68" x2="35" y2="60" />
        <line x1="35" y1="60" x2="25" y2="52" />
        <line x1="25" y1="52" x2="35" y2="44" />
        <line x1="35" y1="44" x2="25" y2="36" />
        <line x1="25" y1="36" x2="35" y2="28" />
        {/* Crane Tower Top & Counter-jib */}
        <line x1="10" y1="28" x2="90" y2="28" strokeWidth="2" />
        <line x1="10" y1="28" x2="30" y2="12" />
        <line x1="30" y1="12" x2="60" y2="28" />
        <line x1="30" y1="12" x2="30" y2="28" />
        {/* Counterweight */}
        <rect x="8" y="24" width="8" height="8" fill="currentColor" fillOpacity="0.2" />
      </g>

      {/* Moving Trolley & Hoist Cable (Safety Amber Accent) */}
      <g
        className={isReducedMotion ? '' : 'origin-top animate-[craneTrolley_3s_ease-in-out_infinite_alternate]'}
        style={{
          transformBox: 'fill-box'
        }}
      >
        {/* Trolley car */}
        <rect x="52" y="26" width="8" height="4" rx="0.5" className="fill-amber-500 stroke-amber-600 dark:stroke-amber-400" strokeWidth="1" />
        {/* Hoist Cable catching amber glint */}
        <line x1="56" y1="30" x2="56" y2="58" className="stroke-amber-500" strokeWidth="1.25" strokeDasharray="3 1" />
        {/* Pulley block & hook */}
        <circle cx="56" cy="60" r="2.5" className="fill-stone-400 dark:fill-stone-600 stroke-stone-500" strokeWidth="1" />
        <path d="M 56 62.5 C 56 68, 52 68, 52 65" className="stroke-stone-700 dark:stroke-stone-300" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      <style jsx>{`
        @keyframes craneTrolley {
          0% { transform: translateX(-14px); }
          100% { transform: translateX(18px); }
        }
      `}</style>
    </svg>
  );
}
