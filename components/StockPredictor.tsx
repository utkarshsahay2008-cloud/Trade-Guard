'use client';

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Target, ShieldCheck, ArrowRight, Activity, Zap, CheckCircle2, Sparkles, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
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

  // Simulated Price Forecast Chart Data
  const forecastChartData = prediction ? [
    { day: 'Day 0', price: prediction.currentPrice, bull: prediction.currentPrice, bear: prediction.currentPrice },
    { day: 'Day 3', price: Math.round((prediction.currentPrice + prediction.targets.baseTarget) / 2), bull: Math.round((prediction.currentPrice + prediction.targets.bullTarget) / 2), bear: Math.round((prediction.currentPrice + prediction.targets.bearTarget) / 2) },
    { day: 'Day 7', price: prediction.targets.baseTarget, bull: Math.round((prediction.targets.bullTarget * 0.9)), bear: Math.round((prediction.targets.bearTarget * 1.05)) },
    { day: 'Day 14', price: prediction.targets.baseTarget, bull: prediction.targets.bullTarget, bear: prediction.targets.bearTarget },
  ] : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title & Quick Ticker Selector Header */}
      <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-fin-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-fin-charcoal">Stock Forecast & Quantitative Predictor</h2>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                AI QUANT MODEL
              </span>
            </div>
            <p className="text-xs text-fin-muted mt-1">
              Multi-factor forecast engine analyzing momentum convergence, probability corridors, and volatility bands
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex p-1 bg-surface-subtle rounded-xl border border-border-subtle text-xs self-start sm:self-auto">
            {(['5D', '14D', '30D'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                  timeframe === tf ? 'bg-surface text-fin-charcoal shadow-fin-sm' : 'text-fin-muted hover:text-fin-body'
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
            <Search className="w-4 h-4 text-fin-muted absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search ticker (e.g. RELIANCE, NVDA)..."
              value={inputSymbol}
              onChange={(e) => setInputSymbol(e.target.value)}
              className="fin-input w-full pl-10 text-xs font-bold uppercase"
            />
          </form>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
            <span className="text-[11px] text-fin-muted mr-1 font-semibold">Quick Assets:</span>
            {presetTickers.map((t) => (
              <button
                key={t}
                onClick={() => setSymbol(t)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                  symbol === t
                    ? 'bg-fin-charcoal text-surface border-fin-charcoal shadow-fin-sm'
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
        <div className="py-20 text-center text-fin-muted text-sm flex flex-col items-center gap-3 bg-surface rounded-2xl border border-border-subtle shadow-fin-card">
          <div className="w-6 h-6 border-2 border-fin-charcoal border-t-transparent rounded-full animate-spin" />
          <span>Computing quantitative price forecast for {symbol}...</span>
        </div>
      ) : prediction ? (
        <>
          {/* Predictive Overview Banner */}
          <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-fin-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-fin-sm ${
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
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    prediction.directionalBias === 'BULLISH'
                      ? 'bg-status-healthy-bg text-status-healthy-text border border-status-healthy-border'
                      : 'bg-status-danger-bg text-status-danger-text border border-status-danger-border'
                  }`}>
                    {prediction.directionalBias} Forecast
                  </span>
                </div>
                <div className="text-sm font-semibold text-fin-charcoal mt-1">
                  Current Price: <span className="font-mono font-bold">₹{prediction.currentPrice.toLocaleString()}</span>
                  <span className={`text-xs ml-2 font-bold ${prediction.dayChangePct >= 0 ? 'text-status-healthy-text' : 'text-status-danger-text'}`}>
                    ({prediction.dayChangePct >= 0 ? '+' : ''}{prediction.dayChangePct}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Model Confidence Rating */}
            <div className="text-right border-t md:border-t-0 md:border-l border-border-subtle pt-3 md:pt-0 md:pl-6 w-full md:w-auto">
              <div className="text-xs text-fin-muted font-semibold">Model Confidence Score</div>
              <div className="text-2xl font-bold text-fin-charcoal font-mono">{prediction.confidenceScorePct}%</div>
              <div className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Signal Convergence High
              </div>
            </div>
          </div>

          {/* Interactive Price Trajectory Graph */}
          <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-fin-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-fin-charcoal text-base flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-600" />
                  <span>Forecast Price Corridor Trajectory ({timeframe})</span>
                </h4>
                <p className="text-xs text-fin-muted">Predicted Bull Target, Base Scenario, and Bear Floor corridor</p>
              </div>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E2DA" />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} domain={['auto', 'auto']} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFFFFF', borderRadius: '12px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="bull" name="Bull Target" stroke="#10B981" strokeWidth={2} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="price" name="Base Forecast" stroke="#0F172A" strokeWidth={3} />
                  <Line type="monotone" dataKey="bear" name="Bear Risk Floor" stroke="#EF4444" strokeWidth={2} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Probability Gauge & Target Corridor Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Probability Gauge Panel (5 cols) */}
            <div className="lg:col-span-5 bg-surface p-6 rounded-2xl border border-border-subtle shadow-fin-card space-y-4">
              <h4 className="font-bold text-fin-charcoal text-base border-b border-border-subtle pb-3">
                Directional Probability Breakdown
              </h4>

              {/* Bullish Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-status-healthy-text flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Bullish Expansion
                  </span>
                  <span className="font-bold font-mono text-status-healthy-text">{prediction.bullishProbabilityPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-subtle rounded-full overflow-hidden border border-border-subtle">
                  <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${prediction.bullishProbabilityPct}%` }} />
                </div>
              </div>

              {/* Bearish Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-status-danger-text flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" /> Bearish Retracement
                  </span>
                  <span className="font-bold font-mono text-status-danger-text">{prediction.bearishProbabilityPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-surface-subtle rounded-full overflow-hidden border border-border-subtle">
                  <div className="h-full bg-rose-600 rounded-full transition-all duration-500" style={{ width: `${prediction.bearishProbabilityPct}%` }} />
                </div>
              </div>

              {/* Neutral Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-fin-muted">Sideways Consolidation</span>
                  <span className="font-bold font-mono text-fin-charcoal">{prediction.neutralProbabilityPct}%</span>
                </div>
                <div className="w-full h-2 bg-surface-subtle rounded-full overflow-hidden border border-border-subtle">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: `${prediction.neutralProbabilityPct}%` }} />
                </div>
              </div>

              <div className="bg-surface-subtle p-3.5 rounded-xl border border-border-subtle text-xs text-fin-body leading-relaxed mt-2">
                <span className="font-bold text-fin-charcoal">Model Summary: </span>{prediction.summaryInsight}
              </div>
            </div>

            {/* Price Target Corridor Cards (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Bull Target */}
                <div className="bg-surface p-4 rounded-2xl border border-status-healthy-border bg-emerald-50/30 shadow-fin-sm space-y-1">
                  <div className="text-xs font-semibold text-status-healthy-text">Bull Target</div>
                  <div className="text-xl font-bold font-mono text-fin-charcoal">₹{prediction.targets.bullTarget}</div>
                  <div className="text-xs font-bold text-status-healthy-text">
                    +{prediction.targets.bullGainPct}% Upside
                  </div>
                </div>

                {/* Base Target */}
                <div className="bg-surface p-4 rounded-2xl border border-border-subtle shadow-fin-sm space-y-1">
                  <div className="text-xs font-semibold text-fin-muted">Base Target</div>
                  <div className="text-xl font-bold font-mono text-fin-charcoal">₹{prediction.targets.baseTarget}</div>
                  <div className="text-xs font-bold text-fin-body">
                    {prediction.targets.baseGainPct >= 0 ? '+' : ''}{prediction.targets.baseGainPct}% Median
                  </div>
                </div>

                {/* Bear Target */}
                <div className="bg-surface p-4 rounded-2xl border border-status-danger-border bg-rose-50/30 shadow-fin-sm space-y-1">
                  <div className="text-xs font-semibold text-status-danger-text">Bear Floor Risk</div>
                  <div className="text-xl font-bold font-mono text-fin-charcoal">₹{prediction.targets.bearTarget}</div>
                  <div className="text-xs font-bold text-status-danger-text">
                    {prediction.targets.bearLossPct}% Downside
                  </div>
                </div>

              </div>

              {/* Technical Drivers */}
              <div className="bg-surface p-5 rounded-2xl border border-border-subtle shadow-fin-card space-y-3">
                <h4 className="font-bold text-fin-charcoal text-sm">
                  Technical Factors & Convergence Drivers
                </h4>

                <div className="space-y-2">
                  {prediction.predictiveFactors.map((factor, i) => (
                    <div key={i} className="p-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-fin-charcoal">{factor.name}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] ${
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
