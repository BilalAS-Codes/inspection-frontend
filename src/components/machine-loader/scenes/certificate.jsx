'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Modern Industrial Accreditation Certificate Scene
 *
 * High-tech digital equipment certification card:
 * - 60fps Framer Motion hardware-accelerated animations.
 * - Levitation floating card dynamics.
 * - Continuous optical laser scanner beam traveling across the certificate.
 * - Precision rotating holographic security gyro ring with orbiting telemetry nodes.
 * - Modern ISO/SASO verified safety shield with pulsing status glow.
 * - Technical itemized telemetry ledger and corner crop marks.
 * - Zero medieval/occult starbursts or ribbon tails.
 *
 * @param {{ isReducedMotion?: boolean }} props
 */
export function CertificateScene({ isReducedMotion = false }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full select-none overflow-visible"
    >
      <defs>
        {/* Laser Beam Gradient */}
        <linearGradient id="laserBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
          <stop offset="25%" stopColor="#10B981" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#34D399" stopOpacity="1" />
          <stop offset="75%" stopColor="#10B981" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>

        {/* Laser Ambient Glow */}
        <linearGradient id="laserGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0" />
          <stop offset="50%" stopColor="#10B981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>

        {/* Shield Interior Gradient */}
        <linearGradient id="shieldFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* ── Main Floating Certificate Chassis ────────────────────────── */}
      <motion.g
        animate={isReducedMotion ? {} : { y: [-1.5, 1.5, -1.5] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Document Shadow & Elevation */}
        <rect
          x="21"
          y="11"
          width="58"
          height="80"
          rx="5"
          className="fill-slate-900/[0.04] dark:fill-black/40"
        />

        {/* Certificate Card Body */}
        <rect
          x="20"
          y="10"
          width="60"
          height="80"
          rx="5"
          className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-700/80"
          strokeWidth="1.25"
        />


        {/* Subtle Engineering Dot Grid */}
        <g className="fill-slate-300/40 dark:fill-slate-700/40">
          <circle cx="28" cy="27" r="0.6" />
          <circle cx="34" cy="27" r="0.6" />
          <circle cx="66" cy="27" r="0.6" />
          <circle cx="72" cy="27" r="0.6" />
          <circle cx="28" cy="73" r="0.6" />
          <circle cx="34" cy="73" r="0.6" />
          <circle cx="66" cy="73" r="0.6" />
          <circle cx="72" cy="73" r="0.6" />
        </g>

        {/* ── Card Header: Telemetry Status & Official Title ─────────── */}
        {/* Pulsing Live Telemetry Signal Dot */}
        <circle cx="26" cy="18" r="2" className="fill-emerald-500" />
        {!isReducedMotion && (
          <motion.circle
            cx="26"
            cy="18"
            r="2"
            fill="none"
            stroke="#10B981"
            strokeWidth="0.8"
            animate={{ r: [2, 4.5], opacity: [0.8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        {/* Official Authority Header Rule */}
        <line
          x1="31"
          y1="18"
          x2="52"
          y2="18"
          className="stroke-slate-800 dark:stroke-slate-100"
          strokeWidth="1.75"
          strokeLinecap="round"
        />

        {/* Sub-header Authority Code */}
        <line
          x1="31"
          y1="22"
          x2="45"
          y2="22"
          className="stroke-slate-400 dark:stroke-slate-500"
          strokeWidth="0.85"
          strokeLinecap="round"
        />

        {/* SASO / ISO Compliance Chip (Top-Right) */}
        <g>
          <rect
            x="59"
            y="15"
            width="17"
            height="9"
            rx="2"
            className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600"
            strokeWidth="0.75"
          />
          <text
            x="67.5"
            y="21.2"
            textAnchor="middle"
            className="fill-slate-700 dark:fill-slate-300 font-mono text-[5.5px] font-bold tracking-wider"
          >
            ISO
          </text>
        </g>

        {/* Top Divider Guide */}
        <line
          x1="24"
          y1="27"
          x2="76"
          y2="27"
          className="stroke-slate-200 dark:stroke-slate-800"
          strokeWidth="0.75"
        />

        {/* ── Central Security Badge & Rotating Gyro Ring ─────────────── */}
        <g transform="translate(50, 47)">
          {/* Outer Calibration Orbit Track */}
          <circle
            cx="0"
            cy="0"
            r="15"
            className="stroke-slate-200 dark:stroke-slate-700/60"
            strokeWidth="0.75"
          />

          {/* Rotating Precision Gyro Dashes */}
          <motion.circle
            cx="0"
            cy="0"
            r="13"
            fill="none"
            stroke="#10B981"
            strokeWidth="1"
            strokeDasharray="4 3"
            animate={isReducedMotion ? {} : { rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />

          {/* Satellite Telemetry Dot */}
          <motion.circle
            cx="0"
            cy="-13"
            r="1.25"
            className="fill-emerald-400"
            animate={isReducedMotion ? {} : { rotate: 360 }}
            style={{ transformOrigin: '0px 0px' }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />

          {/* Modern Hexagonal Safety Shield */}
          <path
            d="M 0 -9.5 L 8.5 -5 L 8.5 3 C 8.5 8.5 4.5 12 0 13.5 C -4.5 12 -8.5 8.5 -8.5 3 L -8.5 -5 Z"
            fill="url(#shieldFillGrad)"
            className="stroke-emerald-600 dark:stroke-emerald-400"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />

          {/* Shield Core Verification Checkmark */}
          <motion.path
            d="M -3.5 0.5 L -1 3 L 4.5 -2.5"
            fill="none"
            className="stroke-emerald-600 dark:stroke-emerald-300"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={isReducedMotion ? {} : { scale: [1, 1.1, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </g>

        {/* ── Technical Ledger Lines (Bottom Half) ───────────────────── */}
        <g className="stroke-slate-300 dark:stroke-slate-700" strokeLinecap="round">
          {/* Row 1: Asset Serial Telemetry */}
          <line x1="25" y1="68" x2="36" y2="68" strokeWidth="1" className="stroke-slate-400 dark:stroke-slate-500" />
          <line x1="40" y1="68" x2="75" y2="68" strokeWidth="1.25" className="stroke-slate-700 dark:stroke-slate-300" />

          {/* Row 2: Standard & Scope */}
          <line x1="25" y1="73" x2="34" y2="73" strokeWidth="1" className="stroke-slate-400 dark:stroke-slate-500" />
          <line x1="38" y1="73" x2="68" y2="73" strokeWidth="1.25" className="stroke-slate-700 dark:stroke-slate-300" />

          {/* Row 3: Security Hash / Status Pill */}
          <line x1="25" y1="78" x2="31" y2="78" strokeWidth="1" className="stroke-slate-400 dark:stroke-slate-500" />
          <line x1="35" y1="78" x2="55" y2="78" strokeWidth="1.25" className="stroke-slate-600 dark:stroke-slate-400" />
          {/* Verified status dot */}
          <circle cx="73" cy="78" r="1.5" className="fill-emerald-500" />
        </g>

        {/* Bottom Technical Barcode Accent */}
        <g className="stroke-slate-400 dark:stroke-slate-600" strokeWidth="0.8">
          <line x1="25" y1="83" x2="25" y2="86" />
          <line x1="27" y1="83" x2="27" y2="86" strokeWidth="1.2" />
          <line x1="30" y1="83" x2="30" y2="86" />
          <line x1="32" y1="83" x2="32" y2="86" strokeWidth="1.5" />
          <line x1="35" y1="83" x2="35" y2="86" />
          <line x1="38" y1="83" x2="38" y2="86" strokeWidth="1.2" />
        </g>

        {/* ── Active Optical Laser Scanner Beam ──────────────────────── */}
        {!isReducedMotion && (
          <motion.g
            animate={{
              y: [16, 76, 16],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Ambient Laser Glow Spread */}
            <rect
              x="20"
              y="-3"
              width="60"
              height="6"
              fill="url(#laserGlowGrad)"
            />

            {/* Crisp High-Energy Laser Line */}
            <line
              x1="21"
              y1="0"
              x2="79"
              y2="0"
              stroke="url(#laserBeamGrad)"
              strokeWidth="1.5"
            />

            {/* Left & Right Scanner Optic Nodes */}
            <circle cx="21" cy="0" r="1.5" className="fill-emerald-400 shadow-sm" />
            <circle cx="79" cy="0" r="1.5" className="fill-emerald-400 shadow-sm" />
          </motion.g>
        )}
      </motion.g>
    </svg>
  );
}

