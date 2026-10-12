'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Zap, Award, Gift } from 'lucide-react';
import { assignPointsAction, checkPodiumAction } from '../actions';
import { getPoints, QUICK_BONUSES, CODE_LABELS } from '@/lib/scoring';
import type { College, Event, ScoreCode, EventType } from '@/lib/types';

type ResultCode = 'PARTICIPATION' | 'OTSE' | 'PODIUM_1' | 'PODIUM_2' | 'PODIUM_3';

const RESULT_OPTIONS: { code: ResultCode; label: string }[] = [
  { code: 'PARTICIPATION', label: '✋ Participation' },
  { code: 'OTSE', label: '⚡ OTSE' },
  { code: 'PODIUM_1', label: '🥇 1st Place' },
  { code: 'PODIUM_2', label: '🥈 2nd Place' },
  { code: 'PODIUM_3', label: '🥉 3rd Place' },
];

export function AssignClient({
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
  const [selectedResult, setSelectedResult] = useState<ResultCode | null>(null);
  const [participantCount, setParticipantCount] = useState(1);
  const [eventSearch, setEventSearch] = useState('');
  const [collegeSearch, setCollegeSearch] = useState('');
  const [customPoints, setCustomPoints] = useState('');
  const [customNote, setCustomNote] = useState('');
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

  const previewPoints = selectedEvent && selectedResult
    ? (getPoints(selectedEvent.type, selectedResult) ?? 0) * ((['PARTICIPATION', 'OTSE'].includes(selectedResult)) ? participantCount : 1)
    : null;

  async function handleAssign() {
    if (!selectedEvent || !selectedCollege || !selectedResult) return;

    // Check podium
    if (['PODIUM_1', 'PODIUM_2', 'PODIUM_3'].includes(selectedResult)) {
      const check = await checkPodiumAction(selectedEvent.id, selectedResult);
      if (check.taken) {
        showToast(`Podium position already taken by ${check.currentHolder}. Void the existing entry first.`, 'error');
        return;
      }
    }

    // For PARTICIPATION and OTSE, assign multiple entries if count > 1
    if (['PARTICIPATION', 'OTSE'].includes(selectedResult) && participantCount > 1) {
      startTransition(async () => {
        let successCount = 0;
        for (let i = 0; i < participantCount; i++) {
          const res = await assignPointsAction({
            college_id: selectedCollege.id,
            event_id: selectedEvent.id,
            code: selectedResult,
            note: `Participant ${i + 1} of ${participantCount}`,
          });
          if (!res.error) successCount++;
        }
        if (successCount === participantCount) {
          showToast(`+${previewPoints} assigned to ${selectedCollege.name} for ${selectedEvent.name} (${participantCount} participants)`, 'success');
          setSelectedCollege(null);
          setSelectedResult(null);
          setParticipantCount(1);
          router.refresh();
        } else {
          showToast(`Partial success: ${successCount}/${participantCount} entries created`, 'error');
          router.refresh();
        }
      });
    } else {
      startTransition(async () => {
        const res = await assignPointsAction({
          college_id: selectedCollege.id,
          event_id: selectedEvent.id,
          code: selectedResult,
        });
        if (res.error) {
          showToast(res.error, 'error');
        } else {
          showToast(`+${previewPoints} assigned to ${selectedCollege.name} for ${selectedEvent.name}`, 'success');
          setSelectedCollege(null);
          setSelectedResult(null);
          setParticipantCount(1);
          router.refresh();
        }
      });
    }
  }

  async function handleQuickBonus(type: 'FULL_SLOT' | 'PR_RALLY') {
    if (!selectedCollege) {
      showToast('Select a college first', 'error');
      return;
    }
    const bonus = QUICK_BONUSES[type];
    startTransition(async () => {
      const res = await assignPointsAction({
        college_id: selectedCollege.id,
        event_id: null,
        code: 'CUSTOM' as ScoreCode,
        points: bonus.points,
        note: bonus.note,
      });
      if (res.error) showToast(res.error, 'error');
      else {
        showToast(`+${bonus.points} bonus (${bonus.note}) assigned to ${selectedCollege.name}`, 'success');
        router.refresh();
      }
    });
  }

  async function handleCustom() {
    if (!selectedCollege) { showToast('Select a college first', 'error'); return; }
    const pts = parseInt(customPoints);
    if (isNaN(pts) || pts === 0) { showToast('Enter a valid non-zero point value', 'error'); return; }
    if (!customNote.trim()) { showToast('Note is required for custom adjustments', 'error'); return; }

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
        showToast(`${pts > 0 ? '+' : ''}${pts} custom adjustment to ${selectedCollege.name}`, 'success');
        setCustomPoints('');
        setCustomNote('');
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

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 font-cinzel">Assign Points</h1>
        <p className="text-sm text-slate-400">Fast entry form for live event scoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Event & Result selection */}
        <div className="space-y-4">
          {/* Step 1: Pick Event */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-medium text-slate-700 text-sm mb-3 flex items-center gap-2">
              <span className="bg-amber-100 text-amber-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">1</span>
              Pick Event
            </h3>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                placeholder="Search events..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-[16px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredEvents.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelectedEvent(e)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors min-h-[44px] ${
                    selectedEvent?.id === e.id
                      ? 'bg-amber-50 border border-amber-200 text-amber-700'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="font-medium">{e.name}</span>
                  <span className="ml-2 text-xs text-slate-400">
                    {e.type} · {e.department}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Pick College */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-medium text-slate-700 text-sm mb-3 flex items-center gap-2">
              <span className="bg-amber-100 text-amber-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">2</span>
              Pick College
            </h3>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                placeholder="Search colleges..."
                value={collegeSearch}
                onChange={(e) => setCollegeSearch(e.target.value)}
                className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-[16px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredColleges.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCollege(c)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors min-h-[44px] ${
                    selectedCollege?.id === c.id
                      ? 'bg-amber-50 border border-amber-200 text-amber-700'
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="font-medium">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Pick Result */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-medium text-slate-700 text-sm mb-3 flex items-center gap-2">
              <span className="bg-amber-100 text-amber-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">3</span>
              Result
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RESULT_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => {
                    setSelectedResult(opt.code);
                    if (!['PARTICIPATION', 'OTSE'].includes(opt.code)) {
                      setParticipantCount(1);
                    }
                  }}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                    selectedResult === opt.code
                      ? 'bg-amber-50 border border-amber-200 text-amber-700'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Participant Counter for PARTICIPATION and OTSE */}
            {selectedResult && ['PARTICIPATION', 'OTSE'].includes(selectedResult) && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="text-xs text-blue-700 font-medium mb-2 block">
                  Number of Participants
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setParticipantCount(Math.max(1, participantCount - 1))}
                    className="w-10 h-10 bg-white border border-blue-300 rounded-lg text-blue-700 font-bold hover:bg-blue-100 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={participantCount}
                    onChange={(e) => setParticipantCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                    className="flex-1 text-center border border-blue-300 rounded-lg px-3 py-2 text-lg font-semibold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => setParticipantCount(Math.min(20, participantCount + 1))}
                    className="w-10 h-10 bg-white border border-blue-300 rounded-lg text-blue-700 font-bold hover:bg-blue-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  {participantCount} participant{participantCount !== 1 ? 's' : ''} × {(getPoints(selectedEvent?.type || 'Large', selectedResult) ?? 0)} points = {participantCount * (getPoints(selectedEvent?.type || 'Large', selectedResult) ?? 0)} total points
                </p>
              </div>
            )}

            {/* Preview */}
            {previewPoints !== null && selectedCollege && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-700">
                  <span className="font-bold text-lg">+{previewPoints}</span> points to{' '}
                  <span className="font-semibold">{selectedCollege.name}</span> for{' '}
                  <span className="font-semibold">{selectedEvent?.name}</span>
                  {(['PARTICIPATION', 'OTSE'].includes(selectedResult!)) && participantCount > 1 && (
                    <span className="block text-xs mt-1">({participantCount} participants)</span>
                  )}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleAssign}
              disabled={isPending || !selectedEvent || !selectedCollege || !selectedResult}
              className="mt-3 w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg px-4 py-3 text-sm font-semibold transition-colors min-h-[48px]"
            >
              {isPending ? 'Assigning...' : 'Assign Points'}
            </button>
          </div>
        </div>

        {/* Right: Quick bonuses + Custom */}
        <div className="space-y-4">
          {/* Quick Bonuses */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-medium text-slate-700 text-sm mb-3 flex items-center gap-2">
              <Gift size={16} className="text-amber-500" />
              Quick Bonuses
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              {selectedCollege ? `For ${selectedCollege.name}` : 'Select a college first'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickBonus('FULL_SLOT')}
                disabled={isPending || !selectedCollege}
                className="flex items-center gap-3 bg-emerald-50 hover:bg-emerald-100 disabled:bg-slate-50 border border-emerald-200 disabled:border-slate-200 rounded-lg p-3 text-left transition-colors min-h-[56px] disabled:opacity-50"
              >
                <Zap size={18} className="text-emerald-500 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-emerald-700">Full Slot</div>
                  <div className="text-xs text-emerald-500">+2000 pts</div>
                </div>
              </button>
              <button
                onClick={() => handleQuickBonus('PR_RALLY')}
                disabled={isPending || !selectedCollege}
                className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 disabled:bg-slate-50 border border-blue-200 disabled:border-slate-200 rounded-lg p-3 text-left transition-colors min-h-[56px] disabled:opacity-50"
              >
                <Award size={18} className="text-blue-500 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-blue-700">PR Rally</div>
                  <div className="text-xs text-blue-500">+500 pts</div>
                </div>
              </button>
            </div>
          </div>

          {/* Custom adjustment */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-medium text-slate-700 text-sm mb-3">Custom Adjustment</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Points (+/-)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={customPoints}
                  onChange={(e) => setCustomPoints(e.target.value)}
                  placeholder="e.g. 500 or -100"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[16px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Note (required)</label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Reason for adjustment..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[16px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
              <button
                onClick={handleCustom}
                disabled={isPending || !selectedCollege || !customPoints || !customNote.trim()}
                className="w-full bg-slate-700 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px]"
              >
                Apply Custom
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
