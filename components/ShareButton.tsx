'use client';

import { useEffect, useState } from 'react';

interface Props {
  title: string;
  text?: string;
  className?: string;
}

export function ShareButton({ title, text, className }: Props) {
  const [supported, setSupported] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && 'share' in navigator);
  }, []);

  async function onClick() {
    const url = window.location.href;
    if (supported) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        /* user cancelled */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignored */
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={supported ? 'Share' : 'Copy link'}
      className={
        className ??
        'inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs hover:border-slate-400'
      }
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"
        />
      </svg>
      {copied ? 'Copied' : supported ? 'Share' : 'Copy link'}
    </button>
  );
}
