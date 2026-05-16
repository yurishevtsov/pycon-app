import { getAllTalks } from '@/lib/data';
import { ScheduleClient } from '@/components/ScheduleClient';

export default function SchedulePage() {
  const talks = getAllTalks();
  return (
    <div>
      <h1 className="text-xl font-semibold mb-2">Schedule</h1>
      <ScheduleClient talks={talks} />
    </div>
  );
}
