'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useFavorites } from '@/lib/useFavorites';
import type { Talk } from '@/lib/types';
import { findConflicts } from '@/lib/time';
import { TalkCard } from './TalkCard';

export function FavoritesClient({ talks }: { talks: Talk[] }) {
  const { favorites, hydrated } = useFavorites();
  const starred = talks.filter((t) => favorites.has(t.id));
  const conflicts = useMemo(() => findConflicts(starred), [starred]);

  if (!hydrated) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (starred.length === 0) {
    return (
      <div className="mt-8 text-center space-y-2">
        <p className="text-slate-500">No favorites yet.</p>
        <p className="text-xs text-slate-400">
          Tap the star on any talk to save it here. Saved on this device only.
        </p>
        <Link
          href="/schedule"
          className="inline-block mt-3 px-4 py-2 rounded-full bg-blue-600 text-white text-sm"
        >
          Browse schedule
        </Link>
      </div>
    );
  }

  const conflictCount = conflicts.size;

  return (
    <div className="space-y-3">
      {conflictCount > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
          <span className="font-semibold">⚠️ {conflictCount} time conflict{conflictCount === 1 ? '' : 's'}.</span>{' '}
          Some of your favorites overlap.
        </div>
      )}
      <ul className="grid grid-cols-1 gap-2">
        {starred.map((t) => {
          const overlapping = conflicts.get(t.id) ?? [];
          return (
            <li key={t.id} className="min-w-0">
              <TalkCard talk={t} />
              {overlapping.length > 0 && (
                <div className="mt-1 ml-3 text-[11px] text-amber-700 dark:text-amber-300">
                  ⚠️ Overlaps with{' '}
                  {overlapping.map((o, i) => (
                    <span key={o.id}>
                      <Link href={`/talks/${o.id}`} className="underline">
                        {o.title}
                      </Link>
                      {i < overlapping.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
