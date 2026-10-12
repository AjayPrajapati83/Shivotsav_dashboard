import { getStandings, getDepartmentTrophies } from '@/server/admin';
import { StandingsClient } from './StandingsClient';

export default async function AdminStandingsPage() {
  let standings, trophies;
  try {
    [standings, trophies] = await Promise.all([
      getStandings(),
      getDepartmentTrophies(),
    ]);
  } catch (e) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Failed to load data. Please refresh.</p>
      </div>
    );
  }

  return <StandingsClient standings={standings} trophies={trophies} />;
}
