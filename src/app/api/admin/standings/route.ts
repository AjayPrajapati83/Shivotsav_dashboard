import { NextResponse } from 'next/server';
import { getStandings, getDepartmentTrophies } from '@/server/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [standings, trophies] = await Promise.all([
      getStandings(),
      getDepartmentTrophies(),
    ]);
    return NextResponse.json({ standings, trophies });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg === 'UNAUTHORIZED' || msg === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch standings' }, { status: 500 });
  }
}
