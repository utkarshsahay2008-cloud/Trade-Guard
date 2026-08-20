'use client';

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Target, ShieldCheck, ArrowRight, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { StockPredictionResult } from '@/lib/predictorEngine';

interface StockPredictorProps {
  onAnalyzeStock?: (symbol: string, entry: number, stop: number, target: number) => void;
}

export const StockPredictor: React.FC<StockPredictorProps> = ({ onAnalyzeStock }) => {
  const [symbol, setSymbol] = useState('RELIANCE');
  const [inputSymbol, setInputSymbol] = useState('');
  const [timeframe, setTimeframe] = useState<'5D' | '14D' | '30D'>('14D');
  const [prediction, setPrediction] = useState<StockPredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPrediction(symbol, timeframe);
  }, [symbol, timeframe]);

  const fetchPrediction = async (sym: string, tf: string) => {
    try {
      setIsLoading(true);
      const resp = await fetch(`/api/predict?symbol=${encodeURIComponent(sym)}&timeframe=${tf}`);
      const data = await resp.json();
      if (data.success) {
        setPrediction(data.prediction);
      }
    } catch (e) {
      console.error('Failed to fetch stock prediction:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSymbol.trim().length > 0) {
      setSymbol(inputSymbol.trim().toUpperCase());
      setInputSymbol('');
    }
  };

  const presetTickers = ['RELIANCE', 'INFY', 'TATASTEEL', 'NVDA', 'BTC/USD', 'AAPL'];

  return (
    <div className="space-y-6">
      
      {/* Title & Quick Ticker Selector Header */}
      <div className="bg-surface p-6 rounded-xl border border-border-subtle shadow-fin-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-fin-charcoal">Stock Change & Trend Predictor</h2>
            <p className="text-xs text-fin-muted mt-1">
              Quantitative forecast engine analyzing directional probabilities, target corridors, and momentum convergence
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex p-1 bg-surface-subtle rounded-xl border border-border-subtle text-xs self-start sm:self-auto">
            {(['5D', '14D', '30D'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 font-medium rounded-lg transition-all cursor-pointer ${
                  timeframe === tf ? 'bg-surface text-fin-charcoal shadow-fin-sm font-bold' : 'text-fin-muted hover:text-fin-body'
                }`}
              >
                {tf} Forecast
              </button>
            ))}
          </div>
        </div>

        {/* Ticker Search & Preset Chips */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-fin-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Enter ticker (e.g. RELIANCE, NVDA)..."
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value)}
              className="fin-input w-full pl-9 text-xs font-semibold uppercase"
            />
          </form>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
            <span className="text-[11px] text-fin-muted mr-1 font-medium">Quick:</span>
            {presetTickers.map((t) => (
              <button
                key={t}
                onClick={() => setSymbol(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                  symbol === t
                    ? 'bg-fin-charcoal text-surface border-fin-charcoal font-semibold shadow-fin-sm'
                    : 'bg-surface text-fin-body border-border-subtle hover:bg-surface-hover'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-fin-muted text-sm flex flex-col items-center gap-3 bg-surface rounded-xl border border-border-subtle shadow-fin-card">
          <div className="w-6 h-6 border-2 border-fin-charcoal border-t-transparent rounded-full animate-spin" />
          <span>Computing quantitative price forecast for {symbol}...</span>
        </div>
      ) : prediction ? (
        <>
          {/* Main Predictive Overview Banner */}
          <div className="bg-surface p-6 rounded-xl border border-border-subtle shadow-fin-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-fin-sm ${
                prediction.directionalBias === 'BULLISH'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {prediction.directionalBias === 'BULLISH' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-fin-charcoal">{prediction.symbol}</h3>
                  <span className="text-xs text-fin-muted">({prediction.assetName})</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    prediction.directionalBias === 'BULLISH'
                      ? 'bg-status-healthy-bg text-status-healthy-text border border-status-healthy-border'
                      : 'bg-status-danger-bg text-status-danger-text border border-status-danger-border'
                  }`}>
                    {prediction.directionalBias} Forecast
                  </span>
                </div>
                <div className="text-sm font-semibold text-fin-charcoal mt-1">
                  Current Price: <span className="font-mono">₹{prediction.currentPrice.toLocaleString()}</span>
                  <span className={`text-xs ml-2 ${prediction.dayChangePct >= 0 ? 'text-status-healthy-text' : 'text-status-danger-text'}`}>
                    ({prediction.dayChangePct >= 0 ? '+' : ''}{prediction.dayChangePct}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Model Confidence Rating */}
            <div className="text-right border-t md:border-t-0 md:border-l border-border-subtle pt-3 md:pt-0 md:pl-6 w-full md:w-auto">
              <div className="text-xs text-fin-muted font-medium">Quantitative Model Confidence</div>
              <div className="text-2xl font-bold text-fin-charcoal">{prediction.confidenceScorePct}%</div>
              <div className="text-[11px] text-emerald-700 font-medium">High Signal Convergence</div>
            </div>
          </div>

          {/* Directional Probability & Target Corridor Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Probability Gauge Panel (5 cols) */}
            <div className="lg:col-span-5 bg-surface p-6 rounded-xl border border-border-subtle shadow-fin-card space-y-4">
              <h4 className="font-semibold text-fin-charcoal text-base border-b border-border-subtle pb-3">
                Directional Probability Breakdown
              </h4>

              {/* Bullish Bar */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-status-healthy-text flex items-center gap-1 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" /> Bullish Expansion
                  </span>
                  <span className="font-bold text-status-healthy-text">{prediction.bullishProbabilityPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-subtle rounded-full overflow-hidden border border-border-subtle">
                  <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${prediction.bullishProbabilityPct}%` }} />
                </div>
              </div>

              {/* Bearish Bar */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-status-danger-text flex items-center gap-1 font-semibold">
                    <TrendingDown className="w-3.5 h-3.5" /> Bearish Retracement
                  </span>
                  <span className="font-bold text-status-danger-text">{prediction.bearishProbabilityPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-subtle rounded-full overflow-hidden border border-border-subtle">
                  <div className="h-full bg-rose-600 rounded-full transition-all duration-500" style={{ width: `${prediction.bearishProbabilityPct}%` }} />
                </div>
              </div>

              {/* Neutral Bar */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-fin-muted">Sideways Consolidation</span>
                  <span className="font-bold text-fin-charcoal">{prediction.neutralProbabilityPct}%</span>
                </div>
                <div className="w-full h-2 bg-surface-subtle rounded-full overflow-hidden border border-border-subtle">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: `${prediction.neutralProbabilityPct}%` }} />
                </div>
              </div>

              <div className="bg-surface-subtle p-3.5 rounded-xl border border-border-subtle text-xs text-fin-body leading-relaxed mt-2">
                {prediction.summaryInsight}
              </div>
            </div>

            {/* Price Target Corridor Cards (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Bull Target */}
                <div className="bg-surface p-4 rounded-xl border border-status-healthy-border bg-emerald-50/20 shadow-fin-sm">
                  <div className="text-xs font-medium text-status-healthy-text mb-1">Bull Target</div>
                  <div className="text-xl font-bold font-mono text-fin-charcoal">₹{prediction.targets.bullTarget}</div>
                  <div className="text-xs font-semibold text-status-healthy-text mt-1">
                    +{prediction.targets.bullGainPct}% Upside
                  </div>
                </div>

                {/* Base Target */}
                <div className="bg-surface p-4 rounded-xl border border-border-subtle shadow-fin-sm">
                  <div className="text-xs font-medium text-fin-muted mb-1">Base Target</div>
                  <div className="text-xl font-bold font-mono text-fin-charcoal">₹{prediction.targets.baseTarget}</div>
                  <div className="text-xs font-semibold text-fin-body mt-1">
                    {prediction.targets.baseGainPct >= 0 ? '+' : ''}{prediction.targets.baseGainPct}% Median
                  </div>
                </div>

                {/* Bear Target */}
                <div className="bg-surface p-4 rounded-xl border border-status-danger-border bg-rose-50/20 shadow-fin-sm">
                  <div className="text-xs font-medium text-status-danger-text mb-1">Bear Floor Risk</div>
                  <div className="text-xl font-bold font-mono text-fin-charcoal">₹{prediction.targets.bearTarget}</div>
                  <div className="text-xs font-semibold text-status-danger-text mt-1">
                    {prediction.targets.bearLossPct}% Downside
                  </div>
                </div>

              </div>

              {/* Key Predictive Convergence Signals */}
              <div className="bg-surface p-5 rounded-xl border border-border-subtle shadow-fin-card space-y-3">
                <h4 className="font-semibold text-fin-charcoal text-sm">
                  Technical Factors & Convergence Drivers
                </h4>

                <div className="space-y-2">
                  {prediction.predictiveFactors.map((factor, i) => (
                    <div key={i} className="p-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs space-y-1">
                      <div className="flex justify-between items-center font-medium">
                        <span className="font-semibold text-fin-charcoal">{factor.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          factor.signal === 'BULLISH' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {factor.signal}
                        </span>
                      </div>
                      <p className="text-fin-body text-[11px] leading-relaxed">{factor.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </>
      ) : null}

    </div>
  );
};
