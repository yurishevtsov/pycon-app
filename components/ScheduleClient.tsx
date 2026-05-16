'use client';

import { useMemo, useState } from 'react';
import type { Talk } from '@/lib/types';
import { TalkCard } from './TalkCard';

const DAYS = ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHORT: Record<string, string> = {
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

export function ScheduleClient({ talks }: { talks: Talk[] }) {
  const availableDays = useMemo(
    () => DAYS.filter((d) => talks.some((t) => t.day === d)),
    [talks],
  );
  const [day, setDay] = useState<string>(availableDays[0] ?? 'Friday');
  const [kind, setKind] = useState<'all' | 'talk' | 'tutorial'>('all');

  const filtered = useMemo(() => {
    return talks
      .filter((t) => t.day === day)
      .filter((t) => kind === 'all' || t.kind === kind)
      .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));
  }, [talks, day, kind]);

  return (
    <div>
      <div className="sticky top-[57px] z-10 -mx-4 px-4 py-2 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur space-y-2">
        <div className="grid grid-cols-5 gap-1">
          {availableDays.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDay(d)}
              aria-label={d}
              className={`px-1 py-1.5 rounded-full text-sm font-medium transition-colors ${
                day === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className="sm:hidden">{SHORT[d] ?? d}</span>
              <span className="hidden sm:inline">{d}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['all', 'talk', 'tutorial'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                kind === k
                  ? 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {k === 'all' ? 'All' : k === 'talk' ? 'Talks' : 'Tutorials'}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-3 grid grid-cols-1 gap-2">
        {filtered.map((t) => (
          <li key={t.id} className="min-w-0">
            <TalkCard talk={t} showDay={false} />
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="mt-8 text-center text-slate-500">Nothing scheduled for that filter.</p>
      )}
    </div>
  );
}
