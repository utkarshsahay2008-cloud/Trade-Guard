import { Trade, BehavioralSignal } from './database';

export interface BehavioralAnalysisResult {
  revengeScore: number; // 0-100
  fomoScore: number; // 0-100
  overtradingScore: number; // 0-100
  riskEscalationScore: number; // 0-100
  positionAnomalyScore: number; // 0-100
  primaryArchetype: string;
  dominantTrigger: string;
  historicalAvgQty: number;
  recentLossStreak: number;
  tradeFrequency24h: number;
  behavioralSignals: string[];
}

export function analyzeBehavioralData(trades: Trade[], candidateQty?: number): BehavioralAnalysisResult {
  if (!trades || trades.length === 0) {
    return {
      revengeScore: 10,
      fomoScore: 15,
      overtradingScore: 10,
      riskEscalationScore: 10,
      positionAnomalyScore: 10,
      primaryArchetype: 'Disciplined Novice',
      dominantTrigger: 'Insufficient historical trade volume for anomaly detection',
      historicalAvgQty: candidateQty || 25,
      recentLossStreak: 0,
      tradeFrequency24h: 0,
      behavioralSignals: ['No trade history anomalies detected.'],
    };
  }

  // Sort trades by execution timestamp descending (newest first)
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
  );

  // 1. Calculate Historical Average & Standard Deviation of Position Quantity
  const quantities = trades.map(t => t.quantity);
  const totalQtySum = quantities.reduce((acc, q) => acc + q, 0);
  const historicalAvgQty = totalQtySum / quantities.length;
  
  const variance = quantities.reduce((acc, q) => acc + Math.pow(q - historicalAvgQty, 2), 0) / quantities.length;
  const stdDevQty = Math.sqrt(variance) || 1;

  // 2. Evaluate Recent Loss Streak & Time Delta to next trade
  let recentLossStreak = 0;
  let postLossSizeSpike = false;
  let rapidReentryMinutes = 9999;

  for (let i = 0; i < sortedTrades.length; i++) {
    const t = sortedTrades[i];
    if (t.status === 'CLOSED' && t.pnl < 0) {
      recentLossStreak++;
    } else if (t.status === 'CLOSED' && t.pnl > 0) {
      break; // Stop counting streak at first win
    }
  }

  // Check if candidate position size or newest trade exhibits post-loss escalation
  const targetQty = candidateQty || sortedTrades[0].quantity;
  const sizeRatioToAvg = targetQty / historicalAvgQty;

  if (recentLossStreak >= 2 && sizeRatioToAvg >= 1.4) {
    postLossSizeSpike = true;
  }

  // Check time delta between last closed loss trade and newest execution
  const lastClosedLoss = sortedTrades.find(t => t.status === 'CLOSED' && t.pnl < 0);
  if (lastClosedLoss && lastClosedLoss.closedAt) {
    const lossTime = new Date(lastClosedLoss.closedAt).getTime();
    const newestTime = candidateQty ? Date.now() : new Date(sortedTrades[0].executedAt).getTime();
    rapidReentryMinutes = Math.max(0, Math.round((newestTime - lossTime) / 60000));
  }

  // 3. REVENGE SCORE CALCULATION
  let revengeScore = 15;
  if (recentLossStreak >= 3) revengeScore += 30;
  else if (recentLossStreak >= 2) revengeScore += 20;

  if (postLossSizeSpike) revengeScore += 35;
  if (rapidReentryMinutes <= 60) revengeScore += 25;
  else if (rapidReentryMinutes <= 180) revengeScore += 15;

  revengeScore = Math.min(100, Math.max(10, Math.round(revengeScore)));

  // 4. FOMO SCORE CALCULATION
  let fomoScore = 20;
  // Evaluate high entry risk & chase patterns
  const highRiskEntries = sortedTrades.filter(t => t.riskScoreAtEntry >= 75).length;
  fomoScore += Math.min(40, (highRiskEntries / sortedTrades.length) * 100);

  if (sizeRatioToAvg >= 2.0) fomoScore += 25;
  fomoScore = Math.min(100, Math.max(12, Math.round(fomoScore)));

  // 5. OVERTRADING SCORE CALCULATION
  const now = Date.now();
  const tradesLast24h = sortedTrades.filter(
    t => now - new Date(t.executedAt).getTime() <= 24 * 3600 * 1000
  ).length;

  let overtradingScore = 15;
  if (tradesLast24h >= 6) overtradingScore += 65;
  else if (tradesLast24h >= 4) overtradingScore += 40;
  else if (tradesLast24h >= 2) overtradingScore += 20;
  overtradingScore = Math.min(100, Math.max(10, Math.round(overtradingScore)));

  // 6. RISK ESCALATION SCORE CALCULATION
  let riskEscalationScore = 20;
  if (recentLossStreak >= 2 && sizeRatioToAvg >= 1.5) {
    riskEscalationScore += 50;
  }
  if (sizeRatioToAvg >= 2.2) {
    riskEscalationScore += 30;
  }
  riskEscalationScore = Math.min(100, Math.max(10, Math.round(riskEscalationScore)));

  // 7. POSITION ANOMALY SCORE CALCULATION
  const zScore = Math.abs(targetQty - historicalAvgQty) / stdDevQty;
  let positionAnomalyScore = Math.min(100, Math.round(zScore * 30 + 15));

  // 8. Primary Archetype Determination
  let primaryArchetype = 'Disciplined Swing Trader';
  let dominantTrigger = 'Stable position sizing and risk discipline';

  if (revengeScore >= 70 || riskEscalationScore >= 70) {
    primaryArchetype = 'Drawdown Escalator';
    dominantTrigger = `Position size spikes (${sizeRatioToAvg.toFixed(1)}x avg) immediately following ${recentLossStreak} consecutive losses`;
  } else if (fomoScore >= 65) {
    primaryArchetype = 'Impulsive Momentum Chaser';
    dominantTrigger = 'Chasing high entry prices near market extremes';
  } else if (overtradingScore >= 65) {
    primaryArchetype = 'High-Frequency Scalper';
    dominantTrigger = `Excessive trade execution velocity (${tradesLast24h} trades in 24h)`;
  } else if (positionAnomalyScore >= 70) {
    primaryArchetype = 'Size Anomaly Trader';
    dominantTrigger = `Current trade quantity (${targetQty}) is ${zScore.toFixed(1)} standard deviations above baseline`;
  }

  // Behavioral signals summary string array
  const behavioralSignals: string[] = [];
  if (revengeScore >= 60) {
    behavioralSignals.push(`Revenge Risk: Size escalation detected right after ${recentLossStreak} recent losses.`);
  }
  if (sizeRatioToAvg >= 1.5) {
    behavioralSignals.push(`Anomaly: Position size is ${sizeRatioToAvg.toFixed(1)}x larger than historical average (${historicalAvgQty.toFixed(0)} units).`);
  }
  if (overtradingScore >= 50) {
    behavioralSignals.push(`Velocity: ${tradesLast24h} trades opened within the last 24 hours.`);
  }

  return {
    revengeScore,
    fomoScore,
    overtradingScore,
    riskEscalationScore,
    positionAnomalyScore,
    primaryArchetype,
    dominantTrigger,
    historicalAvgQty: Number(historicalAvgQty.toFixed(1)),
    recentLossStreak,
    tradeFrequency24h: tradesLast24h,
    behavioralSignals,
  };
}
