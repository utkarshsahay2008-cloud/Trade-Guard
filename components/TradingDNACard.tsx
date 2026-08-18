'use client';

import React, { useState, useEffect } from 'react';
import { Dna, AlertCircle, TrendingUp, ShieldAlert, Award, Activity } from 'lucide-react';
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
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="bg-surface p-6 rounded-xl border border-border-subtle shadow-fin-card">
        <h2 className="text-xl font-semibold text-fin-charcoal">Trading DNA & Behavioral Intelligence</h2>
        <p className="text-xs text-fin-muted mt-1">
          Algorithmic quantification of psychological triggers (Revenge trading, FOMO, overtrading, size escalation) derived from stored execution logs.
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-fin-muted text-sm flex flex-col items-center gap-3 bg-surface rounded-xl border border-border-subtle">
          <div className="w-6 h-6 border-2 border-fin-charcoal border-t-transparent rounded-full animate-spin" />
          <span>Analyzing historical trade logs...</span>
        </div>
      ) : analysis ? (
        <>
          {/* Top Archetype Banner */}
          <div className="bg-surface p-6 rounded-xl border border-border-subtle shadow-fin-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-fin-charcoal text-surface flex items-center justify-center font-bold shadow-fin-sm">
                <Dna className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs text-fin-muted uppercase tracking-wider font-semibold">Primary Behavioral Archetype</div>
                <h3 className="text-lg font-bold text-fin-charcoal">{analysis.primaryArchetype}</h3>
                <p className="text-xs text-fin-body mt-0.5">{analysis.dominantTrigger}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border-subtle pt-3 md:pt-0 md:pl-6">
              <div>
                <div className="text-xs text-fin-muted font-medium">Historical Trades</div>
                <div className="text-sm font-bold text-fin-charcoal">{tradeCount} Executed</div>
              </div>
              <div>
                <div className="text-xs text-fin-muted font-medium">Win Rate</div>
                <div className="text-sm font-bold text-status-healthy-text">{winRate}%</div>
              </div>
              <div>
                <div className="text-xs text-fin-muted font-medium">Avg Position Size</div>
                <div className="text-sm font-bold text-fin-charcoal">{analysis.historicalAvgQty} units</div>
              </div>
            </div>
          </div>

          {/* Behavioral Metric Cards (5 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Revenge Score */}
            <div className="bg-surface p-4 rounded-xl border border-border-subtle shadow-fin-card space-y-2">
              <div className="flex justify-between items-center text-xs text-fin-muted">
                <span className="font-medium">Revenge Score</span>
                <ShieldAlert className="w-4 h-4 text-status-danger-text" />
              </div>
              <div className="text-2xl font-bold text-fin-charcoal">{analysis.revengeScore} <span className="text-xs font-normal text-fin-muted">/ 100</span></div>
              <div className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getScoreColor(analysis.revengeScore)}`}>
                {analysis.revengeScore >= 70 ? 'High Revenge Risk' : analysis.revengeScore >= 45 ? 'Moderate' : 'Low'}
              </div>
            </div>

            {/* FOMO Score */}
            <div className="bg-surface p-4 rounded-xl border border-border-subtle shadow-fin-card space-y-2">
              <div className="flex justify-between items-center text-xs text-fin-muted">
                <span className="font-medium">FOMO Score</span>
                <TrendingUp className="w-4 h-4 text-status-warning-text" />
              </div>
              <div className="text-2xl font-bold text-fin-charcoal">{analysis.fomoScore} <span className="text-xs font-normal text-fin-muted">/ 100</span></div>
              <div className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getScoreColor(analysis.fomoScore)}`}>
                {analysis.fomoScore >= 65 ? 'High Chase Risk' : 'Controlled'}
              </div>
            </div>

            {/* Overtrading Score */}
            <div className="bg-surface p-4 rounded-xl border border-border-subtle shadow-fin-card space-y-2">
              <div className="flex justify-between items-center text-xs text-fin-muted">
                <span className="font-medium">Overtrading</span>
                <Activity className="w-4 h-4 text-fin-muted" />
              </div>
              <div className="text-2xl font-bold text-fin-charcoal">{analysis.overtradingScore} <span className="text-xs font-normal text-fin-muted">/ 100</span></div>
              <div className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getScoreColor(analysis.overtradingScore)}`}>
                {analysis.overtradingScore >= 65 ? 'Excessive Velocity' : 'Normal Pace'}
              </div>
            </div>

            {/* Risk Escalation Score */}
            <div className="bg-surface p-4 rounded-xl border border-border-subtle shadow-fin-card space-y-2">
              <div className="flex justify-between items-center text-xs text-fin-muted">
                <span className="font-medium">Risk Escalation</span>
                <AlertCircle className="w-4 h-4 text-status-danger-text" />
              </div>
              <div className="text-2xl font-bold text-fin-charcoal">{analysis.riskEscalationScore} <span className="text-xs font-normal text-fin-muted">/ 100</span></div>
              <div className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getScoreColor(analysis.riskEscalationScore)}`}>
                {analysis.riskEscalationScore >= 70 ? 'Drawdown Escalation' : 'Controlled'}
              </div>
            </div>

            {/* Position Anomaly Score */}
            <div className="bg-surface p-4 rounded-xl border border-border-subtle shadow-fin-card space-y-2">
              <div className="flex justify-between items-center text-xs text-fin-muted">
                <span className="font-medium">Position Anomaly</span>
                <Award className="w-4 h-4 text-fin-muted" />
              </div>
              <div className="text-2xl font-bold text-fin-charcoal">{analysis.positionAnomalyScore} <span className="text-xs font-normal text-fin-muted">/ 100</span></div>
              <div className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getScoreColor(analysis.positionAnomalyScore)}`}>
                {analysis.positionAnomalyScore >= 70 ? 'Size Anomaly' : 'Standard Sizing'}
              </div>
            </div>

          </div>

          {/* Behavioral Signals Log List */}
          <div className="bg-surface p-6 rounded-xl border border-border-subtle shadow-fin-card">
            <h4 className="font-semibold text-fin-charcoal text-base mb-3">
              Identified Behavioral Pattern Signals
            </h4>
            <div className="space-y-2.5">
              {analysis.behavioralSignals.map((signal, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-fin-body leading-relaxed">
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
