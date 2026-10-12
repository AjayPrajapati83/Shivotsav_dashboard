'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Download, RotateCcw, Ban, Search, Filter, Trash2 } from 'lucide-react';
import { voidEntryAction, unvoidEntryAction, deleteEntryAction } from '../actions';
import { CODE_LABELS } from '@/lib/scoring';
import type { HistoryRow, College, Event, ScoreCode } from '@/lib/types';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function downloadHistoryCSV(rows: HistoryRow[]) {
  const headers = ['Time', 'College', 'Event', 'Code', 'Points', 'Note', 'Status'];
  const csvRows = rows.map((r) => [
    r.created_at,
    r.college_name,
    r.event_name || '-',
    r.code,
    r.points,
    (r.note || '-').replace(/,/g, ';'),
    r.voided_at ? 'Voided' : 'Active',
  ]);
  const csv = [headers, ...csvRows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shivotsav-history-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function HistoryClient({
  initialRows,
  initialTotal,
  colleges,
  events,
}: {
  initialRows: HistoryRow[];
  initialTotal: number;
  colleges: College[];
  events: Event[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rows, setRows] = useState(initialRows);
  const [filterCollege, setFilterCollege] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [filterVoided, setFilterVoided] = useState<'all' | 'active' | 'voided'>('all');
  const [voidingId, setVoidingId] = useState<number | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  const filtered = rows.filter((r) => {
    if (filterCollege && r.college_name.toLowerCase() !== filterCollege.toLowerCase()) return false;
    if (filterCode && r.code !== filterCode) return false;
    if (filterVoided === 'active' && r.voided_at) return false;
    if (filterVoided === 'voided' && !r.voided_at) return false;
    return true;
  });

  async function handleVoid(id: number) {
    if (!voidReason.trim()) { showToast('Reason required', 'error'); return; }
    startTransition(async () => {
      const res = await voidEntryAction(id, voidReason);
      if (res.error) showToast(res.error, 'error');
      else { 
        showToast('Entry voided', 'success'); 
        setVoidingId(null); 
        setVoidReason(''); 
        // Update local state to mark as voided
        setRows(prevRows => prevRows.map(r => 
          r.id === id 
            ? { ...r, voided_at: new Date().toISOString(), void_reason: voidReason } 
            : r
        ));
        router.refresh(); 
      }
    });
  }

  async function handleUnvoid(id: number) {
    startTransition(async () => {
      const res = await unvoidEntryAction(id);
      if (res.error) showToast(res.error, 'error');
      else { 
        showToast('Entry restored', 'success'); 
        // Update local state to unvoid
        setRows(prevRows => prevRows.map(r => 
          r.id === id 
            ? { ...r, voided_at: null, void_reason: null, voided_by: null } 
            : r
        ));
        router.refresh(); 
      }
    });
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      const res = await deleteEntryAction(id);
      if (res.error) showToast(res.error, 'error');
      else { 
        showToast('Entry permanently deleted', 'success'); 
        setDeletingId(null); 
        // Remove from local state immediately
        setRows(prevRows => prevRows.filter(r => r.id !== id));
        // Also refresh from server
        router.refresh(); 
      }
    });
  }

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg max-w-sm ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Void dialog */}
      {voidingId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-medium text-slate-800 mb-3">Void Entry #{voidingId}</h3>
            <p className="text-sm text-slate-500 mb-3">
              This will remove the points from totals. Provide a reason:
            </p>
            <input
              type="text"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="Reason for voiding..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[16px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-200 mb-3"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setVoidingId(null); setVoidReason(''); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVoid(voidingId)}
                disabled={isPending || !voidReason.trim()}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2.5 text-sm font-medium min-h-[44px] disabled:opacity-50"
              >
                Void
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete dialog */}
      {deletingId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-medium text-red-700 mb-3 flex items-center gap-2">
              <Trash2 size={20} />
              Permanently Delete Entry #{deletingId}
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              ⚠️ <strong>Warning:</strong> This will permanently delete this entry from the database. 
              This action cannot be undone. Consider using "Void" instead to keep an audit trail.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 text-sm font-medium min-h-[44px] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 font-cinzel">History</h1>
          <p className="text-sm text-slate-400">{initialTotal} total entries</p>
        </div>
        <div className="flex gap-2">
          {filtered.filter(r => r.voided_at).length > 0 && (
            <button
              onClick={async () => {
                if (!confirm(`Permanently delete all ${filtered.filter(r => r.voided_at).length} voided entries? This cannot be undone!`)) return;
                const voidedIds = filtered.filter(r => r.voided_at).map(r => r.id);
                for (const id of voidedIds) {
                  await handleDelete(id);
                }
              }}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors min-h-[44px]"
            >
              <Trash2 size={16} />
              Delete All Voided
            </button>
          )}
          <button
            onClick={() => downloadHistoryCSV(filtered)}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors min-h-[44px]"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={filterCollege}
          onChange={(e) => setFilterCollege(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 min-h-[44px]"
        >
          <option value="">All Colleges</option>
          {colleges.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        <select
          value={filterCode}
          onChange={(e) => setFilterCode(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 min-h-[44px]"
        >
          <option value="">All Codes</option>
          {Object.entries(CODE_LABELS).map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>

        <div className="flex gap-2">
          {(['all', 'active', 'voided'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterVoided(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px] capitalize ${
                filterVoided === v
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-3 font-medium text-slate-500 text-xs">Time</th>
                <th className="text-left px-3 py-3 font-medium text-slate-500 text-xs">College</th>
                <th className="text-left px-3 py-3 font-medium text-slate-500 text-xs">Event</th>
                <th className="text-left px-3 py-3 font-medium text-slate-500 text-xs">Code</th>
                <th className="text-right px-3 py-3 font-medium text-slate-500 text-xs">Points</th>
                <th className="text-left px-3 py-3 font-medium text-slate-500 text-xs">Note</th>
                <th className="text-center px-3 py-3 font-medium text-slate-500 text-xs">Status</th>
                <th className="text-right px-3 py-3 font-medium text-slate-500 text-xs">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No entries found
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-slate-100 hover:bg-slate-50/50 ${
                      row.voided_at ? 'opacity-50 bg-red-50/30' : ''
                    }`}
                  >
                    <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-700 text-xs">{row.college_name}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">{row.event_name || '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                        row.code.startsWith('PODIUM') ? 'bg-amber-100 text-amber-700' :
                        row.code === 'CUSTOM' ? 'bg-purple-100 text-purple-700' :
                        row.points < 0 ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {row.code}
                      </span>
                    </td>
                    <td className={`px-3 py-2.5 text-right font-mono text-xs font-medium ${
                      row.points > 0 ? 'text-emerald-600' : row.points < 0 ? 'text-red-500' : 'text-slate-400'
                    }`}>
                      {row.points > 0 ? `+${row.points}` : row.points}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-500 max-w-[150px] truncate" title={row.note || ''}>
                      {row.note || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                        row.voided_at ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {row.voided_at ? 'Voided' : 'Active'}
                      </span>
                      {row.voided_at && row.void_reason && (
                        <span className="block text-[9px] text-slate-400 mt-0.5" title={row.void_reason}>
                          {row.void_reason}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {row.voided_at ? (
                          <>
                            <button
                              onClick={() => handleUnvoid(row.id)}
                              disabled={isPending}
                              className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                              title="Restore entry"
                            >
                              <RotateCcw size={14} />
                            </button>
                            <button
                              onClick={() => setDeletingId(row.id)}
                              disabled={isPending}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                              title="Permanently delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setVoidingId(row.id)}
                              disabled={isPending}
                              className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                              title="Void entry"
                            >
                              <Ban size={14} />
                            </button>
                            <button
                              onClick={() => setDeletingId(row.id)}
                              disabled={isPending}
                              className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                              title="Permanently delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
