'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, RefreshCw, Radio, CheckCircle2, Lock, Cpu } from 'lucide-react';

/**
 * IndustrialLoader Suite
 * Section 3: Custom Animated Loaders & Holographic Telemetry Cards.
 * Variants:
 * - 'certificate-telemetry': Holographic isometric blueprint with amber laser scanline & audio wave bars.
 * - 'radar': Rotating radar scanner sweep for credential audits.
 * - 'shimmer-card': Skeleton shimmer card with layered depths.
 * - 'machine': Forwarding to precision technical SVG line-art machines.
 */
export function IndustrialLoader({
  variant = 'certificate-telemetry',
  caption,
  onRetry,
  timeoutMs = 12000,
  className = '',
}) {
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    if (!timeoutMs) return;
    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, timeoutMs);
    return () => clearTimeout(timer);
  }, [timeoutMs]);

  if (variant === 'certificate-telemetry') {
    return (
      <div className={`relative flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-border bg-gradient-to-b from-surface-2/40 to-surface-1/60 overflow-hidden shadow-xs ${className}`}>
        {/* Holographic Isometric Certificate Canvas */}
        <div className="relative w-44 h-48 mb-4 flex items-center justify-center">
          {/* Subtle Ambient Blueprint Grid */}
          <div className="absolute inset-0 rounded-lg border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 backdrop-blur-xs flex flex-col p-3 shadow-inner">
            {/* Certificate Header Blueprint */}
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="font-mono text-[9px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold">
                  TELEMETRY LINK
                </span>
              </div>
              <Lock className="w-3 h-3 text-amber-600/70" />
            </div>

            {/* Guilloche / Circuit Pattern Mock */}
            <div className="flex-1 py-3 flex flex-col justify-center items-center gap-2">
              <div className="w-14 h-14 rounded-md border border-dashed border-amber-500/40 bg-amber-500/10 flex items-center justify-center relative overflow-hidden">
                {/* Holographic QR Mock */}
                <div className="grid grid-cols-3 gap-1 p-2 opacity-60">
                  <div className="w-2 h-2 bg-amber-600 rounded-xs" />
                  <div className="w-2 h-2 bg-amber-600 rounded-xs" />
                  <div className="w-2 h-2 bg-amber-600 rounded-xs" />
                  <div className="w-2 h-2 bg-amber-600 rounded-xs" />
                  <div className="w-2 h-2 bg-amber-600 rounded-xs opacity-0" />
                  <div className="w-2 h-2 bg-amber-600 rounded-xs" />
                  <div className="w-2 h-2 bg-amber-600 rounded-xs" />
                  <div className="w-2 h-2 bg-amber-600 rounded-xs" />
                  <div className="w-2 h-2 bg-amber-600 rounded-xs" />
                </div>
              </div>

              <div className="w-full space-y-1">
                <div className="h-1.5 w-3/4 mx-auto rounded-full bg-amber-500/20" />
                <div className="h-1.5 w-1/2 mx-auto rounded-full bg-amber-500/15" />
              </div>
            </div>

            {/* Bottom Status Ticker */}
            <div className="pt-2 border-t border-amber-500/20 font-mono text-[8px] text-amber-800/80 dark:text-amber-400/80 text-center">
              ANTI-TAMPER CRYPTO VAULT
            </div>

            {/* Animated Laser Scanline Traveling Vertically */}
            <div className="pointer-events-none absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-[0_0_12px_#F59E0B] animate-scanline" />
          </div>
        </div>

        {/* Live Telemetry Status Pill with Animated Wave Bars */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-1 border border-border shadow-xs mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="font-mono text-[11px] font-semibold text-text-main">
            Listening for Field Inspector Mobile Sync...
          </span>

          {/* Audio / Wave Bars */}
          <div className="flex items-center gap-0.5 ml-1 h-3">
            <span className="w-0.5 bg-amber-500 rounded-full animate-wave-1" />
            <span className="w-0.5 bg-amber-500 rounded-full animate-wave-2" />
            <span className="w-0.5 bg-amber-500 rounded-full animate-wave-3" />
            <span className="w-0.5 bg-amber-500 rounded-full animate-wave-4" />
          </div>
        </div>

        <p className="text-xs font-sans text-text-muted max-w-xs leading-relaxed">
          {caption || 'Awaiting mobile checklist telemetry. Once inspector marks asset as SAFE, cryptographic seal will unlock.'}
        </p>

        {/* Smooth Glassmorphic Alert Banner if Query is taking longer than expected */}
        <AnimatePresence>
          {isTimedOut && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 rounded-xl border border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/40 backdrop-blur-sm text-xs space-y-2 max-w-sm"
            >
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-mono text-[11px] font-semibold uppercase">
                <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Extended Telemetry Window</span>
              </div>
              <p className="text-[11px] text-text-muted">
                Field engineer device in offline buffered mode. Telemetry will sync automatically upon reconnection.
              </p>
              {onRetry && (
                <button
                  onClick={() => {
                    setIsTimedOut(false);
                    onRetry();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-surface-1 border border-border text-text-main hover:bg-surface-2 font-mono text-[11px] font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <RefreshCw className="w-3 h-3 text-amber-600" />
                  <span>Retry Telemetry Sync</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Fallback default
  return null;
}
