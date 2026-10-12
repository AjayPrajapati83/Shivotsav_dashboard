import 'server-only';

import { db } from './db';
import type { LeaderboardEntry, Event } from '@/lib/types';

/**
 * Get the public leaderboard — rank only, NO points.
 * Points are stripped on the server before the response is built.
 */
export async function getPublicLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = db();

  const { data, error } = await supabase
    .from('college_totals')
    .select('college_id, name, deity_mythology, crest_url, total, rank')
    .eq('is_active', true)
    .order('rank', { ascending: true });

  if (error) {
    console.error('Leaderboard fetch error:', error);
    throw new Error('Failed to fetch leaderboard');
  }

  // Check if all totals are 0 → return null ranks
  const allZero = data.every((row: { total: number }) => row.total === 0);

  // Strip points — NEVER return total to the client
  return (data || []).map((row: { college_id: number; name: string; deity_mythology: string | null; crest_url: string | null; rank: number }) => ({
    college_id: row.college_id,
    name: row.name,
    deity_mythology: row.deity_mythology as LeaderboardEntry['deity_mythology'],
    crest_url: row.crest_url,
    rank: allZero ? null : row.rank,
  }));
}

/**
 * Get all events for the public event cards
 */
export async function getPublicEvents(): Promise<Event[]> {
  const supabase = db();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Events fetch error:', error);
    throw new Error('Failed to fetch events');
  }

  return data || [];
}
