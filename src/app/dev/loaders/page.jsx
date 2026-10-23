'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AllianceLogo } from '../../../components/alliance-logo';
import { MachineLoader } from '../../../components/machine-loader';
import { SpecimenLabel, FadeRule } from '../../../components/engineering';
import { useTheme } from '../../../components/theme-provider';
import { Sun, Moon, ArrowLeft, Sliders } from 'lucide-react';

export default function DevLoadersPage() {
  const { theme, toggleTheme } = useTheme();
  const [forceReducedMotion, setForceReducedMotion] = useState(false);
  const [selectedSize, setSelectedSize] = useState(64);

  const scenes = [
    { key: 'crane', title: '01. CRANE SCENE', desc: 'Full-page route transitions, login submit, proposal PDF generation' },
    { key: 'gears', title: '02. GEARS SCENE', desc: 'Form submissions, invoice generation, lead conversions' },
    { key: 'propeller', title: '03. PROPELLER SCENE', desc: 'Report generation, CSV streaming export' },
    { key: 'conveyor', title: '04. CONVEYOR SCENE', desc: 'Inline table loading (coexists with skeleton)' },
    { key: 'press', title: '05. PRESS SCENE', desc: 'In-flight destructive confirmations (revoke, delete)' },
    { key: 'scan', title: '06. SCAN SCENE', desc: 'QR verification lookup, document upload validation' }
  ];

  return (
    <div className="min-h-screen bg-canvas text-text-main p-8 max-w-6xl mx-auto space-y-10">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-md border border-border bg-surface-1 hover:bg-surface-2 transition-colors text-text-muted hover:text-text-main"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <AllianceLogo size={32} />
          <div>
            <h1 className="text-xl font-600 font-sans tracking-tight">Machine Loader System Gallery</h1>
            <p className="text-xs text-text-muted font-mono uppercase tracking-wider mt-0.5">
              /dev/loaders · Section 8 Technical Architecture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setForceReducedMotion(!forceReducedMotion)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono transition-colors ${
              forceReducedMotion
                ? 'bg-amber-500 text-stone-900 border-amber-600'
                : 'bg-surface-1 border-border text-text-muted hover:bg-surface-2'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>REDUCED MOTION: {forceReducedMotion ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-surface-1 hover:bg-surface-2 text-xs font-mono transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-text-muted" />}
            <span className="uppercase">{theme}</span>
          </button>
        </div>
      </div>

      {/* Size Selector Strip */}
      <div className="flex items-center gap-3 bg-surface-1 border border-border p-3 rounded-md">
        <span className="text-xs font-mono uppercase text-text-muted">Display Size:</span>
        {[48, 64, 160, 240].map((sz) => (
          <button
            key={sz}
            onClick={() => setSelectedSize(sz)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              selectedSize === sz
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                : 'text-text-muted hover:bg-surface-2'
            }`}
          >
            {sz}px
          </button>
        ))}
      </div>

      {/* Grid of Scenes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenes.map((scene) => (
          <div
            key={scene.key}
            className="p-6 rounded-md border border-border bg-surface-1 shadow-whisper flex flex-col justify-between"
          >
            <div>
              <SpecimenLabel figure={scene.title} />
              <p className="text-xs text-text-muted mt-2 min-h-[32px]">{scene.desc}</p>
            </div>

            <div className="py-8 flex items-center justify-center my-4 rounded border border-border bg-surface-2/40">
              <MachineLoader
                scene={scene.key}
                size={selectedSize}
                caption="SYNCHRONIZING..."
                isDone={forceReducedMotion}
              />
            </div>

            <div className="text-[10px] font-mono text-text-faint text-right uppercase">
              scene: {scene.key} · stroke 1.5px
            </div>
          </div>
        ))}
      </div>

      <FadeRule />

      {/* Footer */}
      <div className="text-center font-mono text-[11px] text-text-faint">
        ALLIANCE INFINITE · PRECISION INDUSTRIAL LOADERS · 60FPS CSS / SVG
      </div>
    </div>
  );
}
