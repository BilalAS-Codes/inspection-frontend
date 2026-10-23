'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Menu, X, Search, Bell, Sun, Moon } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';
import { AllianceLogo } from './alliance-logo';
import { RulerTicks } from './engineering/ruler-ticks';
import { CommandPalette } from './command-palette';
import { AnimatedNavIcon } from './animated-nav-icon';
import { useTheme } from './theme-provider';
import { NotificationsPopover } from './notifications-popover';

const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/dashboard' },
  { label: 'Leads',       href: '/leads' },
  { label: 'Proposals',   href: '/proposals' },
  { label: 'Invoices',    href: '/invoices' },
  { label: 'Clients',     href: '/clients' },
  { label: 'Work Orders', href: '/work-orders' },
  { label: 'Documents',   href: '/documents' },
  { label: 'Certificates',href: '/certificates' },
  { label: 'Reports',     href: '/reports' },
  { label: 'Audit',       href: '/audit' },
];

export function AppShell({ user, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      try {
        localStorage.removeItem('invertio_token');
        document.cookie = 'invertio_session=; path=/; max-age=0; SameSite=Lax';
      } catch {
        // Ignore storage access errors
      }
      toast.success('Logged out successfully.');
      router.push('/login');
    } catch {
      toast.error('Logout failed.');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'OP';
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-canvas ambient-canvas text-fg flex flex-col md:flex-row">
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />

      {/* ── Mobile top bar ──────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-surface-1">
        <AllianceLogo size={26} />
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-md border border-border bg-surface-1 text-fg-muted hover:text-fg hover:bg-surface-3 transition-colors flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {theme === 'dark'
              ? <Sun className="h-4 w-4 text-safety-amber" />
              : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="h-9 w-9 rounded-md border border-border text-fg-muted hover:text-fg flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-[240px]
          bg-surface-1 border-r border-border text-fg
          flex flex-col
          transition-transform duration-200
          md:translate-x-0 select-none
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <RulerTicks />

        {/* Brand */}
        <div className="h-14 flex items-center px-4 border-b border-border">
          <AllianceLogo size={28} />
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3.5 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold specimen-label tracking-[0.12em]">
            OPERATIONAL DOMAINS
          </div>

          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const isHovered = hoveredItem === item.label;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
                onFocus={() => setHoveredItem(item.label)}
                onBlur={() => setHoveredItem(null)}
                className={`
                  group relative flex items-center gap-3 px-3 py-2 rounded-lg
                  text-[13px] font-sans font-medium transition-all select-none z-10
                  ${isActive
                    ? 'text-slate-950 dark:text-white font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/60'
                  }
                `}
              >
                {/* Sliding active background with crisp border and obsidian accent */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-white/95 dark:bg-slate-800/90 backdrop-blur-md rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs -z-10"
                  >
                    <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-slate-900 dark:bg-white" />
                  </motion.div>
                )}

                {/* 22px SVG Icon Container - Strictly transparent, zero background, zero border */}
                <div
                  className={`
                    w-7 h-7 flex items-center justify-center shrink-0
                    bg-transparent border-0 shadow-none ring-0 outline-none
                    ${isActive
                      ? 'text-slate-950 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-950 dark:group-hover:text-white'
                    }
                  `}
                >
                  <AnimatedNavIcon type={item.label} isActive={isActive} isHovered={isHovered} />
                </div>

                <span className="truncate tracking-[-0.01em]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer user card */}
        <div className="p-3 border-t border-slate-300 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-slate-900 dark:text-slate-100 shrink-0 shadow-xs">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-sans font-semibold text-slate-900 dark:text-white truncate leading-snug">
                {user?.name || 'Authorized Lead'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider mt-0.5 truncate">
                {user?.role || 'Lead Auditor'} · TPI
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out of command center"
            className="p-1.5 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="flex-1 md:pl-[240px] flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 border-b border-slate-300 dark:border-slate-800 bg-slate-50/90 dark:bg-[#0E1013]/90 backdrop-blur-md flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2.5 h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors text-xs font-medium shadow-2xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="font-sans font-medium hidden sm:inline">Search commands or assets…</span>
              <kbd className="font-mono text-[10px] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-semibold">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Explicit Light / Dark theme selector */}
            <div
              role="radiogroup"
              aria-label="Color Theme"
              className="flex items-center p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800/80 shadow-2xs"
            >
              <button
                type="button"
                role="radio"
                aria-checked={theme === 'light'}
                onClick={() => setTheme('light')}
                title="Switch to Light mode"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-sans font-semibold transition-all duration-150 ${
                  theme === 'light'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-transparent'
                }`}
              >
                <Sun className={`h-3.5 w-3.5 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className="hidden sm:inline text-[11px] tracking-wide">Light</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={theme === 'dark'}
                onClick={() => setTheme('dark')}
                title="Switch to Dark mode"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-sans font-semibold transition-all duration-150 ${
                  theme === 'dark'
                    ? 'bg-slate-900 text-white shadow-xs dark:bg-slate-700 border border-slate-600'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-transparent'
                }`}
              >
                <Moon className={`h-3.5 w-3.5 ${theme === 'dark' ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="hidden sm:inline text-[11px] tracking-wide">Dark</span>
              </button>
            </div>

            <NotificationsPopover />

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-teal opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-signal-teal" />
              </span>
              <span className="font-mono text-[11px] font-medium text-fg-muted uppercase tracking-wider">
                KSA · Active
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}