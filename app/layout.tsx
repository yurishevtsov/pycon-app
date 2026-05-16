import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { RegisterServiceWorker } from '@/components/RegisterServiceWorker';
import './globals.css';

export const metadata: Metadata = {
  title: 'PyCon US 2026',
  description: 'Browse PyCon US 2026 speakers, talks, and schedule. Star your favorites.',
  applicationName: 'PyCon 2026',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PyCon 2026',
  },
};

export const viewport: Viewport = {
  themeColor: '#1e3a8a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex-1 flex items-center justify-center px-2 py-3 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      {label}
    </Link>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight">
              PyCon US 2026
            </Link>
            <span className="text-xs text-slate-500">May 13–17 · Long Beach</span>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-4 pb-24">{children}</main>
        <RegisterServiceWorker />
        <nav
          className="fixed bottom-0 inset-x-0 z-20 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          aria-label="Primary"
        >
          <div className="mx-auto max-w-3xl flex">
            <NavLink href="/" label="Home" />
            <NavLink href="/speakers" label="Speakers" />
            <NavLink href="/schedule" label="Schedule" />
            <NavLink href="/favorites" label="Stars" />
          </div>
        </nav>
      </body>
    </html>
  );
}
