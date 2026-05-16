import { getAllSpeakers, getAllTalks } from '@/lib/data';
import { SpeakerListClient } from '@/components/SpeakerListClient';

export default function SpeakersPage() {
  const speakers = getAllSpeakers();
  const talksById = Object.fromEntries(
    getAllTalks().map((t) => [t.id, { id: t.id, title: t.title, abstract: t.abstract }]),
  );

  return (
    <div>
      <h1 className="text-xl font-semibold mb-2">Speakers</h1>
      <SpeakerListClient speakers={speakers} talksById={talksById} />
    </div>
  );
}
