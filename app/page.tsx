import Link from 'next/link';
import { getAllSpeakers, getAllTalks } from '@/lib/data';

export default function Home() {
  const speakers = getAllSpeakers();
  const talks = getAllTalks();
  const talkCount = talks.filter((t) => t.kind === 'talk').length;
  const tutorialCount = talks.filter((t) => t.kind === 'tutorial').length;

  const tile =
    'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between hover:border-slate-400 dark:hover:border-slate-600 transition-colors';

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white p-5">
        <h1 className="text-2xl font-bold tracking-tight">PyCon US 2026</h1>
        <p className="mt-1 text-blue-100 text-sm">
          {speakers.length} speakers · {talkCount} talks · {tutorialCount} tutorials
        </p>
      </section>

      <div className="grid gap-3 grid-cols-2">
        <Link href="/speakers" className={tile}>
          <span className="font-medium">Speakers</span>
          <span className="text-2xl">{speakers.length}</span>
        </Link>
        <Link href="/schedule" className={tile}>
          <span className="font-medium">Schedule</span>
          <span className="text-2xl">{talks.length}</span>
        </Link>
        <Link href="/favorites" className={`${tile} col-span-2`}>
          <span className="font-medium">My favorites</span>
          <span className="text-xs text-slate-500">Saved locally to your device</span>
        </Link>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Unofficial mobile-friendly browser for PyCon US 2026. Data scraped from{' '}
        <a className="underline" href="https://us.pycon.org/2026/" target="_blank" rel="noopener noreferrer">
          us.pycon.org
        </a>
        .
      </p>
    </div>
  );
}
