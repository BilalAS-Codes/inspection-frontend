'use client';

import React from 'react';

/**
 * Optical Scan Machine Scene (Laser reticle & spectrometer scanner)
 * Used for QR verification lookups, magic-byte inspection, and document upload validation.
 */
export function ScanScene({ isReducedMotion = false }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Precision Scanning Aperture Frame */}
      <rect x="18" y="18" width="64" height="64" rx="2" className="stroke-stone-300 dark:stroke-stone-700" strokeWidth="1" strokeDasharray="4 2" />

      {/* 4 Optical Corner Brackets */}
      <path d="M 24 16 L 16 16 L 16 24" className="stroke-stone-500" strokeWidth="2" strokeLinecap="square" />
      <path d="M 76 16 L 84 16 L 84 24" className="stroke-stone-500" strokeWidth="2" strokeLinecap="square" />
      <path d="M 24 84 L 16 84 L 16 76" className="stroke-stone-500" strokeWidth="2" strokeLinecap="square" />
      <path d="M 76 84 L 84 84 L 84 76" className="stroke-stone-500" strokeWidth="2" strokeLinecap="square" />

      {/* Target QR / Code Specimen Mockup */}
      <g className="fill-stone-300 dark:fill-stone-700">
        <rect x="28" y="28" width="10" height="10" />
        <rect x="62" y="28" width="10" height="10" />
        <rect x="28" y="62" width="10" height="10" />
        <rect x="46" y="46" width="8" height="8" />
        <line x1="44" y1="28" x2="56" y2="28" stroke="currentColor" strokeWidth="2" />
        <line x1="28" y1="44" x2="28" y2="56" stroke="currentColor" strokeWidth="2" />
        <line x1="62" y1="52" x2="72" y2="52" stroke="currentColor" strokeWidth="2" />
      </g>

      {/* Signal Teal Laser Scanning Beam */}
      <g
        className={isReducedMotion ? '' : 'animate-[laserScan_1.8s_ease-in-out_infinite_alternate]'}
      >
        <line x1="12" y1="36" x2="88" y2="36" className="stroke-teal-500" strokeWidth="1.75" />
        {/* Glow halo */}
        <line x1="12" y1="36" x2="88" y2="36" className="stroke-teal-400 opacity-40" strokeWidth="4" />
        {/* Sensor optic center */}
        <circle cx="50" cy="36" r="3" className="fill-teal-500 stroke-teal-300" strokeWidth="1" />
      </g>

      <style jsx>{`
        @keyframes laserScan {
          0% { transform: translateY(-12px); }
          100% { transform: translateY(38px); }
        }
      `}</style>
    </svg>
  );
}
