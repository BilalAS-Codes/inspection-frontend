'use client';

import React from 'react';

/**
 * Gears Machine Scene (Intermeshing precision gear train)
 * Used for form submissions, invoice generation, lead conversions.
 */
export function GearsScene({ isReducedMotion = false }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Structural mounting plate */}
      <g className="stroke-stone-300 dark:stroke-stone-700" strokeWidth="1" strokeDasharray="2 2">
        <circle cx="38" cy="45" r="28" />
        <circle cx="68" cy="62" r="18" />
        <line x1="38" y1="45" x2="68" y2="62" />
      </g>

      {/* Large Driving Gear (Amber-accented teeth) */}
      <g
        className={isReducedMotion ? '' : 'animate-[gearClockwise_4s_linear_infinite]'}
        style={{ transformOrigin: '38px 45px' }}
      >
        <circle cx="38" cy="45" r="22" className="stroke-stone-400 dark:stroke-stone-600 fill-surface-1" strokeWidth="2" />
        {/* 8 Gear Teeth */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
          <rect
            key={idx}
            x="36"
            y="19"
            width="4"
            height="5"
            rx="0.5"
            className={idx % 2 === 0 ? 'fill-amber-500' : 'fill-stone-400 dark:fill-stone-600'}
            transform={`rotate(${angle} 38 45)`}
          />
        ))}
        {/* Hub */}
        <circle cx="38" cy="45" r="7" className="stroke-stone-500 fill-surface-2" strokeWidth="1.5" />
        <circle cx="38" cy="45" r="2.5" className="fill-amber-500" />
      </g>

      {/* Smaller Intermeshing Driven Gear (Counter-clockwise) */}
      <g
        className={isReducedMotion ? '' : 'animate-[gearCounter_2.5s_linear_infinite]'}
        style={{ transformOrigin: '68px 62px' }}
      >
        <circle cx="68" cy="62" r="14" className="stroke-stone-400 dark:stroke-stone-600 fill-surface-1" strokeWidth="1.75" />
        {/* 6 Gear Teeth */}
        {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
          <rect
            key={idx}
            x="66"
            y="45"
            width="4"
            height="4"
            rx="0.5"
            className="fill-stone-400 dark:fill-stone-600"
            transform={`rotate(${angle} 68 62)`}
          />
        ))}
        {/* Hub */}
        <circle cx="68" cy="62" r="4.5" className="stroke-stone-500 fill-surface-2" strokeWidth="1.5" />
        <circle cx="68" cy="62" r="1.5" className="fill-stone-400" />
      </g>

      <style jsx>{`
        @keyframes gearClockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gearCounter {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `}</style>
    </svg>
  );
}
