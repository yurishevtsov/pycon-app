import type { Talk } from './types';

// PyCon US 2026 runs May 13–17, all within Pacific Daylight Time (UTC-7).
// Hardcoding the offset avoids pulling in date-fns-tz / luxon for one-off use.
const CONFERENCE_DAYS: ReadonlyArray<{ day: string; date: string }> = [
  { day: 'Wednesday', date: '2026-05-13' },
  { day: 'Thursday', date: '2026-05-14' },
  { day: 'Friday', date: '2026-05-15' },
  { day: 'Saturday', date: '2026-05-16' },
  { day: 'Sunday', date: '2026-05-17' },
];

const PACIFIC_OFFSET = '-07:00';

export const CONFERENCE_START = new Date(`2026-05-13T00:00:00${PACIFIC_OFFSET}`);
export const CONFERENCE_END = new Date(`2026-05-17T23:59:59${PACIFIC_OFFSET}`);

function parseTimeOnDate(dateISO: string, timeStr: string): Date | null {
  // Accepts "5 p.m.", "11:30 a.m.", "9 a.m.", "9:00 a.m."
  const m = timeStr.toLowerCase().match(/(\d{1,2})(?::(\d{2}))?\s*(a\.m\.|p\.m\.)/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  if (m[3] === 'p.m.' && h !== 12) h += 12;
  if (m[3] === 'a.m.' && h === 12) h = 0;
  const hh = String(h).padStart(2, '0');
  const mm = String(min).padStart(2, '0');
  return new Date(`${dateISO}T${hh}:${mm}:00${PACIFIC_OFFSET}`);
}

export interface TalkInterval {
  start: Date;
  end: Date;
}

export function getTalkInterval(talk: Talk): TalkInterval | null {
  if (!talk.day || !talk.startTime) return null;
  const dayInfo = CONFERENCE_DAYS.find((d) => d.day === talk.day);
  if (!dayInfo) return null;
  const start = parseTimeOnDate(dayInfo.date, talk.startTime);
  if (!start) return null;
  const endParsed = talk.endTime ? parseTimeOnDate(dayInfo.date, talk.endTime) : null;
  // Default to 30 min if the page didn't list an explicit end time.
  const end = endParsed ?? new Date(start.getTime() + 30 * 60_000);
  return { start, end };
}

export function intervalsOverlap(a: TalkInterval, b: TalkInterval): boolean {
  return a.start < b.end && b.start < a.end;
}

export function findConflicts(talks: Talk[]): Map<string, Talk[]> {
  const intervals = talks
    .map((t) => ({ talk: t, i: getTalkInterval(t) }))
    .filter((x): x is { talk: Talk; i: TalkInterval } => x.i !== null);
  const conflicts = new Map<string, Talk[]>();
  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      if (intervalsOverlap(intervals[i].i, intervals[j].i)) {
        const a = intervals[i].talk.id;
        const b = intervals[j].talk.id;
        if (!conflicts.has(a)) conflicts.set(a, []);
        if (!conflicts.has(b)) conflicts.set(b, []);
        conflicts.get(a)!.push(intervals[j].talk);
        conflicts.get(b)!.push(intervals[i].talk);
      }
    }
  }
  return conflicts;
}

export function formatRelative(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime();
  const mins = Math.round(diffMs / 60_000);
  if (mins <= 0) return 'now';
  if (mins < 60) return `in ${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hours < 24) return rem === 0 ? `in ${hours}h` : `in ${hours}h ${rem}m`;
  const days = Math.floor(hours / 24);
  return `in ${days} day${days === 1 ? '' : 's'}`;
}
