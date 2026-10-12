'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, AlertTriangle } from 'lucide-react';
import { assignPointsAction } from '../actions';
import { getPoints } from '@/lib/scoring';
import type { College, Event, ScoreCode } from '@/lib/types';

type PenaltyCode = 'NPOOR' | 'NPOR' | 'NPOQ';

const PENALTY_OPTIONS: { code: PenaltyCode; label: string; description: string }[] = [
  { code: 'NPOOR', label: 'NPOOR', description: 'Non-participation after online registration' },
  { code: 'NPOR', label: 'NPOR', description: 'Non-participation after registration' },
  { code: 'NPOQ', label: 'NPOQ', description: 'Non-participation on qualification' },
];

export function DeductClient({
  colleges,
  events,
}: {
  colleges: College[];
  events: Event[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [selectedPenalty, setSelectedPenalty] = useState<PenaltyCode | null>(null);
  const [participantCount, setParticipantCount] = useState(1);
  const [eventSearch, setEventSearch] = useState('');
  const [collegeSearch, setCollegeSearch] = useState('');
  const [customDeduct, setCustomDeduct] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  const filteredEvents = useMemo(() => {
    if (!eventSearch.trim()) return events;
    const q = eventSearch.toLowerCase();
    return events.filter(
      (e) => e.name.toLowerCase().includes(q) || e.department.toLowerCase().includes(q)
    );
  }, [events, eventSearch]);

  const filteredColleges = useMemo(() => {
    if (!collegeSearch.trim()) return colleges;
    const q = collegeSearch.toLowerCase();
    return colleges.filter((c) => c.name.toLowerCase().includes(q));
  }, [colleges, collegeSearch]);

  const previewPoints = selectedEvent && selectedPenalty
    ? (getPoints(selectedEvent.type, selectedPenalty) ?? 0)
    : null;

  function confirmAndDeduct() {
    if (!selectedEvent || !selectedCollege || !selectedPenalty) return;

    setPendingAction(() => () => {
      startTransition(async () => {
        // Create multiple entries if participantCount > 1
        const promises = [];
        for (let i = 0; i < participantCount; i++) {
          promises.push(
            assignPointsAction({
              college_id: selectedCollege.id,
              event_id: selectedEvent.id,
              code: selectedPenalty,
              note: participantCount > 1 ? `Participant ${i + 1} of ${participantCount}` : undefined,
            })
          );
        }

        const results = await Promise.all(promises);
        const errors = results.filter(r => r.error);
        
        if (errors.length > 0) {
          showToast(errors[0].error!, 'error');
        } else {
          const totalPoints = (previewPoints ?? 0) * participantCount;
          showToast(
            `${totalPoints} deducted from ${selectedCollege.name} for ${selectedEvent.name} (${participantCount} participant${participantCount > 1 ? 's' : ''})`, 
            'success'
          );
          setSelectedCollege(null);
          setSelectedPenalty(null);
          setParticipantCount(1);
          router.refresh();
        }
        setShowConfirm(false);
      });
    });
    setShowConfirm(true);
  }

  function confirmAndDeductCustom() {
    if (!selectedCollege) { showToast('Select a college first', 'error'); return; }
    const pts = parseInt(customDeduct);
    if (isNaN(pts) || pts >= 0) { showToast('Enter a negative value', 'error'); return; }
    if (!customNote.trim()) { showToast('Note is required', 'error'); return; }

    setPendingAction(() => () => {
      startTransition(async () => {
        const res = await assignPointsAction({
          college_id: selectedCollege.id,
          event_id: null,
          code: 'CUSTOM' as ScoreCode,
          points: pts,
          note: customNote.trim(),
        });
        if (res.error) showToast(res.error, 'error');
        else {
          showToast(`${pts} custom deduction from ${selectedCollege.name}`, 'success');
          setCustomDeduct('');
          setCustomNote('');
          router.refresh();
        }
        setShowConfirm(false);
      });
    });
    setShowConfirm(true);
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

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <h3 className="font-medium text-slate-800">Confirm Deduction</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              This will deduct <span className="font-bold text-red-600">
                {previewPoints ? `${previewPoints * (participantCount || 1)} (${previewPoints} × ${participantCount})` : customDeduct}
              </span> points
              from <span className="font-bold">{selectedCollege?.name}</span>.
              This action can be voided from History.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={() => pendingAction?.()}
                disabled={isPending}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2.5 text-sm font-medium transition-colors min-h-[44px] disabled:opacity-50"
              >
                {isPending ? 'Deducting...' : 'Confirm Deduction'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 font-cinzel">Deduct Points</h1>
        <p className="text-sm text-slate-400">Apply penalties for non-participation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Event + College + Penalty */}
        <div className="space-y-4">
          {/* Event */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-medium text-slate-700 text-sm mb-3 flex items-center gap-2">
              <span className="bg-red-100 text-red-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">1</span>
              Pick Event
            </h3>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                placeholder="Search events..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-[16px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredEvents.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelectedEvent(e)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors min-h-[44px] ${
                    selectedEvent?.id === e.id
                      ? 'bg-red-50 border border-red-200 text-red-700'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="font-medium">{e.name}</span>
                  <span className="ml-2 text-xs text-slate-400">{e.type} · {e.department}</span>
                </button>
              ))}
            </div>
          </div>

          {/* College */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-medium text-slate-700 text-sm mb-3 flex items-center gap-2">
              <span className="bg-red-100 text-red-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">2</span>
              Pick College
            </h3>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                placeholder="Search colleges..."
                value={collegeSearch}
                onChange={(e) => setCollegeSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-[16px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredColleges.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCollege(c)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors min-h-[44px] ${
                    selectedCollege?.id === c.id
                      ? 'bg-red-50 border border-red-200 text-red-700'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Penalty */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-medium text-slate-700 text-sm mb-3 flex items-center gap-2">
              <span className="bg-red-100 text-red-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">3</span>
              Penalty Type
            </h3>
            <div className="space-y-2">
              {PENALTY_OPTIONS.map((opt) => {
                const pts = selectedEvent ? getPoints(selectedEvent.type, opt.code) : null;
                return (
                  <button
                    key={opt.code}
                    onClick={() => setSelectedPenalty(opt.code)}
                    className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors min-h-[48px] ${
                      selectedPenalty === opt.code
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-slate-50 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-slate-700">{opt.label}</span>
                        <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
                      </div>
                      {pts !== null && (
                        <span className="text-red-500 font-mono text-sm font-bold">{pts}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Participant Counter */}
            {selectedPenalty && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="text-xs text-slate-600 font-medium mb-2 block">
                  Number of Participants
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setParticipantCount(Math.max(1, participantCount - 1))}
                    className="w-10 h-10 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-bold transition-colors flex items-center justify-center"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={participantCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setParticipantCount(Math.max(1, Math.min(20, val)));
                    }}
                    className="w-16 h-10 text-center border border-slate-300 rounded-lg text-slate-700 font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                  <button
                    onClick={() => setParticipantCount(Math.min(20, participantCount + 1))}
                    className="w-10 h-10 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-bold transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                  <span className="text-xs text-slate-500 ml-2">
                    (1-20)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Creates {participantCount} separate {participantCount === 1 ? 'entry' : 'entries'} for tracking
                </p>
              </div>
            )}

            {previewPoints !== null && selectedCollege && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  <span className="font-bold text-lg">{(previewPoints ?? 0) * participantCount}</span> points from{' '}
                  <span className="font-semibold">{selectedCollege.name}</span>
                  {participantCount > 1 && (
                    <span className="text-xs block mt-1">
                      ({previewPoints} × {participantCount} participants)
                    </span>
                  )}
                </p>
              </div>
            )}

            <button
              onClick={confirmAndDeduct}
              disabled={isPending || !selectedEvent || !selectedCollege || !selectedPenalty}
              className="mt-3 w-full bg-red-500 hover:bg-red-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg px-4 py-3 text-sm font-semibold transition-colors min-h-[48px]"
            >
              Deduct Points
            </button>
          </div>
        </div>

        {/* Right: Custom deduction */}
        <div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-medium text-slate-700 text-sm mb-3">Custom Deduction</h3>
            <p className="text-xs text-slate-400 mb-3">
              {selectedCollege ? `For ${selectedCollege.name}` : 'Select a college first'}
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Points (negative number)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={customDeduct}
                  onChange={(e) => setCustomDeduct(e.target.value)}
                  placeholder="e.g. -500"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[16px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-200"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Note (required)</label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Reason for deduction..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[16px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-200"
                />
              </div>
              <button
                onClick={confirmAndDeductCustom}
                disabled={isPending || !selectedCollege || !customDeduct || !customNote.trim()}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px]"
              >
                Apply Deduction
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
