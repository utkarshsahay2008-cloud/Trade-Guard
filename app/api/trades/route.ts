import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseStore, saveDatabaseStore, Trade, TradeJournal } from '@/lib/database';
import { calculateTradeRisk } from '@/lib/riskEngine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');
    const status = searchParams.get('status');

    const store = getDatabaseStore();
    let trades = store.trades;

    if (symbol) {
      trades = trades.filter(t => t.symbol.toUpperCase() === symbol.toUpperCase());
    }
    if (status) {
      trades = trades.filter(t => t.status.toUpperCase() === status.toUpperCase());
    }

    return NextResponse.json({
      success: true,
      trades,
      journals: store.journals,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const store = getDatabaseStore();

    const {
      symbol,
      assetClass = 'EQUITY',
      direction,
      quantity,
      entryPrice,
      exitPrice,
      stopLoss,
      takeProfit,
      leverage = 1,
      notes,
      emotionalState = 'CALM',
      convictionLevel = 3,
      tags = [],
    } = body;

    // Validate inputs
    if (!symbol || !direction || !quantity || !entryPrice || !stopLoss || !takeProfit) {
      return NextResponse.json(
        { success: false, error: 'Missing required trade parameters' },
        { status: 400 }
      );
    }

    // Calculate risk score at entry
    const riskAssessment = calculateTradeRisk({
      symbol,
      direction,
      entryPrice: Number(entryPrice),
      stopLoss: Number(stopLoss),
      takeProfit: Number(takeProfit),
      quantity: Number(quantity),
      leverage: Number(leverage),
      portfolioBalance: store.portfolio.totalBalance,
    });

    const isClosed = exitPrice !== undefined && exitPrice !== null;
    let pnl = 0;
    let pnlPct = 0;

    if (isClosed) {
      const exitP = Number(exitPrice);
      const entryP = Number(entryPrice);
      const qty = Number(quantity);
      pnl = direction === 'LONG' ? (exitP - entryP) * qty * Number(leverage) : (entryP - exitP) * qty * Number(leverage);
      pnlPct = (pnl / (entryP * qty)) * 100;
    }

    const tradeId = `tr_${Date.now()}`;
    const newTrade: Trade = {
      id: tradeId,
      portfolioId: store.portfolio.id,
      symbol: symbol.toUpperCase(),
      assetClass,
      direction,
      quantity: Number(quantity),
      entryPrice: Number(entryPrice),
      exitPrice: exitPrice ? Number(exitPrice) : undefined,
      stopLoss: Number(stopLoss),
      takeProfit: Number(takeProfit),
      leverage: Number(leverage),
      pnl: Math.round(pnl),
      pnlPct: Number(pnlPct.toFixed(2)),
      status: isClosed ? 'CLOSED' : 'OPEN',
      riskScoreAtEntry: riskAssessment.overallRiskScore,
      executedAt: new Date().toISOString(),
      closedAt: isClosed ? new Date().toISOString() : undefined,
    };

    store.trades.unshift(newTrade);

    // Create journal record if notes provided
    if (notes) {
      const journal: TradeJournal = {
        id: `j_${Date.now()}`,
        tradeId,
        userId: store.user.id,
        notes,
        emotionalState,
        convictionLevel: Number(convictionLevel),
        tags: Array.isArray(tags) ? tags : [tags],
        createdAt: new Date().toISOString(),
      };
      newTrade.journalEntry = journal;
      store.journals.unshift(journal);
    }

    // Update portfolio balance if closed
    if (isClosed) {
      store.portfolio.totalBalance += pnl;
      store.portfolio.realizedPnl += pnl;
      store.portfolio.peakBalance = Math.max(store.portfolio.peakBalance, store.portfolio.totalBalance);
      store.portfolio.updatedAt = new Date().toISOString();
    }

    saveDatabaseStore(store);

    return NextResponse.json({
      success: true,
      trade: newTrade,
      riskAssessment,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create trade' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Trade ID required' }, { status: 400 });
    }

    const store = getDatabaseStore();
    store.trades = store.trades.filter(t => t.id !== id);
    store.journals = store.journals.filter(j => j.tradeId !== id);
    saveDatabaseStore(store);

    return NextResponse.json({ success: true, message: 'Trade deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
