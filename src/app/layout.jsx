import { Plus_Jakarta_Sans, Inter, JetBrains_Mono, Cinzel } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '../components/theme-provider';
import './globals.css';

const fontDisplay = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const fontSans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

const fontCertificate = Cinzel({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-certificate',
  display: 'swap',
});

export const metadata = {
  title: 'Alliance Infinite — Industrial Inspection & Certification Platform',
  description: 'Statutory third-party inspection, gate-pass credential verification, and QR certification for lifting gear, pressure vessels, pipelines, and HSE.'
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} ${fontCertificate.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-canvas text-text-main min-h-screen selection:bg-amber-500/20 selection:text-text-main">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'border border-border bg-surface-1 text-text-main shadow-whisper text-xs font-sans rounded-md'
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
