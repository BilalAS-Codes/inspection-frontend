'use client';

import React, { useState } from 'react';
import { RegistrationMarks } from './engineering/registration-marks';

/**
 * Inspection Throughput Chart (30 Days)
 * Clean executive design:
 * - Real-world executive title: "Inspection Throughput (30 Days)" with subtitle "Completed vs. Scheduled inspections"
 * - Primary line in Precision Emerald (#059669)
 * - Scheduled line in clean 1.5px dashed gray (#94A3B8)
 * - Floating tooltip appears ONLY on hover and never overlaps the header legend.
 */
export function ThroughputChart() {
  const points = [
    { day: '01', scheduled: 12, actual: 11 },
    { day: '04', scheduled: 14, actual: 14 },
    { day: '08', scheduled: 16, actual: 17 },
    { day: '11', scheduled: 18, actual: 19 },
    { day: '14', scheduled: 21, actual: 23 },
    { day: '17', scheduled: 20, actual: 19 },
    { day: '20', scheduled: 24, actual: 26 },
    { day: '23', scheduled: 23, actual: 22 },
    { day: '26', scheduled: 27, actual: 29 },
    { day: '28', scheduled: 26, actual: 25 },
    { day: '30', scheduled: 30, actual: 31 },
  ];

  const [activeIdx, setActiveIdx] = useState(null);

  // SVG coordinate dimensions
  const width = 680;
  const height = 220;
  const padLeft = 44;
  const padRight = 24;
  const padTop = 20;
  const padBottom = 32;

  const maxVal = 35;
  const getX = (idx) => padLeft + (idx / (points.length - 1)) * (width - padLeft - padRight);
  const getY = (val) => height - padBottom - (val / maxVal) * (height - padTop - padBottom);

  // Helper to generate smooth cubic bezier spline curve
  const generateSplinePath = (dataKey) => {
    return points.reduce((acc, point, i, arr) => {
      if (i === 0) return `M ${getX(i)} ${getY(point[dataKey])}`;
      const prevX = getX(i - 1);
      const prevY = getY(arr[i - 1][dataKey]);
      const currX = getX(i);
      const currY = getY(point[dataKey]);
      const cp1x = prevX + (currX - prevX) / 2;
      const cp1y = prevY;
      const cp2x = prevX + (currX - prevX) / 2;
      const cp2y = currY;
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currX} ${currY}`;
    }, '');
  };

  const actualSpline = generateSplinePath('actual');
  const scheduledSpline = generateSplinePath('scheduled');

  // Closed area polygon under the actual curve
  const areaPath = `${actualSpline} L ${getX(points.length - 1)} ${height - padBottom} L ${getX(0)} ${height - padBottom} Z`;

  const activePoint = activeIdx !== null ? points[activeIdx] : null;
  const activeX = activeIdx !== null ? getX(activeIdx) : 0;
  const activeY = activePoint ? getY(activePoint.actual) : 0;

  // Bounds-aware tooltip percentage (clamped between 14% and 86% so it never clips edges or legend)
  const leftPercent = activeIdx !== null ? Math.max(14, Math.min(86, (activeX / width) * 100)) : 50;

  return (
    <div className="relative rounded-2xl border border-border bg-surface-1 p-6 shadow-elevation transition-all">
      <RegistrationMarks />

      {/* Clean Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/80 pb-3.5 mb-3.5 gap-2">
        <div>
          <h2 className="font-display font-bold text-base text-slate-900 dark:text-white tracking-tight">
            Inspection Throughput (30 Days)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Completed vs. Scheduled inspections
          </p>
        </div>

        {/* Clean Neutral Legend */}
        <div className="flex items-center gap-4 text-xs font-sans select-none">
          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <span className="w-3.5 h-[2.5px] rounded-full bg-emerald-600 inline-block" />
            <span className="font-semibold text-slate-900 dark:text-white">Completed</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="w-3.5 h-[1.5px] border-b border-dashed border-[#64748B] inline-block" />
            <span>Scheduled Target</span>
          </div>
        </div>
      </div>

      {/* Executive Operational Velocity KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-4 mb-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 font-sans">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Completed MTD
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-display font-bold text-xl text-slate-900 dark:text-white">31</span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
              +10.7%
            </span>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Target Pace
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-display font-bold text-xl text-slate-700 dark:text-slate-300">28</span>
            <span className="text-[11px] text-slate-400">units</span>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            First-Time Pass
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-display font-bold text-xl text-slate-900 dark:text-white">96.8%</span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Nominal</span>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Velocity Rate
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-display font-bold text-xl text-slate-900 dark:text-white">2.4</span>
            <span className="text-[11px] text-slate-500">jobs/day</span>
          </div>
        </div>
      </div>

      <div className="relative w-full pt-1" onMouseLeave={() => setActiveIdx(null)}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setActiveIdx(null)}
        >
          <defs>
            {/* Emerald Area Gradient */}
            <linearGradient id="throughputAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.16" />
              <stop offset="70%" stopColor="#059669" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y Axis Reference Grid & Labels */}
          {[30, 20, 10].map((val) => (
            <g key={val}>
              <line
                x1={padLeft}
                y1={getY(val)}
                x2={width - padRight}
                y2={getY(val)}
                className="stroke-slate-200/80 dark:stroke-slate-800/80"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padLeft - 10}
                y={getY(val) + 3.5}
                textAnchor="end"
                className="font-mono text-[10px] font-medium fill-slate-400"
              >
                {val}
              </text>
            </g>
          ))}

          {/* Grid Baseline at 0 */}
          <line
            x1={padLeft}
            y1={height - padBottom}
            x2={width - padRight}
            y2={height - padBottom}
            className="stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="1.25"
          />
          <text
            x={padLeft - 10}
            y={height - padBottom + 3.5}
                textAnchor="end"
                className="font-mono text-[10px] font-medium fill-slate-400"
          >
            0
          </text>

          {/* Gradient Area Fill under Actual Curve */}
          <path d={areaPath} fill="url(#throughputAreaGrad)" />

          {/* Scheduled Path (1.5px dashed steel gray line) */}
          <path
            d={scheduledSpline}
            fill="none"
            stroke="#64748B"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Actual Certified Spline Curve (Emerald #059669) */}
          <path
            d={actualSpline}
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Vertical Crosshair (only on hover) */}
          {activeIdx !== null && (
            <line
              x1={activeX}
              y1={padTop}
              x2={activeX}
              y2={height - padBottom}
              stroke="#059669"
              strokeOpacity="0.4"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* All Data Nodes */}
          {points.map((p, i) => {
            const px = getX(i);
            const py = getY(p.actual);
            const isHovered = activeIdx === i;

            return (
              <circle
                key={i}
                cx={px}
                cy={py}
                r={isHovered ? 5 : 3.5}
                fill={isHovered ? '#059669' : '#FFFFFF'}
                stroke="#059669"
                strokeWidth={isHovered ? 2.5 : 2}
                transition="all 0.15s ease"
              />
            );
          })}

          {/* Interactive touch/hover capture zones */}
          {points.map((p, idx) => (
            <rect
              key={idx}
              x={getX(idx) - 18}
              y={0}
              width={36}
              height={height}
              fill="rgba(0,0,0,0.001)"
              style={{ pointerEvents: 'all' }}
              className="cursor-pointer"
              onMouseEnter={() => setActiveIdx(idx)}
            />
          ))}

          {/* Day Ticks on X Axis (JetBrains Mono permitted for ticks) */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={getX(idx)}
              y={height - 10}
              textAnchor="middle"
              className="font-mono text-[10px] font-medium fill-slate-400"
            >
              D{p.day}
            </text>
          ))}
        </svg>

        {/* Floating Tooltip — ONLY rendered on hover and bounds-protected */}
        {activeIdx !== null && activePoint && (
          <div
            style={{
              left: `${leftPercent}%`,
              top: `${Math.max(22, (activeY / height) * 70)}%`,
            }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full mb-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md px-3.5 py-2 shadow-md text-xs font-sans z-30 transition-all duration-75 min-w-[160px]"
          >
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                Day {activePoint.day}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            </div>
            <div className="pt-1.5 space-y-0.5">
              <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                <span>{activePoint.actual} Completed</span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">NOMINAL</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Target: <strong className="text-slate-700 dark:text-slate-300">{activePoint.scheduled} units</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
