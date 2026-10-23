'use client';

import React from 'react';
import Link from 'next/link';
import { AllianceLogo } from '../../../components/alliance-logo';
import { StatusBadge } from '../../../components/status-badge';
import {
  RegistrationMarks,
  DraftingGrid,
  RulerTicks,
  SpecimenLabel,
  FadeRule
} from '../../../components/engineering';
import { useTheme } from '../../../components/theme-provider';
import { Sun, Moon, ArrowLeft } from 'lucide-react';

export default function DevTokensPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-canvas text-text-main p-8 max-w-6xl mx-auto space-y-12">
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
            <h1 className="text-xl font-600 font-sans tracking-tight">Design System & Token Catalog</h1>
            <p className="text-xs text-text-muted font-mono uppercase tracking-wider mt-0.5">
              /dev/tokens · Dieter Rams × Braun × Linear Light
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-surface-1 hover:bg-surface-2 text-xs font-mono transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-text-muted" />}
          <span className="uppercase">{theme} MODE ACTIVE</span>
        </button>
      </div>

      {/* Section 1: Surface & Canvas Stack */}
      <section className="space-y-4">
        <SpecimenLabel figure="SEC. 01" label="SURFACES & DEPTH PALETTE" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-md border border-border bg-canvas relative">
            <span className="font-mono text-[10px] text-text-faint">--canvas</span>
            <div className="text-sm font-600 mt-2">#FAFAF9 / #08090B</div>
            <p className="text-xs text-text-muted mt-1">Warm stone page background</p>
          </div>

          <div className="p-4 rounded-md border border-border bg-surface-1 shadow-whisper relative">
            <span className="font-mono text-[10px] text-text-faint">--surface-1</span>
            <div className="text-sm font-600 mt-2">#FFFFFF / #0E1013</div>
            <p className="text-xs text-text-muted mt-1">Cards & Panels + Whisper Shadow</p>
          </div>

          <div className="p-4 rounded-md border border-border bg-surface-2 relative">
            <span className="font-mono text-[10px] text-text-faint">--surface-2</span>
            <div className="text-sm font-600 mt-2">#F5F5F4 / #14171B</div>
            <p className="text-xs text-text-muted mt-1">Table headers & muted sections</p>
          </div>

          <div className="p-4 rounded-md border border-border bg-surface-3 relative">
            <span className="font-mono text-[10px] text-text-faint">--surface-3</span>
            <div className="text-sm font-600 mt-2">#E7E5E4 / #1A1E23</div>
            <p className="text-xs text-text-muted mt-1">Row hovers & active nav background</p>
          </div>
        </div>
      </section>

      <FadeRule />

      {/* Section 2: Accents & Contrast Rules */}
      <section className="space-y-4">
        <SpecimenLabel figure="SEC. 02" label="INDUSTRIAL ACCENTS & BUTTON HIERARCHY" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-md border border-border bg-surface-1 space-y-3">
            <div className="font-mono text-xs text-text-muted uppercase tracking-wider">Primary Action</div>
            <button className="w-full h-10 px-4 rounded-md bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-stone-900 font-500 text-sm tracking-tight transition-all flex items-center justify-center gap-2">
              High-Vis Safety Amber (12:1 Contrast)
            </button>
            <p className="text-[11px] text-text-muted">
              Amber fill with dark stone text. Never small amber text on white.
            </p>
          </div>

          <div className="p-5 rounded-md border border-border bg-surface-1 space-y-3">
            <div className="font-mono text-xs text-text-muted uppercase tracking-wider">Secondary Action</div>
            <button className="w-full h-10 px-4 rounded-md border border-border-strong bg-surface-1 hover:bg-surface-2 active:scale-[0.98] text-text-main font-500 text-sm tracking-tight transition-all">
              Precision Hairline Secondary
            </button>
            <p className="text-[11px] text-text-muted">
              Bordered white/surface with subtle stone hover.
            </p>
          </div>

          <div className="p-5 rounded-md border border-border bg-surface-1 space-y-3">
            <div className="font-mono text-xs text-text-muted uppercase tracking-wider">Signal Teal Accent</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-500 uppercase">
                QR Verified / Live Registry Active
              </span>
            </div>
            <p className="text-[11px] text-text-muted">
              Signal Teal is reserved strictly for verification badges, live status dots, and proof chips.
            </p>
          </div>
        </div>
      </section>

      <FadeRule />

      {/* Section 3: Status Badge Palette */}
      <section className="space-y-4">
        <SpecimenLabel figure="SEC. 03" label="STATUS BADGES (MONO 11PX, 6PX RADIUS)" />
        <div className="p-6 rounded-md border border-border bg-surface-1 space-y-4">
          <div className="flex flex-wrap gap-3">
            <StatusBadge status="valid" />
            <StatusBadge status="safe" />
            <StatusBadge status="paid" />
            <StatusBadge status="verified" />
            <StatusBadge status="expiring" />
            <StatusBadge status="pending" />
            <StatusBadge status="conditional" />
            <StatusBadge status="expired" />
            <StatusBadge status="unsafe" />
            <StatusBadge status="revoked" />
            <StatusBadge status="blocked" />
            <StatusBadge status="draft" />
            <StatusBadge status="open" />
            <StatusBadge status="in_progress" />
            <StatusBadge status="completed" />
          </div>
        </div>
      </section>

      <FadeRule />

      {/* Section 4: The Five Engineering Primitives */}
      <section className="space-y-4">
        <SpecimenLabel figure="SEC. 04" label="THE FIVE MANDATORY ENGINEERING DETAILS" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Registration Marks */}
          <div className="relative p-6 rounded-md border border-border bg-surface-1 shadow-whisper">
            <RegistrationMarks />
            <div className="font-mono text-[11px] text-text-muted uppercase tracking-wider mb-2">
              1. Registration Marks on Corner Cards
            </div>
            <p className="text-xs text-text-main">
              Notice the precision 8px crosses at the four corners positioned 4px outside the panel boundary. Instantly conveys technical blueprint fidelity.
            </p>
          </div>

          {/* 2. Drafting Grid */}
          <div className="rounded-md border border-border overflow-hidden">
            <DraftingGrid className="p-6 h-full flex flex-col justify-center">
              <div className="font-mono text-[11px] text-text-muted uppercase tracking-wider mb-2">
                2. Drafting Grid on Hero Surfaces
              </div>
              <p className="text-xs text-text-main">
                24px faint geometric paper grid. Evokes an architect drafting board on public login and verification surfaces.
              </p>
            </DraftingGrid>
          </div>

          {/* 3. Ruler Ticks */}
          <div className="relative p-6 rounded-md border border-border bg-surface-1 pr-12 min-h-[140px]">
            <RulerTicks />
            <div className="font-mono text-[11px] text-text-muted uppercase tracking-wider mb-2">
              3. Sidebar Ruler Ticks (40px / 200px)
            </div>
            <p className="text-xs text-text-main">
              Dieter Rams inspired calibration rule running down the right border edge of the sidebar.
            </p>
          </div>

          {/* 4 & 5. Specimen Label and Fade Divider */}
          <div className="p-6 rounded-md border border-border bg-surface-1 space-y-3">
            <div className="font-mono text-[11px] text-text-muted uppercase tracking-wider">
              4 & 5. Specimen Labels & Fade-Out Dividers
            </div>
            <SpecimenLabel figure="FIG. 04" label="PRESSURE VESSEL LOAD ANALYSIS" />
            <FadeRule />
            <p className="text-xs text-text-muted">
              Dividers gently dissolve at 80% width toward the right margin.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center pt-8 border-t border-border font-mono text-[11px] text-text-faint">
        ALLIANCE INFINITE · TPI PLATFORM v2.4 · TOKENS SPECIFICATION COMPLETE
      </div>
    </div>
  );
}
