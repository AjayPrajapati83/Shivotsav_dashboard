'use client';

import { useState, useMemo } from 'react';
import { Search, Download, Trophy, ArrowUpDown } from 'lucide-react';
import type { StandingsRow, DepartmentTrophy } from '@/lib/types';

function downloadCSV(standings: StandingsRow[]) {
  const headers = ['Rank', 'College', 'Event Points', 'Custom +/-', 'Total'];
  const rows = standings.map((s) => [
    s.rank ?? '-',
    s.name,
    s.event_points,
    s.custom_points,
    s.total,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shivotsav-standings-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function StandingsClient({
  standings,
  trophies,
}: {
  standings: StandingsRow[];
  trophies: DepartmentTrophy[];
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'rank' | 'name' | 'total'>('rank');
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = useMemo(() => {
    let list = standings.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'rank') cmp = (a.rank ?? 999) - (b.rank ?? 999);
      else if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'total') cmp = a.total - b.total;
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [standings, search, sortKey, sortAsc]);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 font-cinzel">
            Standings
          </h1>
          <p className="text-sm text-slate-400">Live points table & department trophies</p>
        </div>
        <button
          onClick={() => downloadCSV(standings)}
          className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors min-h-[44px]"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          type="text"
          placeholder="Search colleges..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-[16px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-medium text-slate-500">
                  <button onClick={() => toggleSort('rank')} className="flex items-center gap-1 hover:text-slate-700 min-h-[32px]">
                    Rank <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-slate-700 min-h-[32px]">
                    College <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Event Pts</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Custom +/−</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">
                  <button onClick={() => toggleSort('total')} className="flex items-center gap-1 justify-end hover:text-slate-700 min-h-[32px] ml-auto">
                    Total <ArrowUpDown size={12} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    {standings.length === 0 ? 'No data yet' : 'No colleges match your search'}
                  </td>
                </tr>
              ) : (
                sorted.map((row) => (
                  <tr key={row.college_id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        row.rank === 1 ? 'bg-amber-100 text-amber-700' :
                        row.rank === 2 ? 'bg-slate-200 text-slate-600' :
                        row.rank === 3 ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {row.rank ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-700">{row.name}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">{row.event_points}</td>
                    <td className={`px-4 py-3 text-right font-mono ${
                      row.custom_points > 0 ? 'text-emerald-600' :
                      row.custom_points < 0 ? 'text-red-500' :
                      'text-slate-400'
                    }`}>
                      {row.custom_points > 0 ? `+${row.custom_points}` : row.custom_points}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">{row.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Trophies */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 font-cinzel flex items-center gap-2 mb-4">
          <Trophy size={20} className="text-amber-500" />
          Departmental Trophies
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trophies.map((trophy) => (
            <div
              key={trophy.department}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <h3 className="font-medium text-slate-700 text-sm mb-2">{trophy.department}</h3>
              {trophy.winners.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No points yet</p>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {trophy.winners[0].college_name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {trophy.winners[0].total} pts
                    </span>
                  </div>
                  {trophy.is_tie && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">
                      + {trophy.winners.length - 1} more (TIE)
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
