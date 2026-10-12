'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import * as adminDb from '@/server/admin';
import type { ScoreCode } from '@/lib/types';

// ── Assign Points ─────────────────────────────────────────

const assignSchema = z.object({
  college_id: z.number().int().positive(),
  event_id: z.number().int().positive().nullable(),
  code: z.enum([
    'PARTICIPATION', 'OTSE', 'NPOOR', 'NPOR', 'NPOQ',
    'PODIUM_1', 'PODIUM_2', 'PODIUM_3', 'CUSTOM',
  ]),
  points: z.number().int().optional(),
  note: z.string().optional(),
});

export async function assignPointsAction(formData: {
  college_id: number;
  event_id: number | null;
  code: ScoreCode;
  points?: number;
  note?: string;
}) {
  const parsed = assignSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: 'Invalid input: ' + parsed.error.issues.map(i => i.message).join(', ') };
  }

  try {
    const entry = await adminDb.assignPoints(parsed.data);
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, entry };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg === 'PODIUM_TAKEN') {
      return { error: 'That podium position is already taken for this event. Void the existing entry first or use reassign.' };
    }
    return { error: msg };
  }
}

// ── Bulk Assign ───────────────────────────────────────────

export async function bulkAssignAction(entries: Array<{
  college_id: number;
  event_id: number;
  code: ScoreCode;
  note?: string;
}>) {
  const results: Array<{ college_id: number; success: boolean; error?: string }> = [];

  for (const entry of entries) {
    try {
      await adminDb.assignPoints(entry);
      results.push({ college_id: entry.college_id, success: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      results.push({ college_id: entry.college_id, success: false, error: msg });
    }
  }

  revalidatePath('/admin');
  revalidatePath('/');
  return results;
}

// ── Void / Unvoid ─────────────────────────────────────────

export async function voidEntryAction(entryId: number, reason: string) {
  if (!reason.trim()) {
    return { error: 'Reason is required for voiding' };
  }
  try {
    await adminDb.voidEntry(entryId, reason);
    revalidatePath('/admin');
    revalidatePath('/admin/history');
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function unvoidEntryAction(entryId: number) {
  try {
    await adminDb.unvoidEntry(entryId);
    revalidatePath('/admin');
    revalidatePath('/admin/history');
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteEntryAction(entryId: number) {
  try {
    await adminDb.deleteEntry(entryId);
    revalidatePath('/admin');
    revalidatePath('/admin/history');
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

// ── Check Podium ──────────────────────────────────────────

export async function checkPodiumAction(eventId: number, code: ScoreCode) {
  try {
    return await adminDb.checkPodiumTaken(eventId, code);
  } catch (e) {
    return { taken: false };
  }
}

// ── Colleges ──────────────────────────────────────────────

const updateCollegeSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100).optional(),
  deity_mythology: z.enum(['Hindu', 'Norse', 'Egyptian', 'Greek']).nullable().optional(),
  is_active: z.boolean().optional(),
  crest_url: z.string().nullable().optional(),
});

export async function updateCollegeAction(data: z.infer<typeof updateCollegeSchema>) {
  const parsed = updateCollegeSchema.safeParse(data);
  if (!parsed.success) {
    return { error: 'Invalid input' };
  }

  try {
    const { id, ...updates } = parsed.data;
    await adminDb.updateCollege(id, updates);
    revalidatePath('/admin/colleges');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function addCollegeAction(name: string, mythology: string | null) {
  if (!name.trim()) return { error: 'Name is required' };
  try {
    const college = await adminDb.addCollege(name, mythology);
    revalidatePath('/admin/colleges');
    return { success: true, college };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function canDeleteCollegeAction(id: number) {
  try {
    return { canDelete: await adminDb.canDeleteCollege(id) };
  } catch {
    return { canDelete: false };
  }
}

export async function deleteCollegeAction(id: number) {
  try {
    await adminDb.deleteCollege(id);
    revalidatePath('/admin/colleges');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
