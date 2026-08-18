'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCw, Info } from 'lucide-react';
import { LossShieldCard } from './LossShieldCard';
import { RiskExplanationDrawer } from './RiskExplanationDrawer';
import { RiskEngineResult } from '@/lib/riskEngine';
import { LossShieldResult } from '@/lib/lossShieldEngine';
import { StructuredLLMResponse } from '@/lib/llmService';

interface TradeAnalyzerProps {
  onTradeAssessed?: (risk: RiskEngineResult) => void;
}

export const TradeAnalyzer: React.FC<TradeAnalyzerProps> = () => {
  // Form State
  const [symbol, setSymbol] = useState('RELIANCE');
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [entryPrice, setEntryPrice] = useState<number>(2920);
  const [stopLoss, setStopLoss] = useState<number>(2840);
  const [takeProfit, setTakeProfit] = useState<number>(3100);
  const [quantity, setQuantity] = useState<number>(50);
  const [leverage, setLeverage] = useState<number>(5);

  // Analysis State
  const [riskResult, setRiskResult] = useState<RiskEngineResult | null>(null);
  const [lossShieldResult, setLossShieldResult] = useState<LossShieldResult | null>(null);
  const [aiExplanation, setAiExplanation] = useState<StructuredLLMResponse | null>(null);
  
  // UI State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Dynamic recalculation on parameter changes
  useEffect(() => {
    fetchRiskAnalysis();
  }, [symbol, direction, entryPrice, stopLoss, takeProfit, quantity, leverage]);

  const fetchRiskAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      const resp = await fetch('/api/risk-assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          direction,
          entryPrice,
          stopLoss,
          takeProfit,
          quantity,
          leverage,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setRiskResult(data.risk);
        setLossShieldResult(data.lossShield);
      }
    } catch (e) {
      console.error('Error calculating risk:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySaferPosition = (saferQty: number) => {
    setQuantity(saferQty); // Triggers useEffect to recalculate dynamically!
  };

  const handleOpenAiExplanation = async () => {
    setIsDrawerOpen(true);
    try {
      const resp = await fetch('/api/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          direction,
          entryPrice,
          stopLoss,
          takeProfit,
          quantity,
          leverage,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setAiExplanation(data.explanation);
      }
    } catch (e) {
      console.error('Failed to load AI explanation:', e);
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-status-danger-text bg-status-danger-bg border-status-danger-border';
    if (score >= 45) return 'text-status-warning-text bg-status-warning-bg border-status-warning-border';
    return 'text-status-healthy-text bg-status-healthy-bg border-status-healthy-border';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-xl border border-border-subtle shadow-fin-card">
        <div>
          <h2 className="text-xl font-semibold text-fin-charcoal">Live Trade Safety Analyzer</h2>
          <p className="text-xs text-fin-muted mt-1">
            Real-time deterministic financial risk engine & Loss Shield optimizer
          </p>
        </div>

        {riskResult && (
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border font-semibold text-sm flex items-center gap-2 ${getRiskScoreColor(riskResult.overallRiskScore)}`}>
              <span>Risk Score: {riskResult.overallRiskScore} / 100</span>
            </div>
            <button
              onClick={handleOpenAiExplanation}
              className="fin-badge bg-surface-subtle hover:bg-surface-muted border border-border-subtle text-fin-charcoal px-3 py-2 text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5"
            >
              <span>Why this matters →</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Form Parameters & Live Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Panel: Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-surface p-6 rounded-xl border border-border-subtle shadow-fin-card space-y-5">
          <h3 className="font-semibold text-fin-charcoal text-base border-b border-border-subtle pb-3">
            Trade Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Symbol */}
            <div>
              <label className="block text-xs font-medium text-fin-muted mb-1">Asset Symbol</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="fin-input w-full font-medium"
              >
                <option value="RELIANCE">RELIANCE (NSE India)</option>
                <option value="TATASTEEL">TATASTEEL (NSE India)</option>
                <option value="INFY">INFY (Infosys Ltd)</option>
                <option value="NVDA">NVDA (NVIDIA Corp)</option>
                <option value="BTC/USD">BTC/USD (Bitcoin)</option>
              </select>
            </div>

            {/* Direction */}
            <div>
              <label className="block text-xs font-medium text-fin-muted mb-1">Trade Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('LONG')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                    direction === 'LONG'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-fin-sm'
                      : 'bg-surface text-fin-muted border-border-subtle hover:bg-surface-hover'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> LONG
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('SHORT')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                    direction === 'SHORT'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-fin-sm'
                      : 'bg-surface text-fin-muted border-border-subtle hover:bg-surface-hover'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" /> SHORT
                </button>
              </div>
            </div>

            {/* Entry Price */}
            <div>
              <label className="block text-xs font-medium text-fin-muted mb-1">Entry Price (₹)</label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="fin-input w-full font-mono"
              />
            </div>

            {/* Stop Loss */}
            <div>
              <label className="block text-xs font-medium text-fin-muted mb-1">Stop Loss (₹)</label>
              <input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(Number(e.target.value))}
                className="fin-input w-full font-mono text-status-danger-text"
              />
            </div>

            {/* Take Profit */}
            <div>
              <label className="block text-xs font-medium text-fin-muted mb-1">Take Profit (₹)</label>
              <input
                type="number"
                value={takeProfit}
                onChange={(e) => setTakeProfit(Number(e.target.value))}
                className="fin-input w-full font-mono text-status-healthy-text"
              />
            </div>

            {/* Leverage */}
            <div>
              <label className="block text-xs font-medium text-fin-muted mb-1">Leverage ({leverage}x)</label>
              <select
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="fin-input w-full font-medium"
              >
                <option value={1}>1x (No Leverage)</option>
                <option value={2}>2x Leverage</option>
                <option value={3}>3x Leverage</option>
                <option value={5}>5x Leverage</option>
                <option value={10}>10x High Risk</option>
              </select>
            </div>
          </div>

          {/* Interactive Position Quantity Slider */}
          <div className="pt-2 border-t border-border-subtle">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-fin-muted">
                Position Quantity: <span className="font-semibold text-fin-charcoal text-sm">{quantity} units</span>
              </label>
              <span className="text-[11px] text-fin-muted">
                Historical Avg: {lossShieldResult?.beforeRisk.historicalSizeMultiplier}x avg
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full h-2 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-fin-charcoal"
            />
          </div>
        </div>

        {/* Right Panel: Deterministic Live Risk Calculations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {riskResult && (
            <div className="bg-surface p-6 rounded-xl border border-border-subtle shadow-fin-card space-y-4">
              <h3 className="font-semibold text-fin-charcoal text-base border-b border-border-subtle pb-3">
                Calculated Risk Output
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-xs text-fin-muted">Position Exposure</span>
                  <span className="font-semibold text-fin-charcoal">
                    ₹{riskResult.positionExposure.toLocaleString()} ({riskResult.positionPortfolioPct}% of Account)
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-xs text-fin-muted">Max Capital at Risk</span>
                  <span className={`font-semibold ${riskResult.portfolioRiskPct > 2.0 ? 'text-status-danger-text' : 'text-fin-charcoal'}`}>
                    ₹{riskResult.maxCapitalLoss.toLocaleString()} ({riskResult.portfolioRiskPct}% of Account)
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-xs text-fin-muted">Max Profit Potential</span>
                  <span className="font-semibold text-status-healthy-text">
                    ₹{riskResult.maxProfitPotential.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-xs text-fin-muted">Risk-to-Reward Ratio</span>
                  <span className={`font-semibold ${riskResult.riskRewardRatio < 1.5 ? 'text-status-warning-text' : 'text-status-healthy-text'}`}>
                    {riskResult.riskRewardRatio}:1
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-xs text-fin-muted">Est. Liquidation Price</span>
                  <span className="font-mono text-fin-body">₹{riskResult.liquidationPrice}</span>
                </div>
              </div>

              {/* Warnings List */}
              {riskResult.warnings.length > 0 && (
                <div className="space-y-2 pt-2">
                  {riskResult.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-status-warning-bg border border-status-warning-border text-xs text-status-warning-text">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Loss Shield Section */}
      <LossShieldCard
        lossShield={lossShieldResult}
        onApplySaferPosition={handleApplySaferPosition}
        isLoading={isAnalyzing}
      />

      {/* Contextual Risk Drawer */}
      <RiskExplanationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        explanation={aiExplanation}
      />
    </div>
  );
};
