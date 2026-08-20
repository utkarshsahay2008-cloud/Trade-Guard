import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseStore, saveDatabaseStore } from '@/lib/database';
import { parseTradeDataset } from '@/lib/tradeParserEngine';
import { analyzeBehavioralData } from '@/lib/behavioralEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileContent, mode = 'MERGE' } = body; // mode: 'MERGE' | 'REPLACE'

    if (!fileContent || typeof fileContent !== 'string') {
      return NextResponse.json(
        { success: false, error: 'No file content or raw text provided.' },
        { status: 400 }
      );
    }

    const parseResult = parseTradeDataset(fileContent);

    if (!parseResult.success || parseResult.parsedTrades.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parsing failed. Could not extract valid trade records.',
          parseResult,
        },
        { status: 400 }
      );
    }

    const store = getDatabaseStore();

    if (mode === 'REPLACE') {
      store.trades = parseResult.parsedTrades;
    } else {
      // MERGE: Prepend new uploaded trades, avoiding duplicate IDs
      const existingIds = new Set(store.trades.map(t => t.id));
      const newUniqueTrades = parseResult.parsedTrades.filter(t => !existingIds.has(t.id));
      store.trades = [...newUniqueTrades, ...store.trades];
    }

    // Extract any embedded journal entries
    parseResult.parsedTrades.forEach(t => {
      if (t.journalEntry) {
        store.journals.unshift(t.journalEntry);
      }
    });

    // Re-evaluate Behavioral Intelligence & Trading DNA on updated dataset
    const behavioral = analyzeBehavioralData(store.trades);
    store.behavioralSignals = {
      id: `bs_${Date.now()}`,
      userId: store.user.id,
      revengeScore: behavioral.revengeScore,
      fomoScore: behavioral.fomoScore,
      overtradingScore: behavioral.overtradingScore,
      riskEscalationScore: behavioral.riskEscalationScore,
      positionAnomalyScore: behavioral.positionAnomalyScore,
      primaryArchetype: behavioral.primaryArchetype,
      dominantTrigger: behavioral.dominantTrigger,
      calculatedAt: new Date().toISOString(),
    };

    saveDatabaseStore(store);

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${parseResult.validRows} trades (${mode} mode).`,
      parseResult,
      totalTradesInDatabase: store.trades.length,
      updatedBehavioral: behavioral,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload and parse dataset' },
      { status: 500 }
    );
  }
}
