'use client';

import { useCallback, useEffect, useState } from 'react';

const KEY = 'pycon-app:favorites:v1';

function readStore(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeStore(s: Set<string>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...s]));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFavorites(readStore());
    setHydrated(true);
    function onStorage(e: StorageEvent) {
      if (e.key === KEY) setFavorites(readStore());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = useCallback((talkId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(talkId)) next.delete(talkId);
      else next.add(talkId);
      writeStore(next);
      return next;
    });
  }, []);

  return { favorites, toggle, hydrated };
}
