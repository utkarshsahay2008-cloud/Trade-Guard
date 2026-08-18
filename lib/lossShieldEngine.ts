import { calculateTradeRisk, TradeInput, RiskEngineResult } from './riskEngine';

export interface LossShieldInput extends TradeInput {
  targetRiskPct?: number; // Target max portfolio loss % (default 2.0%)
}

export interface CauseEffectDiff {
  metric: string;
  beforeValue: string | number;
  afterValue: string | number;
  changeLabel: string;
  isImprovement: boolean;
}

export interface LossShieldResult {
  currentQuantity: number;
  saferQuantity: number;
  targetRiskPct: number;
  beforeRisk: RiskEngineResult;
  afterRisk: RiskEngineResult;
  exposureBefore: number;
  exposureAfter: number;
  maxLossBefore: number;
  maxLossAfter: number;
  lossReductionAmount: number;
  lossReductionPct: number;
  riskScoreDelta: number;
  causeEffectDiffs: CauseEffectDiff[];
  recommendationReason: string;
}

export function calculateSaferPosition(input: LossShieldInput): LossShieldResult {
  const {
    direction,
    entryPrice,
    stopLoss,
    takeProfit,
    quantity: currentQuantity,
    leverage = 1,
    portfolioBalance = 100000,
    historicalAvgQty = 25,
    targetRiskPct = 2.0,
  } = input;

  // Calculate current risk profile
  const beforeRisk = calculateTradeRisk(input);

  // 1. Calculate max allowed loss amount based on target risk %
  const maxAllowedLossAmount = portfolioBalance * (targetRiskPct / 100);

  // 2. Risk per unit
  const riskPerUnit = Math.abs(entryPrice - stopLoss);

  // 3. Optimal Safer Quantity
  let saferQuantity = currentQuantity;
  if (riskPerUnit > 0) {
    saferQuantity = Math.floor(maxAllowedLossAmount / riskPerUnit);
  }

  // Ensure safer quantity is at least 1 and not larger than current if current was already safe
  if (saferQuantity <= 0) saferQuantity = 1;

  // Calculate new risk profile with safer quantity
  const afterInput: TradeInput = {
    ...input,
    quantity: saferQuantity,
  };
  const afterRisk = calculateTradeRisk(afterInput);

  // Calculate differences
  const exposureBefore = beforeRisk.positionExposure;
  const exposureAfter = afterRisk.positionExposure;

  const maxLossBefore = beforeRisk.maxCapitalLoss;
  const maxLossAfter = afterRisk.maxCapitalLoss;

  const lossReductionAmount = Math.max(0, maxLossBefore - maxLossAfter);
  const lossReductionPct = maxLossBefore > 0 
    ? Number(((lossReductionAmount / maxLossBefore) * 100).toFixed(1))
    : 0;

  const riskScoreDelta = afterRisk.overallRiskScore - beforeRisk.overallRiskScore;

  // Format Cause → Effect Diff Cards for UI
  const causeEffectDiffs: CauseEffectDiff[] = [
    {
      metric: 'Position Quantity',
      beforeValue: `${currentQuantity} units`,
      afterValue: `${saferQuantity} units`,
      changeLabel: `${saferQuantity < currentQuantity ? '-' : '+'}${Math.abs(currentQuantity - saferQuantity)} units`,
      isImprovement: saferQuantity < currentQuantity,
    },
    {
      metric: 'Position Exposure',
      beforeValue: `₹${exposureBefore.toLocaleString()}`,
      afterValue: `₹${exposureAfter.toLocaleString()}`,
      changeLabel: `₹${(exposureAfter - exposureBefore).toLocaleString()}`,
      isImprovement: exposureAfter < exposureBefore,
    },
    {
      metric: 'Potential Max Loss',
      beforeValue: `₹${maxLossBefore.toLocaleString()} (${beforeRisk.portfolioRiskPct}%)`,
      afterValue: `₹${maxLossAfter.toLocaleString()} (${afterRisk.portfolioRiskPct}%)`,
      changeLabel: `-${lossReductionPct}% Loss`,
      isImprovement: maxLossAfter < maxLossBefore,
    },
    {
      metric: 'Overall Risk Score',
      beforeValue: beforeRisk.overallRiskScore,
      afterValue: afterRisk.overallRiskScore,
      changeLabel: `${riskScoreDelta > 0 ? '+' : ''}${riskScoreDelta} pts`,
      isImprovement: riskScoreDelta < 0,
    },
  ];

  const recommendationReason = currentQuantity > saferQuantity
    ? `Reducing position quantity from ${currentQuantity} to ${saferQuantity} units cuts maximum portfolio loss by ${lossReductionPct}% (saving ₹${lossReductionAmount.toLocaleString()}) and caps trade risk strictly at ${targetRiskPct}% of capital.`
    : `Your position quantity of ${currentQuantity} units is already within the recommended ${targetRiskPct}% portfolio risk ceiling.`;

  return {
    currentQuantity,
    saferQuantity,
    targetRiskPct,
    beforeRisk,
    afterRisk,
    exposureBefore,
    exposureAfter,
    maxLossBefore,
    maxLossAfter,
    lossReductionAmount,
    lossReductionPct,
    riskScoreDelta,
    causeEffectDiffs,
    recommendationReason,
  };
}
