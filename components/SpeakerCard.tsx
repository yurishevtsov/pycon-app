import Link from 'next/link';
import Image from 'next/image';
import type { Speaker } from '@/lib/types';

export function SpeakerCard({ speaker, talkCount }: { speaker: Speaker; talkCount: number }) {
  return (
    <Link
      href={`/speakers/${speaker.id}`}
      className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
    >
      {speaker.photoUrl ? (
        <Image
          src={speaker.photoUrl}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 rounded-full object-cover flex-shrink-0 bg-slate-100"
        />
      ) : (
        <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-slate-500 font-medium">
          {speaker.name
            .split(' ')
            .map((p) => p[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate">{speaker.name}</div>
        <div className="text-xs text-slate-500">
          {talkCount} {talkCount === 1 ? 'session' : 'sessions'}
        </div>
      </div>
    </Link>
  );
}
