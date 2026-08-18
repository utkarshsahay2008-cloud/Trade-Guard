import { Position, Portfolio } from './database';

export interface WhatIfInput {
  marketShiftPct: number; // e.g. -5.0 for -5% shift
  volatilityMultiplier?: number; // 1.0 to 3.0
  slippagePct?: number; // 0.0% to 2.0%
  positions: Position[];
  portfolio: Portfolio;
}

export interface SimulatedPositionResult {
  symbol: string;
  direction: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  simulatedPrice: number;
  simulatedPnl: number;
  simulatedPnlPct: number;
  isStopLossBreached: boolean;
  isLiquidationRisk: boolean;
}

export interface WhatIfResult {
  marketShiftPct: number;
  volatilityMultiplier: number;
  slippagePct: number;
  initialPortfolioValue: number;
  simulatedPortfolioValue: number;
  simulatedTotalPnl: number;
  simulatedTotalPnlPct: number;
  simulatedDrawdownPct: number;
  capitalAtRisk: number;
  positionsAtRiskCount: number;
  simulatedRiskScore: number; // 0-100 score
  positionBreakdowns: SimulatedPositionResult[];
  presetStressTests: {
    name: string;
    description: string;
    shiftPct: number;
    simulatedPnl: number;
    drawdownPct: number;
    riskScore: number;
  }[];
}

export function simulateWhatIfScenario(input: WhatIfInput): WhatIfResult {
  const {
    marketShiftPct,
    volatilityMultiplier = 1.0,
    slippagePct = 0.1,
    positions,
    portfolio,
  } = input;

  const initialPortfolioValue = portfolio.totalBalance;
  let totalSimulatedPnl = 0;
  let capitalAtRisk = 0;
  let positionsAtRiskCount = 0;

  const positionBreakdowns: SimulatedPositionResult[] = positions.map(pos => {
    // Effective price shift considering direction and slippage
    const effectiveShift = marketShiftPct * (1 + (volatilityMultiplier - 1) * 0.3);
    let simulatedPrice = pos.currentPrice * (1 + effectiveShift / 100);

    // Apply slippage penalty if stop loss is hit during negative move
    if (pos.direction === 'LONG' && effectiveShift < 0) {
      simulatedPrice -= (pos.currentPrice * (slippagePct / 100));
    } else if (pos.direction === 'SHORT' && effectiveShift > 0) {
      simulatedPrice += (pos.currentPrice * (slippagePct / 100));
    }

    // P&L calculation
    let simulatedPnl = 0;
    if (pos.direction === 'LONG') {
      simulatedPnl = (simulatedPrice - pos.entryPrice) * pos.quantity * pos.leverage;
    } else {
      simulatedPnl = (pos.entryPrice - simulatedPrice) * pos.quantity * pos.leverage;
    }

    const simulatedPnlPct = (simulatedPnl / (pos.entryPrice * pos.quantity)) * 100;

    // Check breach flags
    const isStopLossBreached = pos.direction === 'LONG' 
      ? simulatedPrice <= pos.stopLoss 
      : simulatedPrice >= pos.stopLoss;

    // Liquidation estimation (10% maintenance margin)
    const marginPerUnit = pos.entryPrice / pos.leverage;
    const isLiquidationRisk = pos.direction === 'LONG'
      ? simulatedPrice <= (pos.entryPrice - marginPerUnit * 0.9)
      : simulatedPrice >= (pos.entryPrice + marginPerUnit * 0.9);

    if (isStopLossBreached || isLiquidationRisk) {
      positionsAtRiskCount++;
    }

    const posMaxLoss = Math.abs(pos.entryPrice - pos.stopLoss) * pos.quantity;
    capitalAtRisk += posMaxLoss;

    totalSimulatedPnl += simulatedPnl;

    return {
      symbol: pos.symbol,
      direction: pos.direction,
      quantity: pos.quantity,
      entryPrice: pos.entryPrice,
      simulatedPrice: Number(simulatedPrice.toFixed(2)),
      simulatedPnl: Math.round(simulatedPnl),
      simulatedPnlPct: Number(simulatedPnlPct.toFixed(2)),
      isStopLossBreached,
      isLiquidationRisk,
    };
  });

  const simulatedPortfolioValue = Math.max(0, initialPortfolioValue + totalSimulatedPnl);
  const simulatedTotalPnlPct = Number(((totalSimulatedPnl / initialPortfolioValue) * 100).toFixed(2));
  
  // Calculate simulated drawdown from peak balance
  const peak = Math.max(portfolio.peakBalance, initialPortfolioValue);
  const simulatedDrawdownPct = Number((((peak - simulatedPortfolioValue) / peak) * 100).toFixed(2));

  // Simulated Risk Score (0-100)
  let score = 30;
  if (simulatedTotalPnlPct < -10) score += 55;
  else if (simulatedTotalPnlPct < -5) score += 35;
  else if (simulatedTotalPnlPct < -2) score += 20;

  if (positionsAtRiskCount > 0) score += positionsAtRiskCount * 15;
  if (simulatedDrawdownPct >= 10) score += 20;

  const simulatedRiskScore = Math.min(100, Math.max(10, Math.round(score)));

  // Preset Stress Tests calculations
  const runPreset = (name: string, desc: string, shift: number) => {
    let pnl = 0;
    positions.forEach(pos => {
      const p = pos.currentPrice * (1 + shift / 100);
      const diff = pos.direction === 'LONG' ? (p - pos.entryPrice) : (pos.entryPrice - p);
      pnl += diff * pos.quantity * pos.leverage;
    });
    const newVal = Math.max(0, initialPortfolioValue + pnl);
    const dd = Number((((peak - newVal) / peak) * 100).toFixed(2));
    let rScore = 30;
    if (dd > 10) rScore = 88;
    else if (dd > 5) rScore = 65;
    else if (dd > 2) rScore = 45;
    return {
      name,
      description: desc,
      shiftPct: shift,
      simulatedPnl: Math.round(pnl),
      drawdownPct: dd,
      riskScore: rScore,
    };
  };

  const presetStressTests = [
    runPreset('Flash Crash (-10%)', 'Sudden systemic broad-market selloff with high liquidity drain', -10.0),
    runPreset('Earnings Volatility (-5%)', 'Post-earnings adverse gap open with elevated slippage', -5.0),
    runPreset('Black Swan (-20%)', 'Severe tail-risk liquidity event breaching stop losses', -20.0),
    runPreset('Bull Rally (+5%)', 'Broad market upside expansion favoring long positions', 5.0),
  ];

  return {
    marketShiftPct,
    volatilityMultiplier,
    slippagePct,
    initialPortfolioValue,
    simulatedPortfolioValue: Math.round(simulatedPortfolioValue),
    simulatedTotalPnl: Math.round(totalSimulatedPnl),
    simulatedTotalPnlPct,
    simulatedDrawdownPct,
    capitalAtRisk: Math.round(capitalAtRisk),
    positionsAtRiskCount,
    simulatedRiskScore,
    positionBreakdowns,
    presetStressTests,
  };
}
