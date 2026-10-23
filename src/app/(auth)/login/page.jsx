'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { AllianceLogo } from '../../../components/alliance-logo';
import { DraftingGrid, RegistrationMarks } from '../../../components/engineering';
import { MachineLoader } from '../../../components/machine-loader';

/**
 * 6.1 Login — "The Drafting Board"
 * Canvas is warm stone-50 with 24px drafting grid.
 * Left 55%: Live SVG line-art crane hook swaying above load with amber glint.
 * Right 45%: Precision card with Alliance Infinite mark and high-vis amber button.
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/dashboard';

  const [email, setEmail] = useState('admin@demo.local');
  const [password, setPassword] = useState('Demo@123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      // Synchronize token across localStorage and client cookie for network IP compatibility
      if (res.token) {
        try {
          localStorage.setItem('invertio_token', res.token);
          // Set cookie on current origin (port 3000) so Next.js Edge Middleware allows routing
          document.cookie = `invertio_session=${encodeURIComponent(res.token)}; path=/; max-age=28800; SameSite=Lax`;
        } catch {
          // Ignore storage access errors
        }
      }

      toast.success(`Authorized: ${res.user.name}`);
      router.push(nextUrl);
      router.refresh();
    } catch (err) {
      setErrorMessage(err.message || 'Invalid operator credentials.');
      toast.error('Authentication rejected.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Demo@123');
    setErrorMessage('');
    setIsTyping(true);
  };

  return (
    <DraftingGrid className="min-h-screen bg-canvas text-text-main flex flex-col justify-center items-center p-6 md:p-12 relative overflow-hidden select-none">
      {/* Decorative Technical Blueprint Metadata */}
      <div className="absolute top-6 left-8 font-sans text-xs text-slate-500 dark:text-slate-400 hidden lg:block font-medium">
        Kingdom of Saudi Arabia · Third-Party Inspection Platform
      </div>
      <div className="absolute top-6 right-8 font-sans text-xs text-slate-500 dark:text-slate-400 hidden lg:block font-medium">
        SASO & ISO 17020 Certified Operations
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left 55% (span 7): Live SVG Line-Art Crane Hook Blueprint */}
        <div className="hidden lg:flex lg:col-span-7 flex-col items-center justify-center p-8 relative">
          <div className="w-full max-w-[440px] aspect-square relative flex items-center justify-center">
            {/* Corner Registration marks on the drafting plane */}
            <RegistrationMarks />

            <svg
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-border-strong"
            >
              {/* Overhead Crane Girder Beam */}
              <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="20" y1="50" x2="380" y2="50" strokeWidth="2.5" />
                <line x1="20" y1="70" x2="380" y2="70" strokeWidth="1.5" />
                {/* Girder web stiffeners */}
                {[50, 90, 130, 170, 210, 250, 290, 330, 370].map((x) => (
                  <line key={x} x1={x} y1="50" x2={x} y2="70" strokeWidth="1" strokeDasharray="2 2" />
                ))}
              </g>

              {/* Trolley Frame */}
              <rect x="175" y="65" width="50" height="15" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />

              {/* Swaying Hoist Cable & Hook (GSAP / CSS animation) */}
              <g className="animate-[craneSway_6s_ease-in-out_infinite]" style={{ transformOrigin: '200px 75px' }}>
                {/* Left wire */}
                <line x1="190" y1="75" x2="195" y2="240" stroke="currentColor" strokeWidth="1.25" strokeDasharray="4 1" />
                {/* Right wire with 6s amber glint */}
                <line
                  x1="210"
                  y1="75"
                  x2="205"
                  y2="240"
                  className="stroke-amber-500 animate-[amberGlint_6s_ease-in-out_infinite]"
                  strokeWidth="1.5"
                  strokeDasharray="4 1"
                />

                {/* Pulley Sheave & Swivel Hook */}
                <circle cx="200" cy="245" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="200" cy="245" r="4" fill="currentColor" />
                <path
                  d="M 200 257 C 200 290, 175 290, 175 275 C 175 265, 185 260, 192 268"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Suspended Proof Test Load Weight */}
                <rect x="160" y="300" width="80" height="50" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <line x1="160" y1="300" x2="240" y2="350" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="240" y1="300" x2="160" y2="350" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                <text x="200" y="330" textAnchor="middle" className="font-mono text-[10px] fill-current uppercase tracking-widest">
                  50.0 T SWL
                </text>
              </g>

              {/* Reactive Blueprint Annotation */}
              <g className={`transition-colors duration-300 ${isTyping ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                <line x1="260" y1="180" x2="330" y2="180" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="330" y1="175" x2="330" y2="185" stroke="currentColor" strokeWidth="1" />
                <text x="336" y="183" className="font-sans text-[10px] fill-current font-semibold">
                  Field Test Calibration
                </text>
              </g>
            </svg>
          </div>

          <div className="mt-4 text-center font-sans text-xs text-slate-500 dark:text-slate-400">
            Alliance Infinite · Heavy Equipment, Lifting & Pressure Vessel Inspection
          </div>
        </div>

        {/* Right 45% (span 5): Sign-In Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-[400px] rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#14171B] p-8 shadow-xl space-y-6 relative">
            {/* Card corner registration marks */}
            <RegistrationMarks />

            {/* Brand Header */}
            <div className="space-y-2">
              <AllianceLogo size={32} />
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white pt-2">
                Sign in to your account
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Access your industrial inspection workspace, work orders, and statutory certificates.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 font-sans">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-sans">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsTyping(true);
                  }}
                  placeholder="operator@alliance.sa"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 h-10 px-3.5 text-sm font-sans text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-sans">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 h-10 px-3.5 text-sm font-sans text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-sans font-semibold text-sm tracking-tight transition-all flex items-center justify-center gap-2 shadow-xs shadow-blue-500/25 disabled:opacity-50"
              >
                {loading ? (
                  <MachineLoader scene="gears" size={20} />
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Demo Operator Fast-Fill Strip */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-sans font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Quick Demo Accounts:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@demo.local')}
                  className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-left truncate transition-colors font-medium"
                >
                  Admin (Tariq)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('engineer@demo.local')}
                  className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-left truncate transition-colors font-medium"
                >
                  Engineer (Faisal)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('sales@demo.local')}
                  className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-left truncate transition-colors font-medium"
                >
                  Sales (Sarah)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('finance@demo.local')}
                  className="px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-left truncate transition-colors font-medium"
                >
                  Finance (Mona)
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center font-sans text-xs text-slate-400">
              Alliance Infinite · Industrial Inspection System
            </div>
          </div>
        </div>
      </div>
          
      <style jsx>{`
        @keyframes craneSway {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(1.2deg); }
          75% { transform: rotate(-1.2deg); }
        }
        @keyframes amberGlint {
          0%, 90%, 100% { opacity: 0.3; }
          95% { opacity: 1; }
        }
      `}</style>
    </DraftingGrid>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <MachineLoader scene="crane" size={64} caption="LOADING AUTHENTICATION GATEWAY…" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
