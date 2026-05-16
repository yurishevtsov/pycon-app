import Link from 'next/link';
import type { Talk } from '@/lib/types';
import { FavoriteStar } from './FavoriteStar';

export function TalkCard({ talk, showDay = true }: { talk: Talk; showDay?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <Link href={`/talks/${talk.id}`} className="block group">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span
                className={`px-1.5 py-0.5 rounded ${
                  talk.kind === 'tutorial'
                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                    : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                }`}
              >
                {talk.kind === 'tutorial' ? 'Tutorial' : 'Talk'}
              </span>
              {showDay && talk.day && <span>{talk.day}</span>}
              {talk.startTime && <span>{talk.startTime}</span>}
              {talk.room && <span className="truncate">· {talk.room}</span>}
            </div>
            <div className="font-medium leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {talk.title}
            </div>
            <div className="mt-1 text-xs text-slate-500 truncate">
              {talk.speakers.map((s) => s.name).join(', ')}
            </div>
          </Link>
        </div>
        <FavoriteStar talkId={talk.id} />
      </div>
    </div>
  );
}
