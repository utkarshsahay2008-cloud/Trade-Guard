import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseStore } from '@/lib/database';
import { simulateWhatIfScenario } from '@/lib/whatIfEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const store = getDatabaseStore();

    const {
      marketShiftPct = 0,
      volatilityMultiplier = 1.0,
      slippagePct = 0.1,
    } = body;

    const simulation = simulateWhatIfScenario({
      marketShiftPct: Number(marketShiftPct),
      volatilityMultiplier: Number(volatilityMultiplier),
      slippagePct: Number(slippagePct),
      positions: store.positions,
      portfolio: store.portfolio,
    });

    return NextResponse.json({
      success: true,
      simulation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to execute what-if simulation' },
      { status: 500 }
    );
  }
}
