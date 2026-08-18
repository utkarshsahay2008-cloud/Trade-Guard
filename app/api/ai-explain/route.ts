import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseStore } from '@/lib/database';
import { calculateTradeRisk } from '@/lib/riskEngine';
import { analyzeBehavioralData } from '@/lib/behavioralEngine';
import { calculateSaferPosition } from '@/lib/lossShieldEngine';
import { generateRiskExplanation } from '@/lib/llmService';

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
    } = body;

    const tradeInput = {
      symbol,
      direction: direction as 'LONG' | 'SHORT',
      entryPrice: Number(entryPrice),
      stopLoss: Number(stopLoss),
      takeProfit: Number(takeProfit),
      quantity: Number(quantity),
      leverage: Number(leverage),
    };

    const behavioral = analyzeBehavioralData(store.trades, tradeInput.quantity);
    const riskMetrics = calculateTradeRisk({
      ...tradeInput,
      portfolioBalance: store.portfolio.totalBalance,
      historicalAvgQty: behavioral.historicalAvgQty,
    });

    const lossShield = calculateSaferPosition({
      ...tradeInput,
      portfolioBalance: store.portfolio.totalBalance,
      historicalAvgQty: behavioral.historicalAvgQty,
    });

    const explanation = await generateRiskExplanation({
      tradeInput,
      portfolioStats: {
        totalBalance: store.portfolio.totalBalance,
        allocatedMargin: store.portfolio.allocatedMargin,
        maxDrawdownPct: store.portfolio.maxDrawdownPct,
      },
      riskMetrics,
      behavioralSignals: behavioral,
      lossShield,
    });

    return NextResponse.json({
      success: true,
      explanation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate AI explanation' },
      { status: 500 }
    );
  }
}
