import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseStore } from '@/lib/database';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionTab?: 'dashboard' | 'analyzer' | 'predictor' | 'whatif' | 'behavioral' | 'journal';
  actionLabel?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const store = getDatabaseStore();
    const portfolio = store.portfolio;
    const positions = store.positions;
    const riskAlerts = store.riskAlerts.filter(a => !a.isDismissed);
    const user = store.user;

    const contextSummary = {
      userName: user.fullName || 'Trader',
      totalBalance: portfolio.totalBalance,
      availableCash: portfolio.availableCash,
      allocatedMargin: portfolio.allocatedMargin,
      dailyPnl: portfolio.dailyPnl,
      maxDrawdownPct: portfolio.maxDrawdownPct,
      openPositionsCount: positions.length,
      openPositions: positions.map(p => ({
        symbol: p.symbol,
        direction: p.direction,
        qty: p.quantity,
        entryPrice: p.entryPrice,
        currentPrice: p.currentPrice,
        unrealizedPnl: p.unrealizedPnl,
        riskScore: p.riskScore,
      })),
      activeAlertsCount: riskAlerts.length,
      activeAlertTitles: riskAlerts.map(a => a.title),
    };

    const q = message.toLowerCase();

    // Check Navigation Intent
    let suggestedTab: 'dashboard' | 'analyzer' | 'predictor' | 'whatif' | 'behavioral' | 'journal' | undefined;
    let suggestedTabLabel: string | undefined;

    if (q.includes('analyzer') || q.includes('risk assess') || (q.includes('trade') && q.includes('safety')) || q.includes('stop loss')) {
      suggestedTab = 'analyzer';
      suggestedTabLabel = 'Open Trade Safety Analyzer';
    } else if (q.includes('predict') || q.includes('forecast') || q.includes('stock') || q.includes('target')) {
      suggestedTab = 'predictor';
      suggestedTabLabel = 'Open Stock Predictor';
    } else if (q.includes('whatif') || q.includes('matrix') || q.includes('stress') || q.includes('shock') || q.includes('crash')) {
      suggestedTab = 'whatif';
      suggestedTabLabel = 'Open What-If Stress Matrix';
    } else if (q.includes('dna') || q.includes('behavior') || q.includes('revenge') || q.includes('fomo') || q.includes('psychology')) {
      suggestedTab = 'behavioral';
      suggestedTabLabel = 'Open Trading DNA';
    } else if (q.includes('journal') || q.includes('log') || q.includes('history') || q.includes('notes')) {
      suggestedTab = 'journal';
      suggestedTabLabel = 'Open Trade Journal';
    } else if (q.includes('portfolio') || q.includes('dashboard') || q.includes('overview') || q.includes('balance') || q.includes('pnl')) {
      suggestedTab = 'dashboard';
      suggestedTabLabel = 'Open Portfolio Overview';
    }

    const apiKey = process.env.LLM_API_KEY;
    const provider = process.env.LLM_PROVIDER || 'gemini';

    if (apiKey && apiKey.trim().length > 5) {
      try {
        const aiResponse = await callLiveLLM(apiKey, provider, message, history, contextSummary);
        if (aiResponse) {
          return NextResponse.json({
            success: true,
            reply: aiResponse,
            provider: provider === 'gemini' ? 'Gemini 1.5 Flash' : 'OpenAI GPT-4',
            actionTab: suggestedTab,
            actionLabel: suggestedTabLabel,
          });
        }
      } catch (err) {
        console.warn('Live LLM call failed, falling back to Trade-Guard Financial Navigator:', err);
      }
    }

    // Intelligent Navigation & Financial Risk Assistant Fallback
    const fallbackReply = generateIntelligentFallbackReply(message, contextSummary);

    return NextResponse.json({
      success: true,
      reply: fallbackReply.reply,
      provider: 'Trade-Guard AI Navigator',
      actionTab: suggestedTab || fallbackReply.suggestedTab,
      actionLabel: suggestedTabLabel || fallbackReply.suggestedTabLabel,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Chatbot request failed' },
      { status: 500 }
    );
  }
}

async function callLiveLLM(
  apiKey: string,
  provider: string,
  userMessage: string,
  history: ChatMessage[],
  context: any
): Promise<string | null> {
  const systemPrompt = `You are Trade-Guard AI, an expert financial risk advisor & navigation co-pilot.
Your mission is to guide traders, explain portfolio metrics, provide risk advice, and help users navigate the platform features.

USER CONTEXT:
- Name: ${context.userName}
- Total Balance: ₹${context.totalBalance.toLocaleString()}
- Cash: ₹${context.availableCash.toLocaleString()} | Margin: ₹${context.allocatedMargin.toLocaleString()}
- Daily P&L: ₹${context.dailyPnl.toLocaleString()}
- Max Drawdown: ${context.maxDrawdownPct}%
- Active Positions (${context.openPositionsCount}): ${JSON.stringify(context.openPositions)}
- Active System Alerts (${context.activeAlertsCount}): ${context.activeAlertTitles.join(', ') || 'None'}

Formatting Rules:
- Keep answers concise, clear, and action-oriented.
- Use bullet points, bold text for key metrics, and clean line breaks.
- If recommending a feature, specify which tab to visit.`;

  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const contents = [
      { parts: [{ text: systemPrompt }] },
      ...history.slice(-6).map(m => ({
        parts: [{ text: `${m.role === 'user' ? 'Trader' : 'Trade-Guard AI'}: ${m.content}` }]
      })),
      { parts: [{ text: `Trader: ${userMessage}` }] }
    ];

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!resp.ok) return null;
    const data = await resp.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  }

  return null;
}

function generateIntelligentFallbackReply(query: string, context: any): {
  reply: string;
  suggestedTab?: 'dashboard' | 'analyzer' | 'predictor' | 'whatif' | 'behavioral' | 'journal';
  suggestedTabLabel?: string;
} {
  const q = query.toLowerCase();

  if (q.includes('analyzer') || q.includes('safety') || q.includes('calculate') || q.includes('stop loss')) {
    return {
      reply: `### 🛡️ Trade Safety Analyzer Navigation Guide

The **Trade Safety Analyzer** tab evaluates live trade entries before execution:

1. **Trade Parameters**: Select symbol (e.g. RELIANCE), direction (LONG/SHORT), entry price, stop-loss, and leverage.
2. **Dynamic Risk Meter**: Calculates position exposure, maximum capital loss, and risk-to-reward ratio in real time.
3. **Loss Shield Engine**: Suggests safe position quantities so your trade never breaches **2.0%** of account equity (₹${(context.totalBalance * 0.02).toLocaleString()}).`,
      suggestedTab: 'analyzer',
      suggestedTabLabel: '🚀 Go to Trade Safety Analyzer',
    };
  }

  if (q.includes('predict') || q.includes('forecast') || q.includes('stock') || q.includes('target')) {
    return {
      reply: `### 📈 Stock Forecast & Quantitative Predictor Guide

The **Stock Predictor** tab provides multi-factor price forecasts:

1. **Directional Probability**: Breaks down Bullish Expansion %, Bearish Retracement %, and Sideways Consolidation %.
2. **Target Corridor**: Visualizes Bull Target, Base Forecast, and Bear Risk Floor.
3. **Trajectory Graph**: Shows price trajectory forecasts over 5D, 14D, and 30D horizons.`,
      suggestedTab: 'predictor',
      suggestedTabLabel: '📈 Go to Stock Predictor',
    };
  }

  if (q.includes('whatif') || q.includes('stress') || q.includes('crash') || q.includes('matrix') || q.includes('shock')) {
    return {
      reply: `### ⚡ What-If Stress Matrix Navigation Guide

The **What-If Matrix** lets you simulate market shocks on your open portfolio positions:

1. **Preset Shock Buttons**: One-click test Flash Crash (-10%), Earnings Gap (-5%), or Black Swan (-20%).
2. **Interactive Sliders**: Adjust market price shift (-20% to +20%), volatility expansion, and execution slippage.
3. **Impact Matrix**: Shows position-by-position P&L impact, stop-loss breaches, and liquidation risk.`,
      suggestedTab: 'whatif',
      suggestedTabLabel: '⚡ Go to What-If Matrix',
    };
  }

  if (q.includes('dna') || q.includes('revenge') || q.includes('fomo') || q.includes('psychology') || q.includes('behavior')) {
    return {
      reply: `### 🧬 Trading DNA & Behavioral Intelligence Guide

The **Trading DNA** tab quantifies trader psychological triggers:

- **Revenge Score**: Detects sizing escalation immediately following loss trades.
- **FOMO Score**: Detects entries chased far from support levels.
- **Overtrading Velocity**: Monitors daily execution frequency to prevent emotional fatigue.`,
      suggestedTab: 'behavioral',
      suggestedTabLabel: '🧬 Go to Trading DNA',
    };
  }

  if (q.includes('journal') || q.includes('log') || q.includes('history') || q.includes('notes')) {
    return {
      reply: `### 📖 Trade Journal & Execution Log Guide

The **Trade Journal** tab stores historical executions and trader notes:

- **Manual Trade Logger**: Record entry/exit prices, emotional state (CALM, REVENGE, FOMO), and conviction score.
- **CSV/JSON Import**: Import historical trade logs directly from broker exports.
- **Filtering**: Search trades by symbol or status (OPEN / CLOSED).`,
      suggestedTab: 'journal',
      suggestedTabLabel: '📖 Go to Trade Journal',
    };
  }

  if (q.includes('portfolio') || q.includes('doing') || q.includes('balance') || q.includes('overview') || q.includes('summary')) {
    return {
      reply: `### 📊 Portfolio Status Overview for ${context.userName}

- **Total Capital Equity**: ₹${context.totalBalance.toLocaleString()}
- **Available Cash**: ₹${context.availableCash.toLocaleString()}
- **Allocated Margin**: ₹${context.allocatedMargin.toLocaleString()}
- **Daily P&L**: ${context.dailyPnl >= 0 ? '🟢 +' : '🔴 '}₹${context.dailyPnl.toLocaleString()}
- **Drawdown**: ${context.maxDrawdownPct > 5.0 ? '⚠️ ' : '✅ '}${context.maxDrawdownPct}% from peak capital

${context.openPositionsCount > 0 
  ? `You currently have **${context.openPositionsCount} active open positions** in ${context.openPositions.map((p: any) => p.symbol).join(', ')}.` 
  : 'You have no open positions at present.'}

${context.activeAlertsCount > 0 
  ? `⚠️ **Attention**: There are **${context.activeAlertsCount} active risk alerts** requiring review!` 
  : '✅ All position parameters meet standard risk guidelines.'}`,
      suggestedTab: 'dashboard',
      suggestedTabLabel: '📊 Go to Portfolio Overview',
    };
  }

  return {
    reply: `### 🤖 Trade-Guard AI Navigator & Assistant

I am your context-aware financial safety assistant & platform navigator! You can ask me to navigate or explain any section:

- *"Take me to Trade Safety Analyzer"*
- *"Show me Stock Predictor forecast for RELIANCE"*
- *"Run a What-If stress test crash simulation"*
- *"Check my Trading DNA and revenge trading score"*
- *"Show my Portfolio overview & daily P&L"*

What would you like to explore or analyze right now?`,
  };
}
