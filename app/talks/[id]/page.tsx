import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllTalks, getTalk } from '@/lib/data';
import { FavoriteStar } from '@/components/FavoriteStar';

export function generateStaticParams() {
  return getAllTalks().map((t) => ({ id: t.id }));
}

export default async function TalkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const talk = getTalk(id);
  if (!talk) notFound();

  return (
    <article className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span
              className={`px-1.5 py-0.5 rounded ${
                talk.kind === 'tutorial'
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                  : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
              }`}
            >
              {talk.kind === 'tutorial' ? 'Tutorial' : 'Talk'}
            </span>
            {talk.level && <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{talk.level}</span>}
          </div>
          <h1 className="text-xl font-bold leading-tight mt-1">{talk.title}</h1>
        </div>
        <FavoriteStar talkId={talk.id} size="lg" />
      </div>

      <dl className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">When</dt>
          <dd className="font-medium">{talk.day}</dd>
          <dd className="text-slate-600 dark:text-slate-400 text-xs">
            {talk.startTime}{talk.endTime ? ` – ${talk.endTime}` : ''}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs uppercase tracking-wide text-slate-500">Where</dt>
          <dd className="font-medium">{talk.room ?? '—'}</dd>
        </div>
      </dl>

      <section>
        <h2 className="text-xs uppercase tracking-wide text-slate-500 mb-1">Speakers</h2>
        <ul className="flex flex-wrap gap-2">
          {talk.speakers.map((s) => (
            <li key={s.id}>
              <Link
                href={`/speakers/${s.id}`}
                className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm hover:border-slate-400"
              >
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-wide text-slate-500 mb-1">Description</h2>
        <p className="text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
          {talk.abstract}
        </p>
      </section>

      <a
        href={talk.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-xs text-slate-500 underline pt-2"
      >
        View original on pycon.org
      </a>
    </article>
  );
}
