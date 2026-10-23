'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  ClipboardList,
  Award,
  FolderOpen,
  PlusCircle,
  FileText,
  Search,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from './theme-provider';

/**
 * 6.5 Command Palette (⌘K) — "The Operator's Shortcut"
 * Power tool for inspectors and operators to rapidly navigate to work orders,
 * certificates, documents, and trigger quick actions.
 */
export function CommandPalette({ open, setOpen }) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);

  if (!open) return null;

  const handleSelect = (url) => {
    setOpen(false);
    if (url) router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-stone-900/40 backdrop-blur-[2px] transition-opacity">
      <div
        className="w-full max-w-xl rounded-md border border-border bg-surface-1 shadow-modal overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Command Menu" className="w-full">
          {/* Header Search Input */}
          <div className="flex items-center border-b border-border px-3.5 h-12 gap-2.5">
            <Search className="w-4 h-4 text-text-faint shrink-0" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search work orders, certs, actions... (⌘K)"
              className="w-full bg-transparent font-mono text-xs placeholder:text-text-faint text-text-main outline-none"
            />
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-text-faint bg-surface-2 border border-border rounded">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-2 text-xs">
            <Command.Empty className="p-4 text-center font-mono text-xs text-text-faint">
              NO MATCHING ASSET OR COMMAND FOUND.
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group
              heading={<span className="font-mono text-[10px] text-text-faint uppercase tracking-wider px-2 py-1 block">QUICK ACTIONS</span>}
            >
              <Command.Item
                onSelect={() => handleSelect('/work-orders')}
                className="flex items-center justify-between px-2.5 py-2 rounded cursor-pointer hover:bg-surface-3 transition-colors text-text-main aria-selected:bg-surface-3"
              >
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-amber-500" />
                  <span>Create / View Active Work Orders</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-faint" />
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect('/documents')}
                className="flex items-center justify-between px-2.5 py-2 rounded cursor-pointer hover:bg-surface-3 transition-colors text-text-main aria-selected:bg-surface-3"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-text-muted" />
                  <span>Upload / Validate Gate-Pass Credential</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-faint" />
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  toggleTheme();
                  setOpen(false);
                }}
                className="flex items-center justify-between px-2.5 py-2 rounded cursor-pointer hover:bg-surface-3 transition-colors text-text-main aria-selected:bg-surface-3"
              >
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-text-muted" />}
                  <span>Toggle UI Theme (Light / Dark)</span>
                </div>
                <span className="font-mono text-[10px] text-text-faint uppercase">{theme}</span>
              </Command.Item>
            </Command.Group>

            {/* Work Orders */}
            <Command.Group
              heading={<span className="font-mono text-[10px] text-text-faint uppercase tracking-wider px-2 py-1 block">WORK ORDERS</span>}
            >
              <Command.Item
                onSelect={() => handleSelect('/work-orders')}
                className="flex items-center justify-between px-2.5 py-2 rounded cursor-pointer hover:bg-surface-3 transition-colors text-text-main aria-selected:bg-surface-3"
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-text-muted" />
                  <span>Saudi Aramco — 50T Mobile Crane Lifting Inspection</span>
                </div>
                <span className="font-mono text-amber-700 dark:text-amber-400 text-[11px]">WO-000101</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect('/work-orders')}
                className="flex items-center justify-between px-2.5 py-2 rounded cursor-pointer hover:bg-surface-3 transition-colors text-text-main aria-selected:bg-surface-3"
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-text-muted" />
                  <span>SABIC Petrochemicals — Heavy Forklift Safety Audit</span>
                </div>
                <span className="font-mono text-amber-700 dark:text-amber-400 text-[11px]">WO-000102</span>
              </Command.Item>
            </Command.Group>

            {/* Certificates */}
            <Command.Group
              heading={<span className="font-mono text-[10px] text-text-faint uppercase tracking-wider px-2 py-1 block">CERTIFICATES</span>}
            >
              <Command.Item
                onSelect={() => handleSelect('/certificates')}
                className="flex items-center justify-between px-2.5 py-2 rounded cursor-pointer hover:bg-surface-3 transition-colors text-text-main aria-selected:bg-surface-3"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Safety Compliance Certificate · Tadano Crane (SN: TDN-99881)</span>
                </div>
                <span className="font-mono text-[11px] text-text-muted">CERT-2026-0001</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          {/* Footer Bar */}
          <div className="border-t border-border px-3 py-2 bg-surface-2/60 flex items-center justify-between text-[10px] font-mono text-text-faint">
            <span>ALLIANCE INFINITE · OPERATOR NAVIGATOR</span>
            <div className="flex items-center gap-2">
              <span>↑↓ NAVIGATE</span>
              <span>↵ SELECT</span>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
