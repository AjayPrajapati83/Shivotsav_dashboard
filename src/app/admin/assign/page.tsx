import { getColleges, getEvents } from '@/server/admin';
import { AssignClient } from './AssignClient';

// Revalidate every 30 seconds - colleges and events don't change often
export const revalidate = 30;

export default async function AssignPage() {
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
  return <AssignClient colleges={activeColleges} events={events} />;
}
