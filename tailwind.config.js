/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.5rem', md: '2rem' },
      screens: { '2xl': '1440px' },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Geist', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Geist', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['var(--font-display)', 'Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Geist Mono', 'JetBrains Mono', 'ui-monospace', 'monospace'],
        certificate: ['var(--font-certificate)', 'Cinzel', 'serif'],
      },
      colors: {
        // ── Surfaces & structure ──────────────────────────────
        canvas: 'var(--canvas)',
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
          4: 'var(--surface-4)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        // ── Text ──────────────────────────────────────────────
        fg: {
          DEFAULT: 'var(--text)',
          muted: 'var(--text-2)',
          faint: 'var(--text-3)',
        },
        // ── Accents ───────────────────────────────────────────
        'safety-amber': {
          DEFAULT: 'var(--amber-fill)',
          fill: 'var(--amber-fill)',
          text: 'var(--amber-text)',
          soft: 'var(--amber-soft)',
        },
        'signal-teal': {
          DEFAULT: 'var(--teal-fill)',
          fill: 'var(--teal-fill)',
          text: 'var(--teal-text)',
          soft: 'var(--teal-soft)',
        },
        // ── Status ────────────────────────────────────────────
        status: {
          valid: 'var(--status-valid-text)',
          'valid-bg': 'var(--status-valid-bg)',
          'valid-border': 'var(--status-valid-border)',
          expiring: 'var(--status-expiring-text)',
          'expiring-bg': 'var(--status-expiring-bg)',
          'expiring-border': 'var(--status-expiring-border)',
          expired: 'var(--status-expired-text)',
          'expired-bg': 'var(--status-expired-bg)',
          'expired-border': 'var(--status-expired-border)',
          neutral: 'var(--status-neutral-text)',
          'neutral-bg': 'var(--status-neutral-bg)',
          'neutral-border': 'var(--status-neutral-border)',
        },
        // ── shadcn bridge (HSL vars) ──────────────────────────
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // ── Charts ────────────────────────────────────────────
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },

        // ── LEGACY (kept for backward compatibility) ──────────
        // TODO: remove these after migrating any remaining usages
        alabaster: '#F8FAFC',
        obsidian: {
          950: '#060911',
          900: '#0B0F19',
          800: '#111827',
          700: '#1E293B',
          600: '#334155',
        },
        'text-main': 'var(--text)',
        'text-muted': 'var(--text-2)',
        'text-faint': 'var(--text-3)',
      },
      boxShadow: {
        whisper: 'var(--shadow-whisper)',
        raised: 'var(--shadow-raised)',
        popover: 'var(--shadow-popover)',
        modal: 'var(--shadow-modal)',
        // Legacy — re-tinted to warm stone (was cool slate)
        elevation: '0 4px 20px -2px rgba(28, 25, 23, 0.05), 0 1px 3px 0 rgba(28, 25, 23, 0.03)',
        'elevation-hover': '0 10px 25px -3px rgba(28, 25, 23, 0.08), 0 4px 6px -2px rgba(28, 25, 23, 0.04)',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      },
      keyframes: {
        qrScan: {
          '0%': { top: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        scanline: {
          '0%': { top: '0%', opacity: '0.7' },
          '50%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0.7' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        waveBar: {
          '0%, 100%': { height: '4px' },
          '50%': { height: '16px' },
        },
      },
      animation: {
        'qr-scan': 'qrScan 1.2s ease-in-out forwards',
        scanline: 'scanline 2.2s ease-in-out infinite alternate',
        radar: 'radarSweep 3s linear infinite',
        'wave-1': 'waveBar 1.2s ease-in-out infinite',
        'wave-2': 'waveBar 0.9s ease-in-out infinite 0.2s',
        'wave-3': 'waveBar 1.4s ease-in-out infinite 0.4s',
        'wave-4': 'waveBar 1.1s ease-in-out infinite 0.1s',
      },
    },
  },
  plugins: [],
};