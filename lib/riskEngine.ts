export interface TradeInput {
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  quantity: number;
  leverage: number;
  portfolioBalance: number;
  historicalAvgQty?: number;
}

export interface RiskEngineResult {
  positionExposure: number;
  maxCapitalLoss: number;
  maxProfitPotential: number;
  riskRewardRatio: number;
  portfolioRiskPct: number;
  positionPortfolioPct: number;
  leverageRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  overallRiskScore: number; // 0-100 score
  breakevenPrice: number;
  liquidationPrice: number;
  historicalSizeMultiplier: number;
  isRiskExceeded: boolean;
  warnings: string[];
}

export function calculateTradeRisk(input: TradeInput): RiskEngineResult {
  const {
    direction,
    entryPrice,
    stopLoss,
    takeProfit,
    quantity,
    leverage = 1,
    portfolioBalance = 100000,
    historicalAvgQty = 25,
  } = input;

  // 1. Exposure calculation (Noting leverage effect)
  const positionExposure = entryPrice * quantity;
  const positionPortfolioPct = (positionExposure / portfolioBalance) * 100;

  // 2. Maximum Loss Calculation
  let maxCapitalLoss = 0;
  if (direction === 'LONG') {
    maxCapitalLoss = Math.max(0, entryPrice - stopLoss) * quantity;
  } else {
    maxCapitalLoss = Math.max(0, stopLoss - entryPrice) * quantity;
  }

  // 3. Maximum Profit Calculation
  let maxProfitPotential = 0;
  if (direction === 'LONG') {
    maxProfitPotential = Math.max(0, takeProfit - entryPrice) * quantity;
  } else {
    maxProfitPotential = Math.max(0, entryPrice - takeProfit) * quantity;
  }

  // 4. Risk to Reward Ratio
  const riskRewardRatio = maxCapitalLoss > 0 ? Number((maxProfitPotential / maxCapitalLoss).toFixed(2)) : 0;

  // 5. Portfolio Risk %
  const portfolioRiskPct = Number(((maxCapitalLoss / portfolioBalance) * 100).toFixed(2));

  // 6. Leverage Risk Level
  let leverageRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (leverage >= 10) leverageRiskLevel = 'CRITICAL';
  else if (leverage >= 5) leverageRiskLevel = 'HIGH';
  else if (leverage >= 3) leverageRiskLevel = 'MODERATE';

  // 7. Liquidation Price Estimation (approximate maintenance margin requirement 10%)
  const marginPerUnit = entryPrice / leverage;
  let liquidationPrice = 0;
  if (direction === 'LONG') {
    liquidationPrice = entryPrice - (marginPerUnit * 0.9);
  } else {
    liquidationPrice = entryPrice + (marginPerUnit * 0.9);
  }

  // Breakeven price assuming 0.05% trading fee / slippage
  const breakevenPrice = direction === 'LONG' ? entryPrice * 1.001 : entryPrice * 0.999;

  // 8. Historical Size Multiplier
  const historicalSizeMultiplier = historicalAvgQty > 0 ? Number((quantity / historicalAvgQty).toFixed(2)) : 1.0;

  // 9. Composite Risk Score Algorithm (0 - 100)
  // Baseline risk starts from portfolio risk %
  let score = 0;
  
  // A. Portfolio Risk Component (0-40 pts)
  // 2% is ideal baseline limit. Every 0.5% above 2% adds 10 pts.
  if (portfolioRiskPct <= 1.0) score += 10;
  else if (portfolioRiskPct <= 2.0) score += 25;
  else if (portfolioRiskPct <= 4.0) score += 50;
  else if (portfolioRiskPct <= 6.0) score += 75;
  else score += 95;

  // B. Leverage Component (0-20 pts)
  score += Math.min(20, (leverage - 1) * 4);

  // C. Risk-Reward Component (0-20 pts)
  if (riskRewardRatio < 1.0) score += 20; // Poor R:R
  else if (riskRewardRatio < 1.5) score += 12;
  else if (riskRewardRatio < 2.0) score += 5;

  // D. Position Anomaly Component (0-20 pts)
  if (historicalSizeMultiplier > 2.0) score += 20;
  else if (historicalSizeMultiplier > 1.5) score += 12;
  else if (historicalSizeMultiplier > 1.2) score += 5;

  const overallRiskScore = Math.min(100, Math.max(5, Math.round(score)));

  // Warnings collection
  const warnings: string[] = [];
  if (portfolioRiskPct > 2.0) {
    warnings.push(`Max loss (${portfolioRiskPct}%) exceeds recommended 2.0% portfolio ceiling.`);
  }
  if (historicalSizeMultiplier >= 1.5) {
    warnings.push(`Position size is ${historicalSizeMultiplier}x your historical average trade size.`);
  }
  if (riskRewardRatio < 1.5) {
    warnings.push(`Risk-to-Reward ratio (${riskRewardRatio}:1) is below optimal 1.5:1 ratio.`);
  }
  if (leverage >= 5) {
    warnings.push(`Leverage of ${leverage}x increases liquidation sensitivity.`);
  }

  return {
    positionExposure: Math.round(positionExposure),
    maxCapitalLoss: Math.round(maxCapitalLoss),
    maxProfitPotential: Math.round(maxProfitPotential),
    riskRewardRatio,
    portfolioRiskPct,
    positionPortfolioPct: Number(positionPortfolioPct.toFixed(1)),
    leverageRiskLevel,
    overallRiskScore,
    breakevenPrice: Number(breakevenPrice.toFixed(2)),
    liquidationPrice: Number(liquidationPrice.toFixed(2)),
    historicalSizeMultiplier,
    isRiskExceeded: portfolioRiskPct > 2.0 || overallRiskScore >= 70,
    warnings,
  };
}
