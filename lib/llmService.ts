import { RiskEngineResult } from './riskEngine';
import { BehavioralAnalysisResult } from './behavioralEngine';
import { WhatIfResult } from './whatIfEngine';
import { LossShieldResult } from './lossShieldEngine';

export interface LLMRiskContext {
  tradeInput: {
    symbol: string;
    direction: 'LONG' | 'SHORT';
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    quantity: number;
    leverage: number;
  };
  portfolioStats: {
    totalBalance: number;
    allocatedMargin: number;
    maxDrawdownPct: number;
  };
  riskMetrics: RiskEngineResult;
  behavioralSignals?: BehavioralAnalysisResult;
  whatIfScenarios?: WhatIfResult;
  lossShield?: LossShieldResult;
}

export interface StructuredLLMResponse {
  headline: string;
  conciseExplanation: string;
  primaryRisks: string[];
  saferAlternatives: string[];
  behavioralObservation: string;
  isFallback: boolean;
  provider: string;
}

export async function generateRiskExplanation(context: LLMRiskContext): Promise<StructuredLLMResponse> {
  const apiKey = process.env.LLM_API_KEY;

  if (apiKey && apiKey.trim().length > 5) {
    try {
      // Attempt live Gemini / OpenAI API request
      const liveResponse = await callLiveLLMProvider(apiKey, context);
      if (liveResponse) return liveResponse;
    } catch (e) {
      console.warn('Live LLM request failed, falling back to deterministic explanation engine:', e);
    }
  }

  // Seamless Deterministic Fallback Engine
  return generateDeterministicExplanation(context);
}

// Deterministic Financial Natural Language Generator (Requirement #9)
export function generateDeterministicExplanation(context: LLMRiskContext): StructuredLLMResponse {
  const { tradeInput, portfolioStats, riskMetrics, behavioralSignals, lossShield } = context;

  const { symbol, direction, quantity, entryPrice, stopLoss, leverage } = tradeInput;
  const { maxCapitalLoss, portfolioRiskPct, positionPortfolioPct, overallRiskScore, historicalSizeMultiplier } = riskMetrics;

  let headline = `Position Risk: ${symbol} (${direction})`;
  if (historicalSizeMultiplier > 1.4) {
    headline = `Position Risk: Your ${symbol} position is ${historicalSizeMultiplier}× larger than your historical average.`;
  } else if (portfolioRiskPct > 2.0) {
    headline = `Capital Risk: Maximum potential loss (${portfolioRiskPct}%) breaches your 2.0% portfolio risk limit.`;
  } else if (overallRiskScore >= 70) {
    headline = `High Compound Risk Score (${overallRiskScore}/100) detected on ${symbol}.`;
  } else {
    headline = `Healthy Position Alignment: ${symbol} meets standard portfolio risk guidelines.`;
  }

  const conciseExplanation = `This position represents ₹${riskMetrics.positionExposure.toLocaleString()} in total exposure (${positionPortfolioPct}% of account capital) with a potential maximum loss of ₹${maxCapitalLoss.toLocaleString()} (${portfolioRiskPct}% of capital) if stop-loss at ₹${stopLoss} is triggered.`;

  const primaryRisks: string[] = [];
  if (portfolioRiskPct > 2.0) {
    primaryRisks.push(`Portfolio Concentration: Potential loss of ₹${maxCapitalLoss.toLocaleString()} exceeds your target 2.0% risk limit by ${(portfolioRiskPct - 2.0).toFixed(1)}%.`);
  }
  if (historicalSizeMultiplier > 1.3) {
    primaryRisks.push(`Historical Anomaly: Quantity of ${quantity} units exceeds baseline average trade size (${behavioralSignals?.historicalAvgQty || 25} units).`);
  }
  if (leverage >= 5) {
    primaryRisks.push(`Leverage Sensitivity: ${leverage}× leverage narrows liquidation distance to ₹${riskMetrics.liquidationPrice}.`);
  }
  if (riskMetrics.riskRewardRatio < 1.5) {
    primaryRisks.push(`Unfavorable Risk-to-Reward: Expected return ratio (${riskMetrics.riskRewardRatio}:1) is below target 1.5:1 ratio.`);
  }

  if (primaryRisks.length === 0) {
    primaryRisks.push(`Market Volatility: Standard price fluctuation risk down to stop-loss level (₹${stopLoss}).`);
  }

  const saferAlternatives: string[] = [];
  if (lossShield && lossShield.saferQuantity < quantity) {
    saferAlternatives.push(`Apply Safer Position Sizing: Reduce quantity from ${quantity} to ${lossShield.saferQuantity} units to cap max loss at ₹${lossShield.maxLossAfter.toLocaleString()} (2.0% risk).`);
  }
  if (leverage > 2) {
    saferAlternatives.push(`Reduce Leverage: Lower leverage from ${leverage}× to 2× to increase margin buffer against liquidation.`);
  }
  if (stopLoss === 0) {
    saferAlternatives.push(`Define Hard Stop Loss: Place a stop-loss at ${direction === 'LONG' ? (entryPrice * 0.96).toFixed(1) : (entryPrice * 1.04).toFixed(1)} to prevent unmanaged tail loss.`);
  }

  if (saferAlternatives.length === 0) {
    saferAlternatives.push('Maintain Current Plan: Position parameters match disciplined risk parameters.');
  }

  let behavioralObservation = 'Trading execution aligns with baseline statistical performance.';
  if (behavioralSignals) {
    if (behavioralSignals.revengeScore >= 65) {
      behavioralObservation = `Post-Loss Trigger: Position size escalation detected following ${behavioralSignals.recentLossStreak} recent loss trades. High correlation with revenge trading.`;
    } else if (behavioralSignals.fomoScore >= 60) {
      behavioralObservation = 'Chase Pattern: High entry price distance relative to support structure suggests FOMO entry.';
    } else if (behavioralSignals.overtradingScore >= 60) {
      behavioralObservation = `Velocity Alert: ${behavioralSignals.tradeFrequency24h} trades executed within 24 hours. Consider cooling off period.`;
    }
  }

  return {
    headline,
    conciseExplanation,
    primaryRisks,
    saferAlternatives,
    behavioralObservation,
    isFallback: true,
    provider: 'Trade-Guard Deterministic Risk Engine',
  };
}

async function callLiveLLMProvider(apiKey: string, context: LLMRiskContext): Promise<StructuredLLMResponse | null> {
  const provider = process.env.LLM_PROVIDER || 'gemini';
  const prompt = `
  You are Trade-Guard's calm, financial risk analyst.
  Analyze the following structured trade context and return a JSON object ONLY with these fields:
  {
    "headline": "Short, precise title (e.g. Position is 1.8x larger than historical average)",
    "conciseExplanation": "Clear factual 2-sentence summary of position exposure and capital at risk",
    "primaryRisks": ["Risk factor 1", "Risk factor 2"],
    "saferAlternatives": ["Safer execution option 1", "Safer execution option 2"],
    "behavioralObservation": "Factual behavioral pattern observation"
  }

  CONTEXT:
  ${JSON.stringify(context, null, 2)}
  `;

  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      const parsed = JSON.parse(rawText);
      return {
        ...parsed,
        isFallback: false,
        provider: 'Gemini 1.5 Flash',
      };
    }
  }
  return null;
}
