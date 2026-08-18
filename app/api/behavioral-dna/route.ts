import { NextResponse } from 'next/server';
import { getDatabaseStore } from '@/lib/database';
import { analyzeBehavioralData } from '@/lib/behavioralEngine';

export async function GET() {
  try {
    const store = getDatabaseStore();
    const behavioral = analyzeBehavioralData(store.trades);

    return NextResponse.json({
      success: true,
      behavioralSignals: store.behavioralSignals,
      behavioralAnalysis: behavioral,
      tradeCount: store.trades.length,
      winRate: calculateWinRate(store.trades),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch behavioral DNA' },
      { status: 500 }
    );
  }
}

function calculateWinRate(trades: any[]): number {
  const closed = trades.filter(t => t.status === 'CLOSED');
  if (closed.length === 0) return 0;
  const wins = closed.filter(t => t.pnl > 0).length;
  return Number(((wins / closed.length) * 100).toFixed(1));
}
