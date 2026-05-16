'use client';

import { useEffect } from 'react';

export function RegisterServiceWorker() {
  useEffect(() => {
    // Don't register the SW during dev — Next's HMR and the SW cache fight each other,
    // producing stale chunks and confusing error overlays.
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* registration failure is non-fatal — the app works fine without offline. */
    });
  }, []);
  return null;
}
