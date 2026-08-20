import { NextResponse } from 'next/server';
import { getPostgresHealth } from '@/lib/pgDatabase';
import { getDatabaseStore } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const health = await getPostgresHealth();
    const store = getDatabaseStore();

    return NextResponse.json({
      success: true,
      health,
      activeUser: store.user.email,
      portfolioBalance: store.portfolio.totalBalance,
      positionsCount: store.positions.length,
      tradesCount: store.trades.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Database connection check failed' },
      { status: 500 }
    );
  }
}
