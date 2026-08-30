'use client';

import React, { useState, useEffect } from 'react';
import { Dna, AlertCircle, TrendingUp, ShieldAlert, Award, Activity, Brain, CheckCircle2, Flame } from 'lucide-react';
import { BehavioralAnalysisResult } from '@/lib/behavioralEngine';

export const TradingDNACard: React.FC = () => {
  const [analysis, setAnalysis] = useState<BehavioralAnalysisResult | null>(null);
  const [winRate, setWinRate] = useState<number>(0);
  const [tradeCount, setTradeCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBehavioralDna();
  }, []);

  const fetchBehavioralDna = async () => {
    try {
      setIsLoading(true);
      const resp = await fetch('/api/behavioral-dna');
      const data = await resp.json();
      if (data.success) {
        setAnalysis(data.behavioralAnalysis);
        setWinRate(data.winRate);
        setTradeCount(data.tradeCount);
      }
    } catch (e) {
      console.error('Failed to fetch behavioral DNA:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-status-danger-text bg-status-danger-bg border-status-danger-border';
    if (score >= 45) return 'text-status-warning-text bg-status-warning-bg border-status-warning-border';
    return 'text-status-healthy-text bg-status-healthy-bg border-status-healthy-border';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-fin-card">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-fin-charcoal">Trading DNA & Psychological Risk Intelligence</h2>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
            BEHAVIORAL ENGINE
          </span>
        </div>
        <p className="text-xs text-fin-muted mt-1">
          Quantitative detection of revenge trading, FOMO entries, overtrading velocity, and sizing escalation patterns
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-fin-muted text-sm flex flex-col items-center gap-3 bg-surface rounded-2xl border border-border-subtle">
          <div className="w-6 h-6 border-2 border-fin-charcoal border-t-transparent rounded-full animate-spin" />
          <span>Analyzing trade history logs for psychological patterns...</span>
        </div>
      ) : analysis ? (
        <>
          {/* Top Archetype Banner */}
          <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-fin-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-fin-charcoal text-surface flex items-center justify-center font-bold shadow-fin-sm border border-slate-700">
                <Brain className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-[10px] text-fin-muted uppercase tracking-wider font-bold">Primary Psychological Archetype</div>
                <h3 className="text-lg font-bold text-fin-charcoal">{analysis.primaryArchetype}</h3>
                <p className="text-xs text-fin-body font-medium mt-0.5">{analysis.dominantTrigger}</p>
              </div>
            </div>

            <div className="flex items-center gap-5 border-t md:border-t-0 md:border-l border-border-subtle pt-3 md:pt-0 md:pl-6">
              <div>
                <div className="text-xs text-fin-muted font-semibold">Trade History</div>
                <div className="text-sm font-bold font-mono text-fin-charcoal">{tradeCount} Trades</div>
              </div>
              <div>
                <div className="text-xs text-fin-muted font-semibold">Win Rate</div>
                <div className="text-sm font-bold font-mono text-status-healthy-text">{winRate}%</div>
              </div>
              <div>
                <div className="text-xs text-fin-muted font-semibold">Avg Position Size</div>
                <div className="text-sm font-bold font-mono text-fin-charcoal">{analysis.historicalAvgQty} units</div>
              </div>
            </div>
          </div>

          {/* Behavioral Metric Cards (5 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Revenge Score */}
            <div className="bg-surface p-4 rounded-2xl border border-border-subtle shadow-fin-card space-y-2 fin-card-hover">
              <div className="flex justify-between items-center text-xs text-fin-muted">
                <span className="font-semibold">Revenge Score</span>
                <Flame className="w-4 h-4 text-status-danger-text" />
              </div>
              <div className="text-2xl font-bold font-mono text-fin-charcoal">{analysis.revengeScore} <span className="text-xs font-normal text-fin-muted">/ 100</span></div>
              <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getScoreColor(analysis.revengeScore)}`}>
                {analysis.revengeScore >= 70 ? 'High Revenge Risk' : analysis.revengeScore >= 45 ? 'Moderate' : 'Low Risk'}
              </div>
            </div>

            {/* FOMO Score */}
            <div className="bg-surface p-4 rounded-2xl border border-border-subtle shadow-fin-card space-y-2 fin-card-hover">
              <div className="flex justify-between items-center text-xs text-fin-muted">
                <span className="font-semibold">FOMO Score</span>
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-fin-charcoal">{analysis.fomoScore} <span className="text-xs font-normal text-fin-muted">/ 100</span></div>
              <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getScoreColor(analysis.fomoScore)}`}>
                {analysis.fomoScore >= 65 ? 'High Chase Risk' : 'Controlled'}
              </div>
            </div>

            {/* Overtrading Score */}
            <div className="bg-surface p-4 rounded-2xl border border-border-subtle shadow-fin-card space-y-2 fin-card-hover">
              <div className="flex justify-between items-center text-xs text-fin-muted">
                <span className="font-semibold">Overtrading</span>
                <Activity className="w-4 h-4 text-fin-muted" />
              </div>
              <div className="text-2xl font-bold font-mono text-fin-charcoal">{analysis.overtradingScore} <span className="text-xs font-normal text-fin-muted">/ 100</span></div>
              <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getScoreColor(analysis.overtradingScore)}`}>
                {analysis.overtradingScore >= 65 ? 'Excessive Pace' : 'Normal Velocity'}
              </div>
            </div>

            {/* Risk Escalation Score */}
            <div className="bg-surface p-4 rounded-2xl border border-border-subtle shadow-fin-card space-y-2 fin-card-hover">
              <div className="flex justify-between items-center text-xs text-fin-muted">
                <span className="font-semibold">Risk Escalation</span>
                <AlertCircle className="w-4 h-4 text-status-danger-text" />
              </div>
              <div className="text-2xl font-bold font-mono text-fin-charcoal">{analysis.riskEscalationScore} <span className="text-xs font-normal text-fin-muted">/ 100</span></div>
              <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getScoreColor(analysis.riskEscalationScore)}`}>
                {analysis.riskEscalationScore >= 70 ? 'Drawdown Escalation' : 'Controlled'}
              </div>
            </div>

            {/* Position Anomaly Score */}
            <div className="bg-surface p-4 rounded-2xl border border-border-subtle shadow-fin-card space-y-2 fin-card-hover">
              <div className="flex justify-between items-center text-xs text-fin-muted">
                <span className="font-semibold">Position Anomaly</span>
                <Award className="w-4 h-4 text-fin-muted" />
              </div>
              <div className="text-2xl font-bold font-mono text-fin-charcoal">{analysis.positionAnomalyScore} <span className="text-xs font-normal text-fin-muted">/ 100</span></div>
              <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getScoreColor(analysis.positionAnomalyScore)}`}>
                {analysis.positionAnomalyScore >= 70 ? 'Size Anomaly' : 'Standard Sizing'}
              </div>
            </div>

          </div>

          {/* Behavioral Signals Log List */}
          <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-fin-card space-y-3">
            <h4 className="font-bold text-fin-charcoal text-base">
              Identified Behavioral Pattern Signals
            </h4>
            <div className="space-y-2.5">
              {analysis.behavioralSignals.map((signal, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-fin-body leading-relaxed font-medium">
                  <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

    </div>
  );
};
