// Scoring utilities — pure functions, safe for import anywhere
// -----------------------------------------------------------

import type { EventType, ScoreCode, ScoringRule } from './types';

/** The full scoring rules table (matches seed.sql exactly) */
export const SCORING_RULES: ScoringRule[] = [
  // Flagship
  { event_type: 'Flagship', code: 'PODIUM_1',      points: 1200 },
  { event_type: 'Flagship', code: 'PODIUM_2',      points:  800 },
  { event_type: 'Flagship', code: 'PODIUM_3',      points:  400 },
  { event_type: 'Flagship', code: 'PARTICIPATION', points:  200 },
  { event_type: 'Flagship', code: 'OTSE',          points:  100 },
  { event_type: 'Flagship', code: 'NPOOR',         points: -200 },
  { event_type: 'Flagship', code: 'NPOR',          points: -400 },
  { event_type: 'Flagship', code: 'NPOQ',          points: -800 },
  // Large
  { event_type: 'Large', code: 'PODIUM_1',      points:  600 },
  { event_type: 'Large', code: 'PODIUM_2',      points:  400 },
  { event_type: 'Large', code: 'PODIUM_3',      points:  200 },
  { event_type: 'Large', code: 'PARTICIPATION', points:  100 },
  { event_type: 'Large', code: 'OTSE',          points:   50 },
  { event_type: 'Large', code: 'NPOOR',         points: -100 },
  { event_type: 'Large', code: 'NPOR',          points: -200 },
  { event_type: 'Large', code: 'NPOQ',          points: -400 },
  // Small
  { event_type: 'Small', code: 'PODIUM_1',      points:  450 },
  { event_type: 'Small', code: 'PODIUM_2',      points:  300 },
  { event_type: 'Small', code: 'PODIUM_3',      points:  150 },
  { event_type: 'Small', code: 'PARTICIPATION', points:   75 },
  { event_type: 'Small', code: 'OTSE',          points:   30 },
  { event_type: 'Small', code: 'NPOOR',         points:  -75 },
  { event_type: 'Small', code: 'NPOR',          points: -150 },
  { event_type: 'Small', code: 'NPOQ',          points: -300 },
];

/** Look up points for a given event type + code */
export function getPoints(eventType: EventType, code: ScoreCode): number | null {
  const rule = SCORING_RULES.find(
    (r) => r.event_type === eventType && r.code === code
  );
  return rule?.points ?? null;
}

/** Human-readable labels for score codes */
export const CODE_LABELS: Record<ScoreCode, string> = {
  PARTICIPATION: 'Participation',
  OTSE: 'On-the-Spot Event',
  NPOOR: 'Non-Participation (Online Reg)',
  NPOR: 'Non-Participation (After Reg)',
  NPOQ: 'Non-Participation (On Qualification)',
  PODIUM_1: '1st Place 🥇',
  PODIUM_2: '2nd Place 🥈',
  PODIUM_3: '3rd Place 🥉',
  CUSTOM: 'Custom Adjustment',
};

/** Quick bonus constants */
export const QUICK_BONUSES = {
  FULL_SLOT: { points: 2000, note: 'Full Slot Participation' },
  PR_RALLY: { points: 500, note: 'PR Rally Participation' },
} as const;

/** Compute tie-aware ranks from an array of totals (descending) */
export function computeRanks(totals: number[]): (number | null)[] {
  if (totals.length === 0) return [];

  // If all totals are 0, return null for all
  if (totals.every((t) => t === 0)) {
    return totals.map(() => null);
  }

  // Sort indices by total descending
  const sorted = totals
    .map((total, idx) => ({ total, idx }))
    .sort((a, b) => b.total - a.total);

  const ranks: (number | null)[] = new Array(totals.length);
  let currentRank = 1;

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].total < sorted[i - 1].total) {
      currentRank = i + 1;
    }
    ranks[sorted[i].idx] = sorted[i].total === 0 ? null : currentRank;
  }

  return ranks;
}

/** All departments */
export const DEPARTMENTS = [
  'Performing Arts',
  'Fine Arts',
  'Literary Arts',
  'Informals',
  'Gaming & Sports',
] as const;

/** All event types */
export const EVENT_TYPES: EventType[] = ['Flagship', 'Large', 'Small'];
