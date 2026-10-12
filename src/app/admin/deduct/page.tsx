import { getColleges, getEvents } from '@/server/admin';
import { DeductClient } from './DeductClient';

// Revalidate every 30 seconds
export const revalidate = 30;

export default async function DeductPage() {
  let colleges, events;
  try {
    [colleges, events] = await Promise.all([getColleges(), getEvents()]);
  } catch {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Failed to load data. Please refresh.</p>
      </div>
    );
  }

  const activeColleges = colleges.filter((c) => c.is_active);
  return <DeductClient colleges={activeColleges} events={events} />;
}
