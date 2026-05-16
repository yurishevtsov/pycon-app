'use client';

import { useMemo, useState } from 'react';
import type { Speaker, Talk } from '@/lib/types';
import { SpeakerCard } from './SpeakerCard';

interface Props {
  speakers: Speaker[];
  talksById: Record<string, Pick<Talk, 'id' | 'title' | 'abstract'>>;
}

export function SpeakerListClient({ speakers, talksById }: Props) {
  const [query, setQuery] = useState('');

  // Pre-compute a lowercased search blob per speaker (name + talk titles + abstracts).
  const index = useMemo(
    () =>
      speakers.map((s) => {
        const talkBlob = s.talkIds
          .map((id) => {
            const t = talksById[id];
            return t ? `${t.title} ${t.abstract}` : '';
          })
          .join(' ');
        return {
          speaker: s,
          haystack: `${s.name} ${s.bio} ${talkBlob}`.toLowerCase(),
        };
      }),
    [speakers, talksById],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index;
    return index.filter((row) => row.haystack.includes(q));
  }, [index, query]);

  return (
    <>
      <div className="sticky top-[57px] z-10 -mx-4 px-4 py-2 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur">
        <input
          type="search"
          inputMode="search"
          placeholder="Search speakers, talks, topics…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-base outline-none focus:border-blue-500"
          autoComplete="off"
        />
        <div className="mt-1 text-xs text-slate-500">
          {filtered.length} of {speakers.length} speakers
        </div>
      </div>
      <ul className="mt-3 grid gap-2 grid-cols-1 sm:grid-cols-2">
        {filtered.map(({ speaker }) => (
          <li key={speaker.id} className="min-w-0">
            <SpeakerCard speaker={speaker} talkCount={speaker.talkIds.length} />
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="mt-8 text-center text-slate-500">No speakers match "{query}".</p>
      )}
    </>
  );
}
