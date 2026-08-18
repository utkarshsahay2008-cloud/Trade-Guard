import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseStore, saveDatabaseStore } from '@/lib/database';

export async function GET() {
  try {
    const store = getDatabaseStore();
    return NextResponse.json({
      success: true,
      user: store.user,
      profile: store.profile,
      portfolio: store.portfolio,
      positions: store.positions,
      riskAlerts: store.riskAlerts,
      marketData: store.marketData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const store = getDatabaseStore();

    if (body.action === 'UPDATE_POSITION') {
      const { positionId, quantity, stopLoss, takeProfit, leverage } = body;
      const index = store.positions.findIndex(p => p.id === positionId);
      if (index !== -1) {
        store.positions[index] = {
          ...store.positions[index],
          quantity: quantity !== undefined ? Number(quantity) : store.positions[index].quantity,
          stopLoss: stopLoss !== undefined ? Number(stopLoss) : store.positions[index].stopLoss,
          takeProfit: takeProfit !== undefined ? Number(takeProfit) : store.positions[index].takeProfit,
          leverage: leverage !== undefined ? Number(leverage) : store.positions[index].leverage,
          updatedAt: new Date().toISOString(),
        };
        saveDatabaseStore(store);
      }
    } else if (body.action === 'DISMISS_ALERT') {
      const { alertId } = body;
      store.riskAlerts = store.riskAlerts.filter(a => a.id !== alertId);
      saveDatabaseStore(store);
    }

    return NextResponse.json({
      success: true,
      portfolio: store.portfolio,
      positions: store.positions,
      riskAlerts: store.riskAlerts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update portfolio data' },
      { status: 500 }
    );
  }
}
