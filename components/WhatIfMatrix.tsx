'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, AlertTriangle, TrendingDown, TrendingUp, Zap, Shield } from 'lucide-react';
import { WhatIfResult } from '@/lib/whatIfEngine';

export const WhatIfMatrix: React.FC = () => {
  const [marketShiftPct, setMarketShiftPct] = useState<number>(-5.0);
  const [volatilityMultiplier, setVolatilityMultiplier] = useState<number>(1.0);
  const [slippagePct, setSlippagePct] = useState<number>(0.1);
  const [simulation, setSimulation] = useState<WhatIfResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    runSimulation();
  }, [marketShiftPct, volatilityMultiplier, slippagePct]);

  const runSimulation = async () => {
    try {
      setIsSimulating(true);
      const resp = await fetch('/api/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketShiftPct,
          volatilityMultiplier,
          slippagePct,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setSimulation(data.simulation);
      }
    } catch (e) {
      console.error('Simulation request failed:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  const applyPreset = (shift: number) => {
    setMarketShiftPct(shift);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="bg-surface p-6 rounded-xl border border-border-subtle shadow-fin-card">
        <h2 className="text-xl font-semibold text-fin-charcoal">What-If Scenario & Stress Matrix</h2>
        <p className="text-xs text-fin-muted mt-1">
          Drag the market shock sliders to recalculate portfolio P&L, drawdown, capital at risk, and liquidation thresholds in real time.
        </p>
      </div>

      {/* Preset Quick Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => applyPreset(-10.0)}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            marketShiftPct === -10.0
              ? 'bg-status-danger-bg border-status-danger-border shadow-fin-sm'
              : 'bg-surface border-border-subtle hover:bg-surface-hover'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-status-danger-text mb-1">
            <Zap className="w-3.5 h-3.5" /> Flash Crash (-10%)
          </div>
          <div className="text-[11px] text-fin-muted">Systemic broad selloff shock</div>
        </button>

        <button
          onClick={() => applyPreset(-5.0)}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            marketShiftPct === -5.0
              ? 'bg-status-warning-bg border-status-warning-border shadow-fin-sm'
              : 'bg-surface border-border-subtle hover:bg-surface-hover'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-status-warning-text mb-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Earnings Gap (-5%)
          </div>
          <div className="text-[11px] text-fin-muted">Post-earnings volatility shock</div>
        </button>

        <button
          onClick={() => applyPreset(-20.0)}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            marketShiftPct === -20.0
              ? 'bg-rose-100 border-rose-300 shadow-fin-sm'
              : 'bg-surface border-border-subtle hover:bg-surface-hover'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800 mb-1">
            <Shield className="w-3.5 h-3.5" /> Black Swan (-20%)
          </div>
          <div className="text-[11px] text-fin-muted">Extreme tail-risk stress test</div>
        </button>

        <button
          onClick={() => applyPreset(5.0)}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            marketShiftPct === 5.0
              ? 'bg-status-healthy-bg border-status-healthy-border shadow-fin-sm'
              : 'bg-surface border-border-subtle hover:bg-surface-hover'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-status-healthy-text mb-1">
            <TrendingUp className="w-3.5 h-3.5" /> Bull Rally (+5%)
          </div>
          <div className="text-[11px] text-fin-muted">Market upside expansion</div>
        </button>
      </div>

      {/* Main Sliders & Simulation Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 bg-surface p-6 rounded-xl border border-border-subtle shadow-fin-card space-y-6">
          <h3 className="font-semibold text-fin-charcoal text-base border-b border-border-subtle pb-3">
            Market Stress Controls
          </h3>

          {/* Market Shift Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-fin-muted">Market Price Shift</label>
              <span className={`text-sm font-semibold font-mono ${marketShiftPct < 0 ? 'text-status-danger-text' : 'text-status-healthy-text'}`}>
                {marketShiftPct > 0 ? '+' : ''}{marketShiftPct}%
              </span>
            </div>
            <input
              type="range"
              min={-20}
              max={20}
              step={0.5}
              value={marketShiftPct}
              onChange={(e) => setMarketShiftPct(Number(e.target.value))}
              className="w-full h-2 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-fin-charcoal"
            />
            <div className="flex justify-between text-[10px] text-fin-muted mt-1">
              <span>-20% Shock</span>
              <span>0% Baseline</span>
              <span>+20% Rally</span>
            </div>
          </div>

          {/* Volatility Multiplier Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-fin-muted">Volatility Expansion</label>
              <span className="text-sm font-semibold font-mono text-fin-charcoal">
                {volatilityMultiplier}x
              </span>
            </div>
            <input
              type="range"
              min={1.0}
              max={3.0}
              step={0.1}
              value={volatilityMultiplier}
              onChange={(e) => setVolatilityMultiplier(Number(e.target.value))}
              className="w-full h-2 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-fin-charcoal"
            />
          </div>

          {/* Execution Slippage Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-fin-muted">Execution Slippage</label>
              <span className="text-sm font-semibold font-mono text-fin-charcoal">
                {slippagePct}%
              </span>
            </div>
            <input
              type="range"
              min={0.0}
              max={2.0}
              step={0.1}
              value={slippagePct}
              onChange={(e) => setSlippagePct(Number(e.target.value))}
              className="w-full h-2 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-fin-charcoal"
            />
          </div>
        </div>

        {/* Dynamic Simulation Output Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {simulation && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-surface p-4 rounded-xl border border-border-subtle shadow-fin-card">
                  <div className="text-xs font-medium text-fin-muted mb-1">Simulated Portfolio</div>
                  <div className="text-base font-bold text-fin-charcoal">
                    ₹{simulation.simulatedPortfolioValue.toLocaleString()}
                  </div>
                  <div className={`text-xs font-semibold mt-1 ${simulation.simulatedTotalPnl < 0 ? 'text-status-danger-text' : 'text-status-healthy-text'}`}>
                    {simulation.simulatedTotalPnl >= 0 ? '+' : ''}₹{simulation.simulatedTotalPnl.toLocaleString()} ({simulation.simulatedTotalPnlPct}%)
                  </div>
                </div>

                <div className="bg-surface p-4 rounded-xl border border-border-subtle shadow-fin-card">
                  <div className="text-xs font-medium text-fin-muted mb-1">Simulated Drawdown</div>
                  <div className="text-base font-bold text-fin-charcoal">
                    {simulation.simulatedDrawdownPct}%
                  </div>
                  <div className="text-xs text-fin-muted mt-1">From Peak Capital</div>
                </div>

                <div className="bg-surface p-4 rounded-xl border border-border-subtle shadow-fin-card">
                  <div className="text-xs font-medium text-fin-muted mb-1">Stress Risk Score</div>
                  <div className="text-base font-bold text-fin-charcoal">
                    {simulation.simulatedRiskScore} / 100
                  </div>
                  <div className="text-xs text-fin-muted mt-1">
                    {simulation.positionsAtRiskCount > 0 ? `${simulation.positionsAtRiskCount} positions breached` : 'All SL intact'}
                  </div>
                </div>
              </div>

              {/* Positions Stress Breakdown Table */}
              <div className="bg-surface p-5 rounded-xl border border-border-subtle shadow-fin-card">
                <h4 className="font-semibold text-fin-charcoal text-sm mb-3">
                  Position Impact Matrix ({simulation.positionBreakdowns.length} Active Positions)
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border-subtle text-fin-muted font-medium">
                        <th className="pb-2">Symbol</th>
                        <th className="pb-2">Direction</th>
                        <th className="pb-2">Simulated Price</th>
                        <th className="pb-2 text-right">P&L Impact</th>
                        <th className="pb-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {simulation.positionBreakdowns.map((pos, i) => (
                        <tr key={i} className="hover:bg-surface-hover">
                          <td className="py-2.5 font-semibold text-fin-charcoal">{pos.symbol}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${pos.direction === 'LONG' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                              {pos.direction}
                            </span>
                          </td>
                          <td className="py-2.5 font-mono">₹{pos.simulatedPrice}</td>
                          <td className={`py-2.5 text-right font-semibold ${pos.simulatedPnl >= 0 ? 'text-status-healthy-text' : 'text-status-danger-text'}`}>
                            {pos.simulatedPnl >= 0 ? '+' : ''}₹{pos.simulatedPnl.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-right">
                            {pos.isLiquidationRisk ? (
                              <span className="fin-badge bg-status-danger-bg text-status-danger-text border border-status-danger-border">Liquidation</span>
                            ) : pos.isStopLossBreached ? (
                              <span className="fin-badge bg-status-warning-bg text-status-warning-text border border-status-warning-border">SL Hit</span>
                            ) : (
                              <span className="fin-badge bg-surface-subtle text-fin-muted">Intact</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
