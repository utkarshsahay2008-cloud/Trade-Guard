'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCw, Info, Sliders, Zap, Shield, Sparkles } from 'lucide-react';
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
    setQuantity(saferQty);
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
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border-subtle shadow-fin-card">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-fin-charcoal">Live Trade Safety Analyzer</h2>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              INTERACTIVE RISK CALCULATOR
            </span>
          </div>
          <p className="text-xs text-fin-muted mt-1">
            Real-time financial safety engine & Loss Shield optimizer for margin setups
          </p>
        </div>

        {riskResult && (
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border font-bold text-sm flex items-center gap-2 shadow-fin-sm ${getRiskScoreColor(riskResult.overallRiskScore)}`}>
              <Shield className="w-4 h-4" />
              <span>Risk Score: {riskResult.overallRiskScore} / 100</span>
            </div>
            <button
              onClick={handleOpenAiExplanation}
              className="fin-badge bg-fin-charcoal hover:bg-slate-800 text-surface px-3 py-2 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shadow-fin-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Explain with AI →</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Form Inputs & Calculated Risk Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Panel: Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-surface p-6 rounded-2xl border border-border-subtle shadow-fin-card space-y-5">
          <h3 className="font-bold text-fin-charcoal text-base border-b border-border-subtle pb-3 flex items-center justify-between">
            <span>Trade Parameters</span>
            <span className="text-xs font-normal text-fin-muted">Adjust values to see live risk calculations</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Symbol */}
            <div>
              <label className="block text-xs font-semibold text-fin-muted mb-1">Asset Symbol</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="fin-input w-full font-semibold cursor-pointer"
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
              <label className="block text-xs font-semibold text-fin-muted mb-1">Trade Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('LONG')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                    direction === 'LONG'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-fin-sm'
                      : 'bg-surface text-fin-muted border-border-subtle hover:bg-surface-hover'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" /> LONG
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('SHORT')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                    direction === 'SHORT'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-fin-sm'
                      : 'bg-surface text-fin-muted border-border-subtle hover:bg-surface-hover'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" /> SHORT
                </button>
              </div>
            </div>

            {/* Entry Price */}
            <div>
              <label className="block text-xs font-semibold text-fin-muted mb-1">Entry Price (₹)</label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="fin-input w-full font-mono font-bold"
              />
            </div>

            {/* Stop Loss */}
            <div>
              <label className="block text-xs font-semibold text-fin-muted mb-1">Stop Loss (₹)</label>
              <input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(Number(e.target.value))}
                className="fin-input w-full font-mono font-bold text-status-danger-text"
              />
            </div>

            {/* Take Profit */}
            <div>
              <label className="block text-xs font-semibold text-fin-muted mb-1">Take Profit (₹)</label>
              <input
                type="number"
                value={takeProfit}
                onChange={(e) => setTakeProfit(Number(e.target.value))}
                className="fin-input w-full font-mono font-bold text-status-healthy-text"
              />
            </div>

            {/* Leverage */}
            <div>
              <label className="block text-xs font-semibold text-fin-muted mb-1">Leverage Multiplier</label>
              <select
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="fin-input w-full font-semibold cursor-pointer"
              >
                <option value={1}>1x (No Leverage)</option>
                <option value={2}>2x Leverage</option>
                <option value={3}>3x Leverage</option>
                <option value={5}>5x Leverage</option>
                <option value={10}>10x High Leverage</option>
              </select>
            </div>
          </div>

          {/* Interactive Position Quantity Slider */}
          <div className="pt-3 border-t border-border-subtle space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-fin-muted flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-fin-charcoal" />
                Position Quantity: <span className="font-bold text-fin-charcoal text-sm">{quantity} units</span>
              </label>
              <span className="text-[11px] text-fin-muted font-mono">
                Exposure: ₹{(quantity * entryPrice).toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full h-2.5 bg-surface-subtle rounded-lg appearance-none cursor-pointer accent-fin-charcoal"
            />
            <div className="flex justify-between text-[10px] font-semibold text-fin-muted">
              <span>5 units (Small)</span>
              <span>100 units (Standard)</span>
              <span>200 units (High Risk)</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Risk Calculations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {riskResult && (
            <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-fin-card space-y-4">
              <h3 className="font-bold text-fin-charcoal text-base border-b border-border-subtle pb-3">
                Calculated Risk Output
              </h3>

              {/* Visual Meter Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Overall Risk Rating</span>
                  <span className={riskResult.overallRiskScore >= 70 ? 'text-status-danger-text' : 'text-status-healthy-text'}>
                    {riskResult.overallRiskScore} / 100
                  </span>
                </div>
                <div className="w-full h-3 bg-surface-subtle rounded-full overflow-hidden border border-border-subtle">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      riskResult.overallRiskScore >= 70 ? 'bg-rose-600' : riskResult.overallRiskScore >= 45 ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${riskResult.overallRiskScore}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3 text-xs pt-1">
                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-fin-muted font-medium">Position Exposure</span>
                  <span className="font-bold text-fin-charcoal font-mono">
                    ₹{riskResult.positionExposure.toLocaleString()} ({riskResult.positionPortfolioPct}% Equity)
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-fin-muted font-medium">Max Capital at Loss</span>
                  <span className={`font-bold font-mono ${riskResult.portfolioRiskPct > 2.0 ? 'text-status-danger-text' : 'text-fin-charcoal'}`}>
                    ₹{riskResult.maxCapitalLoss.toLocaleString()} ({riskResult.portfolioRiskPct}% Equity)
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-fin-muted font-medium">Max Profit Target</span>
                  <span className="font-bold font-mono text-status-healthy-text">
                    ₹{riskResult.maxProfitPotential.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-fin-muted font-medium">Risk-to-Reward Ratio</span>
                  <span className={`font-bold font-mono ${riskResult.riskRewardRatio < 1.5 ? 'text-status-warning-text' : 'text-status-healthy-text'}`}>
                    {riskResult.riskRewardRatio} : 1
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-border-subtle">
                  <span className="text-fin-muted font-medium">Liquidation Distance</span>
                  <span className="font-mono font-semibold text-fin-charcoal">₹{riskResult.liquidationPrice}</span>
                </div>
              </div>

              {/* Warnings List */}
              {riskResult.warnings.length > 0 && (
                <div className="space-y-2 pt-1">
                  {riskResult.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-status-warning-bg border border-status-warning-border text-xs text-status-warning-text font-medium">
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
