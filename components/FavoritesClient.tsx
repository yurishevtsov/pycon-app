'use client';

import Link from 'next/link';
import { useFavorites } from '@/lib/useFavorites';
import type { Talk } from '@/lib/types';
import { TalkCard } from './TalkCard';

export function FavoritesClient({ talks }: { talks: Talk[] }) {
  const { favorites, hydrated } = useFavorites();
  const starred = talks.filter((t) => favorites.has(t.id));

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

  return (
    <ul className="grid grid-cols-1 gap-2">
      {starred.map((t) => (
        <li key={t.id} className="min-w-0">
          <TalkCard talk={t} />
        </li>
      ))}
    </ul>
  );
}
