import { getHistory, getColleges, getEvents } from '@/server/admin';
import { HistoryClient } from './HistoryClient';

// Don't cache history - always fetch fresh data
export const revalidate = 0;

export default async function HistoryPage() {
  let historyData, colleges, events;
  try {
    [historyData, colleges, events] = await Promise.all([
      getHistory({ limit: 50 }),
      getColleges(),
      getEvents(),
    ]);
  } catch {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Failed to load history. Please refresh.</p>
      </div>
    );
  }

  return (
    <HistoryClient
      initialRows={historyData.rows}
      initialTotal={historyData.total}
      colleges={colleges}
      events={events}
    />
  );
}
