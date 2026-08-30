import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseStore } from '@/lib/database';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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
          });
        }
      } catch (err) {
        console.warn('Live LLM call failed, falling back to Trade-Guard Financial Risk Assistant:', err);
      }
    }

    // Intelligent Financial Risk Assistant Fallback
    const fallbackReply = generateIntelligentFallbackReply(message, contextSummary);

    return NextResponse.json({
      success: true,
      reply: fallbackReply,
      provider: 'Trade-Guard AI Assistant',
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
  const systemPrompt = `You are Trade-Guard AI, an expert, calm, and quantitative financial risk advisor & trading co-pilot.
Your core mission is capital preservation, risk-reward optimization, preventing revenge trading, and providing actionable trading guidance.

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
- Always highlight financial safety, stop-loss discipline, and proper position sizing.`;

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

function generateIntelligentFallbackReply(query: string, context: any): string {
  const q = query.toLowerCase();

  if (q.includes('portfolio') || q.includes('doing') || q.includes('balance') || q.includes('summary')) {
    return `### 📊 Portfolio Status Overview for ${context.userName}

- **Total Capital Equity**: ₹${context.totalBalance.toLocaleString()}
- **Available Cash**: ₹${context.availableCash.toLocaleString()}
- **Allocated Margin**: ₹${context.allocatedMargin.toLocaleString()}
- **Daily P&L**: ${context.dailyPnl >= 0 ? '🟢 +' : '🔴 '}₹${context.dailyPnl.toLocaleString()}
- **Account Drawdown**: ${context.maxDrawdownPct > 5.0 ? '⚠️ ' : '✅ '}${context.maxDrawdownPct}% from peak capital

${context.openPositionsCount > 0 
  ? `You currently have **${context.openPositionsCount} active open positions** in ${context.openPositions.map((p: any) => p.symbol).join(', ')}.` 
  : 'You have no open positions at present.'}

${context.activeAlertsCount > 0 
  ? `⚠️ **Attention**: There are **${context.activeAlertsCount} active risk alerts** requiring review! Check the Portfolio Overview tab for details.` 
  : '✅ All position parameters meet default safety boundaries.'}`;
  }

  if (q.includes('reliance') || q.includes('trade') || q.includes('position') || q.includes('analyze')) {
    const rel = context.openPositions.find((p: any) => p.symbol === 'RELIANCE');
    if (rel) {
      return `### 🔍 Position Analysis: RELIANCE

- **Direction**: ${rel.direction} (${rel.qty} units)
- **Entry Price**: ₹${rel.entryPrice} | **Current Price**: ₹${rel.currentPrice}
- **Unrealized P&L**: ${rel.unrealizedPnl >= 0 ? '🟢 +' : '🔴 '}₹${rel.unrealizedPnl.toLocaleString()}
- **Risk Score**: **${rel.riskScore}/100** ${rel.riskScore >= 70 ? '⚠️ (High Exposure Risk)' : '✅ (Managed)'}

**Risk Assessment**:
1. **Capital Risk**: Keep potential loss capped at < 2.0% of account equity (₹${(context.totalBalance * 0.02).toLocaleString()}).
2. **Stop-Loss Sizing**: Always ensure your stop loss is explicitly placed on the chart before scaling leverage.
3. **Recommendation**: Consider using Trade-Guard's **Loss Shield** on the Trade Analyzer tab to calculate optimal position sizing.`;
    }

    return `### 🛡️ Trade Safety Checklist

To evaluate a trade setup for any asset:
1. **Risk Cap**: Limit maximum capital loss to **2.0%** of account balance (₹${(context.totalBalance * 0.02).toLocaleString()}).
2. **Reward-to-Risk**: Aim for at least a **1.5 : 1** R:R ratio before placing entries.
3. **Leverage Limit**: Avoid exceeding 3x–5x leverage on high-volatility stock setups.
4. **Behavioral DNA**: Ensure you are not entering out of FOMO or following consecutive losses.`;
  }

  if (q.includes('revenge') || q.includes('fomo') || q.includes('dna') || q.includes('psychology') || q.includes('emotion')) {
    return `### 🧬 Trading Behavioral DNA & Psychological Health

- **Revenge Trading Pattern**: Triggered when sizing up position quantities immediately after a losing trade to "get back money".
- **FOMO (Fear Of Missing Out)**: Triggered when chasing green candles far from major support levels.
- **Overtrading**: High trade execution velocity (> 10 trades/day) leads to commission decay and low emotional resilience.

**Action Plan**:
- Use the **Trading DNA tab** to monitor your behavioral archetype scores in real time.
- Set a daily max loss limit (e.g. ₹3,000) and step away from terminals if breached.`;
  }

  if (q.includes('drawdown') || q.includes('loss') || q.includes('risk') || q.includes('shield')) {
    return `### 🛡️ Capital Preservation & Loss Shield

Your current drawdown is **${context.maxDrawdownPct}%**. 

**Key Guardrails**:
- **Loss Shield Engine**: Automatically calculates exact unit quantities to ensure your trade never breaches 2.0% risk.
- **What-If Stress Matrix**: Simulate market shocks (e.g., -5% gap downs or -10% flash crashes) before opening margin positions.
- **Rule of Thumb**: If portfolio drawdown exceeds 10%, reduce position sizes by 50% until equity recovers to peak levels.`;
  }

  return `### 🤖 Trade-Guard AI Assistant

I am your context-aware financial safety assistant! Here are some things you can ask me:

- *"How is my portfolio doing today?"*
- *"Analyze my open RELIANCE position."*
- *"How can I prevent revenge trading after a loss?"*
- *"What is my maximum safe position size for a new trade?"*
- *"Explain my active risk alerts."*

**Account Snapshot**: ₹${context.totalBalance.toLocaleString()} Equity | ${context.openPositionsCount} Open Positions | Drawdown: ${context.maxDrawdownPct}%`;
}
