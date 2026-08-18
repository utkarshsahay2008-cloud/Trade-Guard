import { NextResponse } from 'next/server';
import { saveDatabaseStore } from '@/lib/database';
import { getInitialSeedData } from '@/lib/seed';

export async function POST() {
  try {
    const freshSeed = getInitialSeedData();
    saveDatabaseStore(freshSeed);

    return NextResponse.json({
      success: true,
      message: 'Database reset and re-seeded successfully',
      portfolio: freshSeed.portfolio,
      tradesCount: freshSeed.trades.length,
      positionsCount: freshSeed.positions.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed database' },
      { status: 500 }
    );
  }
}
