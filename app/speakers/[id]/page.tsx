import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  getAllSpeakers,
  getSpeaker,
  getTalksBySpeakerId,
  searchGitHub,
  searchLinkedIn,
  compareTalksBySchedule,
} from '@/lib/data';
import { TalkCard } from '@/components/TalkCard';

export function generateStaticParams() {
  return getAllSpeakers().map((s) => ({ id: s.id }));
}

export default async function SpeakerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const speaker = getSpeaker(id);
  if (!speaker) notFound();

  const talks = getTalksBySpeakerId(id).sort(compareTalksBySchedule);
  const linkedInUrl = searchLinkedIn(speaker.name);
  const githubUrl = searchGitHub(speaker.name);

  return (
    <article className="space-y-4">
      <header className="flex items-start gap-4">
        {speaker.photoUrl ? (
          <Image
            src={speaker.photoUrl}
            alt=""
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover bg-slate-100"
            priority
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xl text-slate-500 font-medium">
            {speaker.name
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold leading-tight break-words">{speaker.name}</h1>
          <p className="text-xs text-slate-500 mt-1">
            {talks.length} {talks.length === 1 ? 'session' : 'sessions'} at PyCon US 2026
          </p>
        </div>
      </header>

      {speaker.bio && (
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{speaker.bio}</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm font-medium text-center hover:border-slate-400"
        >
          Search LinkedIn
        </a>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm font-medium text-center hover:border-slate-400"
        >
          Search GitHub
        </a>
      </div>
      <p className="text-[11px] text-slate-500 -mt-2">
        Opens an external search by name. Results aren't guaranteed; login may be required for LinkedIn.
      </p>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Sessions
        </h2>
        <ul className="grid gap-2">
          {talks.map((t) => (
            <li key={t.id}>
              <TalkCard talk={t} />
            </li>
          ))}
        </ul>
      </section>

      <a
        href={speaker.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-xs text-slate-500 underline pt-2"
      >
        View original profile on pycon.org
      </a>
    </article>
  );
}
