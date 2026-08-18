import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseStore } from '@/lib/database';
import { calculateTradeRisk } from '@/lib/riskEngine';
import { analyzeBehavioralData } from '@/lib/behavioralEngine';
import { calculateSaferPosition } from '@/lib/lossShieldEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const store = getDatabaseStore();

    const {
      symbol = 'RELIANCE',
      direction = 'LONG',
      entryPrice = 2900,
      stopLoss = 2800,
      takeProfit = 3100,
      quantity = 50,
      leverage = 1,
      targetRiskPct = 2.0,
    } = body;

    // Behavioral analysis using stored trade history
    const behavioral = analyzeBehavioralData(store.trades, Number(quantity));

    // Risk Engine calculations
    const risk = calculateTradeRisk({
      symbol,
      direction,
      entryPrice: Number(entryPrice),
      stopLoss: Number(stopLoss),
      takeProfit: Number(takeProfit),
      quantity: Number(quantity),
      leverage: Number(leverage),
      portfolioBalance: store.portfolio.totalBalance,
      historicalAvgQty: behavioral.historicalAvgQty,
    });

    // Loss Shield Safer Position Sizing calculation
    const lossShield = calculateSaferPosition({
      symbol,
      direction,
      entryPrice: Number(entryPrice),
      stopLoss: Number(stopLoss),
      takeProfit: Number(takeProfit),
      quantity: Number(quantity),
      leverage: Number(leverage),
      portfolioBalance: store.portfolio.totalBalance,
      historicalAvgQty: behavioral.historicalAvgQty,
      targetRiskPct: Number(targetRiskPct),
    });

    return NextResponse.json({
      success: true,
      risk,
      behavioral,
      lossShield,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to assess trade risk' },
      { status: 500 }
    );
  }
}
