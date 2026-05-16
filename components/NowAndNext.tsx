'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Talk } from '@/lib/types';
import {
  CONFERENCE_END,
  CONFERENCE_START,
  formatRelative,
  getTalkInterval,
} from '@/lib/time';

interface Props {
  talks: Talk[];
}

interface Resolved {
  talk: Talk;
  start: Date;
  end: Date;
}

function resolveAll(talks: Talk[]): Resolved[] {
  return talks
    .map((talk) => {
      const i = getTalkInterval(talk);
      return i ? { talk, start: i.start, end: i.end } : null;
    })
    .filter((x): x is Resolved => x !== null);
}

function MiniTalk({ talk, prefix }: { talk: Talk; prefix?: string }) {
  return (
    <Link
      href={`/talks/${talk.id}`}
      className="block rounded-lg bg-white/10 hover:bg-white/15 transition-colors p-2.5"
    >
      {prefix && <div className="text-[11px] uppercase tracking-wide text-white/70">{prefix}</div>}
      <div className="text-sm font-medium leading-snug break-words">{talk.title}</div>
      <div className="text-xs text-white/70 mt-0.5 truncate">
        {talk.room} · {talk.speakers.map((s) => s.name).join(', ')}
      </div>
    </Link>
  );
}

export function NowAndNext({ talks }: Props) {
  // Lazy initializer + effect ensures stable SSR/hydration shell that then updates client-side.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    // Skeleton so layout doesn't shift on hydration.
    return (
      <section className="rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white p-5">
        <div className="h-5 w-28 rounded bg-white/20 animate-pulse" />
        <div className="mt-3 h-12 rounded bg-white/10 animate-pulse" />
      </section>
    );
  }

  // Outside the conference window
  if (now < CONFERENCE_START) {
    return (
      <section className="rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white p-5">
        <div className="text-xs uppercase tracking-wide text-blue-200">Coming up</div>
        <div className="mt-1 text-lg font-semibold">
          Conference starts {formatRelative(CONFERENCE_START, now)}
        </div>
        <div className="mt-1 text-xs text-blue-200">Wednesday, May 13, 2026 · Long Beach</div>
      </section>
    );
  }

  if (now > CONFERENCE_END) {
    return (
      <section className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white p-5">
        <div className="text-xs uppercase tracking-wide text-slate-300">That's a wrap</div>
        <div className="mt-1 text-lg font-semibold">PyCon US 2026 has ended.</div>
        <div className="mt-1 text-xs text-slate-300">Thanks for an amazing week.</div>
      </section>
    );
  }

  // During the conference: compute happening-now + upcoming.
  const resolved = resolveAll(talks);
  const happening = resolved
    .filter((r) => r.start <= now && now < r.end)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const upcoming = resolved
    .filter((r) => r.start > now && r.start.getTime() - now.getTime() <= 60 * 60_000)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 4);

  const nothing = happening.length === 0 && upcoming.length === 0;

  return (
    <section className="rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white p-5 space-y-3">
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-blue-200">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          Happening now
        </div>
        {happening.length === 0 ? (
          <div className="text-sm text-white/80 mt-1">No sessions in progress.</div>
        ) : (
          <ul className="mt-2 grid grid-cols-1 gap-2">
            {happening.slice(0, 3).map((r) => (
              <li key={r.talk.id} className="min-w-0">
                <MiniTalk talk={r.talk} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {upcoming.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wide text-blue-200">Up next</div>
          <ul className="mt-2 grid grid-cols-1 gap-2">
            {upcoming.map((r) => (
              <li key={r.talk.id} className="min-w-0">
                <MiniTalk talk={r.talk} prefix={formatRelative(r.start, now)} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {nothing && (
        <div className="text-sm text-white/80">
          No sessions scheduled in the next hour. Take a break.
        </div>
      )}
    </section>
  );
}
