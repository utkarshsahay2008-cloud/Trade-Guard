import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseStore } from '@/lib/database';
import { predictStockMovement } from '@/lib/predictorEngine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol') || 'RELIANCE';
    const timeframe = (searchParams.get('timeframe') as any) || '14D';

    const store = getDatabaseStore();
    const prediction = predictStockMovement(symbol, store.marketData, timeframe);

    return NextResponse.json({
      success: true,
      prediction,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Stock prediction failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symbol = 'RELIANCE', timeframe = '14D' } = body;

    const store = getDatabaseStore();
    const prediction = predictStockMovement(symbol, store.marketData, timeframe);

    return NextResponse.json({
      success: true,
      prediction,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Stock prediction failed' },
      { status: 500 }
    );
  }
}
