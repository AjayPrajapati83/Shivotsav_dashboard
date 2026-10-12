import 'server-only';

import { db } from './db';
import { requireRole } from './session';
import type {
  College,
  Event,
  CollegeTotal,
  DepartmentTotal,
  ScoreEntry,
  HistoryRow,
  ScoreCode,
  StandingsRow,
  DepartmentTrophy,
  Department,
} from '@/lib/types';
import { DEPARTMENTS } from '@/lib/scoring';

// ── Colleges ──────────────────────────────────────────────

export async function getColleges(): Promise<College[]> {
  // Auth already checked by middleware, no need to re-verify
  const { data, error } = await db()
    .from('colleges')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateCollege(
  id: number,
  updates: Partial<Pick<College, 'name' | 'deity_mythology' | 'crest_url' | 'is_active'>>
): Promise<void> {
  // Auth already checked by middleware
  const { error } = await db().from('colleges').update(updates).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function addCollege(
  name: string,
  deity_mythology: string | null
): Promise<College> {
  // Auth already checked by middleware
  const { data, error } = await db()
    .from('colleges')
    .insert({ name, deity_mythology })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function canDeleteCollege(id: number): Promise<boolean> {
  // Auth already checked by middleware
  const { count, error } = await db()
    .from('score_entries')
    .select('id', { count: 'exact', head: true })
    .eq('college_id', id);
  if (error) throw new Error(error.message);
  return (count ?? 0) === 0;
}

export async function deleteCollege(id: number): Promise<void> {
  // Auth already checked by middleware
  
  // Check if college has any score entries
  const canDelete = await canDeleteCollege(id);
  if (!canDelete) {
    throw new Error('Cannot delete college with existing score entries');
  }
  
  const { error } = await db()
    .from('colleges')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Events ────────────────────────────────────────────────

export async function getEvents(): Promise<Event[]> {
  // Auth already checked by middleware
  const { data, error } = await db()
    .from('events')
    .select('*')
    .order('sort_order', { ascending: true});
  if (error) throw new Error(error.message);
  return data || [];
}

// ── Standings ─────────────────────────────────────────────

export async function getStandings(): Promise<StandingsRow[]> {
  // Auth already checked by middleware
  const supabase = db();

  // Get totals from view
  const { data: totals, error: totalsErr } = await supabase
    .from('college_totals')
    .select('*')
    .order('rank', { ascending: true });
  if (totalsErr) throw new Error(totalsErr.message);

  // Get custom sums per college
  const { data: customSums, error: customErr } = await supabase
    .from('score_entries')
    .select('college_id, points')
    .eq('code', 'CUSTOM')
    .is('voided_at', null);
  if (customErr) throw new Error(customErr.message);

  const customMap = new Map<number, number>();
  for (const row of customSums || []) {
    const current = customMap.get(row.college_id) || 0;
    customMap.set(row.college_id, current + row.points);
  }

  const allZero = (totals || []).every((r: CollegeTotal) => r.total === 0);

  return (totals || []).map((row: CollegeTotal) => {
    const customPts = customMap.get(row.college_id) || 0;
    return {
      college_id: row.college_id,
      name: row.name,
      deity_mythology: row.deity_mythology,
      crest_url: row.crest_url,
      event_points: row.total - customPts,
      custom_points: customPts,
      total: row.total,
      rank: allZero ? null : row.rank,
    };
  });
}

// ── Department Trophy ─────────────────────────────────────

export async function getDepartmentTrophies(): Promise<DepartmentTrophy[]> {
  // Auth already checked by middleware
  const { data, error } = await db()
    .from('department_totals')
    .select('*');
  if (error) throw new Error(error.message);

  const trophies: DepartmentTrophy[] = DEPARTMENTS.map((dept) => {
    const deptRows = (data || []).filter(
      (r: DepartmentTotal) => r.department === dept
    );

    if (deptRows.length === 0 || deptRows.every((r: DepartmentTotal) => r.dept_total <= 0)) {
      return { department: dept as Department, winners: [], is_tie: false };
    }

    const maxTotal = Math.max(...deptRows.map((r: DepartmentTotal) => r.dept_total));
    if (maxTotal <= 0) {
      return { department: dept as Department, winners: [], is_tie: false };
    }

    const winners = deptRows
      .filter((r: DepartmentTotal) => r.dept_total === maxTotal)
      .map((r: DepartmentTotal) => ({ college_name: r.college_name, total: r.dept_total }));

    return {
      department: dept as Department,
      winners,
      is_tie: winners.length > 1,
    };
  });

  return trophies;
}

// ── Score Entries ─────────────────────────────────────────

export async function assignPoints(entry: {
  college_id: number;
  event_id: number | null;
  code: ScoreCode;
  points?: number;
  note?: string;
}): Promise<ScoreEntry> {
  // Auth already checked by middleware
  
  const insertData: Record<string, unknown> = {
    college_id: entry.college_id,
    event_id: entry.event_id,
    code: entry.code,
    created_by: 'admin',
  };

  if (entry.code === 'CUSTOM') {
    insertData.points = entry.points;
    insertData.note = entry.note;
  }

  // For non-CUSTOM, points are filled by the trigger
  if (entry.note) {
    insertData.note = entry.note;
  }

  const { data, error } = await db()
    .from('score_entries')
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    // Handle unique constraint violation for podium
    if (error.code === '23505') {
      throw new Error('PODIUM_TAKEN');
    }
    throw new Error(error.message);
  }

  return data;
}

export async function voidEntry(
  entryId: number,
  reason: string
): Promise<void> {
  // Auth already checked by middleware
  const { error } = await db()
    .from('score_entries')
    .update({
      voided_at: new Date().toISOString(),
      voided_by: 'admin',
      void_reason: reason,
    })
    .eq('id', entryId)
    .is('voided_at', null);
  if (error) throw new Error(error.message);
}

export async function unvoidEntry(entryId: number): Promise<void> {
  // Auth already checked by middleware
  const { error } = await db()
    .from('score_entries')
    .update({
      voided_at: null,
      voided_by: null,
      void_reason: null,
    })
    .eq('id', entryId);
  if (error) throw new Error(error.message);
}

export async function deleteEntry(entryId: number): Promise<void> {
  // Auth already checked by middleware
  const { error } = await db()
    .from('score_entries')
    .delete()
    .eq('id', entryId);
  if (error) throw new Error(error.message);
}

export async function checkPodiumTaken(
  eventId: number,
  code: ScoreCode
): Promise<{ taken: boolean; currentHolder?: string }> {
  // Auth already checked by middleware
  if (!['PODIUM_1', 'PODIUM_2', 'PODIUM_3'].includes(code)) {
    return { taken: false };
  }

  const { data, error } = await db()
    .from('score_entries')
    .select('id, college_id')
    .eq('event_id', eventId)
    .eq('code', code)
    .is('voided_at', null)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (data) {
    const { data: college } = await db()
      .from('colleges')
      .select('name')
      .eq('id', data.college_id)
      .single();

    return { taken: true, currentHolder: college?.name || 'Unknown' };
  }

  return { taken: false };
}

// ── History ───────────────────────────────────────────────

export async function getHistory(filters?: {
  college_id?: number;
  event_id?: number;
  code?: ScoreCode;
  department?: string;
  voided?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ rows: HistoryRow[]; total: number }> {
  // Auth already checked by middleware
  
  let query = db()
    .from('score_entries')
    .select(`
      *,
      colleges!inner(name),
      events(name, department)
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters?.college_id) {
    query = query.eq('college_id', filters.college_id);
  }
  if (filters?.event_id) {
    query = query.eq('event_id', filters.event_id);
  }
  if (filters?.code) {
    query = query.eq('code', filters.code);
  }
  if (filters?.voided === true) {
    query = query.not('voided_at', 'is', null);
  } else if (filters?.voided === false) {
    query = query.is('voided_at', null);
  }

  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const rows: HistoryRow[] = (data || []).map((row: Record<string, unknown>) => {
    const colleges = row.colleges as { name: string } | null;
    const events = row.events as { name: string; department: string } | null;
    return {
      id: row.id as number,
      college_id: row.college_id as number,
      event_id: row.event_id as number | null,
      code: row.code as ScoreCode,
      points: row.points as number,
      note: row.note as string | null,
      created_by: row.created_by as string,
      created_at: row.created_at as string,
      voided_at: row.voided_at as string | null,
      voided_by: row.voided_by as string | null,
      void_reason: row.void_reason as string | null,
      college_name: colleges?.name || 'Unknown',
      event_name: events?.name || null,
      event_department: (events?.department as Department) || null,
    };
  });

  return { rows, total: count || 0 };
}

// ── Scoring Rules ─────────────────────────────────────────

export async function getScoringRules() {
  // Auth already checked by middleware
  const { data, error } = await db()
    .from('scoring_rules')
    .select('*')
    .order('event_type')
    .order('code');
  if (error) throw new Error(error.message);
  return data || [];
}
