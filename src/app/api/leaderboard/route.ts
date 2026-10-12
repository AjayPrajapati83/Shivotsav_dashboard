import { NextResponse } from 'next/server';
import { getPublicLeaderboard } from '@/server/leaderboard';

export const revalidate = 10; // Cache for 10 seconds

export async function GET() {
  try {
    const leaderboard = await getPublicLeaderboard();
    return NextResponse.json({ data: leaderboard, timestamp: Date.now() });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
