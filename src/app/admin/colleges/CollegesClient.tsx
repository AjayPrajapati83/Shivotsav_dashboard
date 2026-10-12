'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Edit2, Check, X, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { updateCollegeAction, addCollegeAction, deleteCollegeAction } from '../actions';
import type { College } from '@/lib/types';

export function CollegesClient({ colleges }: { colleges: College[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function startEdit(c: College) {
    setEditingId(c.id);
    setEditName(c.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
  }

  async function saveEdit(id: number) {
    startTransition(async () => {
      const res = await updateCollegeAction({ id, name: editName });
      if (res.error) showToast(res.error, 'error');
      else { showToast('College updated', 'success'); cancelEdit(); router.refresh(); }
    });
  }

  async function toggleActive(c: College) {
    startTransition(async () => {
      const res = await updateCollegeAction({ id: c.id, is_active: !c.is_active });
      if (res.error) showToast(res.error, 'error');
      else { showToast(`${c.name} ${c.is_active ? 'deactivated' : 'activated'}`, 'success'); router.refresh(); }
    });
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    startTransition(async () => {
      const res = await addCollegeAction(newName, null);
      if (res.error) showToast(res.error, 'error');
      else { showToast('College added', 'success'); setNewName(''); setShowAdd(false); router.refresh(); }
    });
  }

  async function handleDelete(id: number) {
    startTransition(async () => {
      const res = await deleteCollegeAction(id);
      if (res.error) showToast(res.error, 'error');
      else { showToast('College deleted', 'success'); setDeleteConfirm(null); router.refresh(); }
    });
  }

  const filtered = colleges.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 font-cinzel">Colleges</h1>
          <p className="text-sm text-slate-400">{colleges.length} houses registered</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors min-h-[44px]"
        >
          <Plus size={16} /> Add College
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="College name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-[16px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
            <button
              onClick={handleAdd}
              disabled={isPending}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors min-h-[44px] disabled:opacity-50"
            >
              {isPending ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="text-slate-400 hover:text-slate-600 px-3 py-2 min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          type="text"
          placeholder="Search colleges..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-[16px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-medium text-slate-500">#</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Name</th>
                <th className="text-center px-4 py-3 font-medium text-slate-500">Active</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className={`border-b border-slate-100 hover:bg-slate-50/50 ${!c.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 text-slate-400">{c.id}</td>
                  <td className="px-4 py-3">
                    {editingId === c.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border border-amber-300 rounded px-2 py-1 text-sm w-full max-w-[200px] focus:outline-none focus:ring-2 focus:ring-amber-200"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-slate-700">{c.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(c)}
                      className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
                      aria-label={c.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {c.is_active ? (
                        <ToggleRight size={22} className="text-emerald-500" />
                      ) : (
                        <ToggleLeft size={22} className="text-slate-300" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {deleteConfirm === c.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-red-600">Delete?</span>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={isPending}
                          className="p-2 text-white bg-red-500 hover:bg-red-600 rounded min-w-[36px] min-h-[36px] flex items-center justify-center"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="p-2 text-slate-400 hover:bg-slate-100 rounded min-w-[36px] min-h-[36px] flex items-center justify-center"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : editingId === c.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => saveEdit(c.id)}
                          disabled={isPending}
                          className="p-2 text-emerald-500 hover:bg-emerald-50 rounded min-w-[36px] min-h-[36px] flex items-center justify-center"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 text-slate-400 hover:bg-slate-100 rounded min-w-[36px] min-h-[36px] flex items-center justify-center"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(c)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(c.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
