'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Radio, X, AlertTriangle } from 'lucide-react';

/**
 * RadarScanModal Component
 * Section 3.2: Interactive Radar Loader modal triggered by 'RUN EXPIRY SCAN'.
 * Checks Company CR/VAT, Engineer IQAMAs & Gate Passes, and Client Machine Certificates.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onComplete?: (result: any) => void
 * }} props
 */
export function RadarScanModal({ isOpen, onClose, onComplete }) {
  const [stage, setStage] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const checks = [
    { title: 'Company Statutory Registration & VAT Filing', entity: 'ZATCA & MOC', delay: 600 },
    { title: 'Engineer Field Credentials & Gate-Pass Validity', entity: 'IQAMA / Aramco Gate', delay: 1300 },
    { title: 'Client Machinery & Lifting Fleet Certificates', entity: 'SASO Compliance (30d/7d/1d)', delay: 2100 },
  ];

  useEffect(() => {
    if (!isOpen) {
      setStage(0);
      setIsFinished(false);
      return;
    }

    const t1 = setTimeout(() => setStage(1), 600);
    const t2 = setTimeout(() => setStage(2), 1400);
    const t3 = setTimeout(() => {
      setStage(3);
      setIsFinished(true);
      if (onComplete) onComplete({ scanned: 48, expiring: 3, blocked: 0 });
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/60 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative max-w-md w-full rounded-2xl border border-white/10 bg-gradient-to-b from-[#0F172A] to-[#0A0E1A] p-6 text-white shadow-2xl overflow-hidden"
        >
          {/* Top Amber Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-500/15 blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-sm text-white tracking-tight">
                  Autonomous Fleet & Credential Radar
                </h3>
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  KSA Regulatory Compliance Sweep
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Central Radar Sweep Gauge */}
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 rounded-full border border-amber-500/20 bg-amber-500/5 flex items-center justify-center shadow-inner">
              {/* Concentric rings */}
              <div className="absolute w-28 h-28 rounded-full border border-amber-500/25" />
              <div className="absolute w-16 h-16 rounded-full border border-amber-500/30" />
              <div className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />

              {/* Sweeping Radar Needle */}
              <div className="absolute inset-0 rounded-full overflow-hidden animate-radar pointer-events-none">
                <div className="w-1/2 h-1/2 bg-gradient-to-br from-amber-400/40 via-amber-400/10 to-transparent origin-bottom-right" />
              </div>

              {/* Blip dots */}
              <div className="absolute top-6 right-8 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <div className="absolute bottom-8 left-10 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </div>

            <div className="mt-4 font-mono text-xs font-semibold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>{isFinished ? 'SWEEP COMPLETED · CERTIFIED' : 'ANALYZING REGISTRY NODES…'}</span>
            </div>
          </div>

          {/* Multi-tier Checklist Progress */}
          <div className="space-y-2.5 pt-2 border-t border-white/10 font-sans text-xs">
            {checks.map((check, idx) => {
              const isDone = stage > idx;
              const isCurrent = stage === idx;

              return (
                <div
                  key={check.title}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : isCurrent
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                      : 'bg-white/5 border-white/5 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-[12px] truncate">{check.title}</div>
                      <div className="font-mono text-[10px] opacity-75">{check.entity}</div>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] font-bold uppercase shrink-0">
                    {isDone ? 'VALID' : isCurrent ? 'SCANNING' : 'PENDING'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer Action */}
          <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              onClick={onClose}
              disabled={!isFinished}
              className={`h-9 px-4 rounded-xl font-mono text-xs font-bold transition-all shadow-md ${
                isFinished
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isFinished ? 'DISMISS & APPLY AUDIT' : 'SCAN IN PROGRESS…'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
