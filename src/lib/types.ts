// Types shared across the application
// -----------------------------------------------------------

export type Role = 'cl' | 'admin';

export type Mythology = 'Hindu' | 'Norse' | 'Egyptian' | 'Greek';

export type EventType = 'Flagship' | 'Large' | 'Small';

export type Department =
  | 'Performing Arts'
  | 'Fine Arts'
  | 'Literary Arts'
  | 'Informals'
  | 'Gaming & Sports';

export type ScoreCode =
  | 'PARTICIPATION'
  | 'OTSE'
  | 'NPOOR'
  | 'NPOR'
  | 'NPOQ'
  | 'PODIUM_1'
  | 'PODIUM_2'
  | 'PODIUM_3'
  | 'CUSTOM';

export interface College {
  id: number;
  name: string;
  deity_mythology: Mythology | null;
  crest_url: string | null;
  sort_order: number | null;
  is_active: boolean;
}

export interface Event {
  id: number;
  name: string;
  department: Department;
  type: EventType;
  entry_fee: number | null;
  sort_order: number | null;
}

export interface ScoringRule {
  event_type: EventType;
  code: ScoreCode;
  points: number;
}

export interface ScoreEntry {
  id: number;
  college_id: number;
  event_id: number | null;
  code: ScoreCode;
  points: number;
  note: string | null;
  created_by: string;
  created_at: string;
  voided_at: string | null;
  voided_by: string | null;
  void_reason: string | null;
}

// View types
export interface CollegeTotal {
  college_id: number;
  name: string;
  deity_mythology: Mythology | null;
  crest_url: string | null;
  is_active: boolean;
  total: number;
  rank: number | null;
}

export interface DepartmentTotal {
  college_id: number;
  college_name: string;
  department: Department;
  dept_total: number;
}

// Public-facing leaderboard entry (NO points)
export interface LeaderboardEntry {
  college_id: number;
  name: string;
  deity_mythology: Mythology | null;
  crest_url: string | null;
  rank: number | null;
}

// Admin standings row
export interface StandingsRow {
  college_id: number;
  name: string;
  deity_mythology: Mythology | null;
  crest_url: string | null;
  event_points: number;
  custom_points: number;
  total: number;
  rank: number | null;
}

// History row
export interface HistoryRow extends ScoreEntry {
  college_name: string;
  event_name: string | null;
  event_department: Department | null;
}

// Department Trophy
export interface DepartmentTrophy {
  department: Department;
  winners: { college_name: string; total: number }[];
  is_tie: boolean;
}

// Session payload
export interface SessionPayload {
  role: Role;
  iat: number;
  exp: number;
}
