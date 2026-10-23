'use client';

import React from 'react';

/**
 * Alliance Infinite Brand Mark and Wordmark.
 * Hexagon with top-right notch, hoist/plumb line with square load, and neutral calibration dot.
 * Completely adapts to current theme (light/dark) without hardcoded blues or navies.
 */
export function AllianceLogo({ size = 28, showWordmark = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric Hexagon & Infinity Mark */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-slate-900 dark:text-white"
        >
          {/* Precision Geometric Outer Hexagon */}
          <path
            d="M 16 2.75 L 28.5 9.97 L 28.5 24.41 L 16 31.63 L 3.5 24.41 L 3.5 9.97 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Interlocking Infinite Precision Inspection Loop */}
          <path
            d="M 10 16 C 10 12.8, 13.6 12.8, 16 16 C 18.4 19.2, 22 19.2, 22 16 C 22 12.8, 18.4 12.8, 16 16 C 13.6 19.2, 10 19.2, 10 16 Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Center Precision Calibration Pivot */}
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex items-center select-none">
          <span className="font-display font-black text-[15px] tracking-[0.12em] uppercase text-slate-900 dark:text-white">
            ALLIANCE
          </span>
          <span className="w-[1.5px] h-3.5 mx-2.5 inline-block bg-slate-300 dark:bg-slate-700" />
          <span className="font-display font-bold text-[13px] tracking-[0.2em] uppercase text-blue-600 dark:text-blue-400">
            INFINITE
          </span>
        </div>
      )}
    </div>
  );
}
