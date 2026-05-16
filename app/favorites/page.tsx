import { getAllTalks, compareTalksBySchedule } from '@/lib/data';
import { FavoritesClient } from '@/components/FavoritesClient';

export default function FavoritesPage() {
  const talks = [...getAllTalks()].sort(compareTalksBySchedule);
  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">My favorites</h1>
      <FavoritesClient talks={talks} />
    </div>
  );
}
