import { getPublicEvents } from '@/server/leaderboard';
import { getRole } from '@/server/session';
import { redirect } from 'next/navigation';
import { CLDashboard } from './CLDashboard';

export default async function CLPage() {
  const role = await getRole();
  if (!role) redirect('/login');

  const events = await getPublicEvents();

  return <CLDashboard events={events} />;
}
