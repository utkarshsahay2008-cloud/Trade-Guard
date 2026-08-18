'use client';

import React from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { LossShieldResult } from '@/lib/lossShieldEngine';

interface LossShieldCardProps {
  lossShield: LossShieldResult | null;
  onApplySaferPosition: (saferQty: number) => void;
  isLoading?: boolean;
}

export const LossShieldCard: React.FC<LossShieldCardProps> = ({
  lossShield,
  onApplySaferPosition,
  isLoading = false,
}) => {
  if (!lossShield) return null;

  const {
    currentQuantity,
    saferQuantity,
    targetRiskPct,
    maxLossBefore,
    maxLossAfter,
    lossReductionAmount,
    lossReductionPct,
    causeEffectDiffs,
    recommendationReason,
  } = lossShield;

  const isSaferAvailable = saferQuantity < currentQuantity;

  return (
    <div className="fin-card p-5 border-l-4 border-l-emerald-600 bg-surface">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-fin-charcoal text-base">Loss Shield Optimizer</h3>
            <p className="text-xs text-fin-muted">Target Max Risk: {targetRiskPct}% of Account Capital</p>
          </div>
        </div>

        {isSaferAvailable ? (
          <span className="fin-badge bg-status-healthy-bg text-status-healthy-text border border-status-healthy-border">
            Safer Position Ready (-{lossReductionPct}%)
          </span>
        ) : (
          <span className="fin-badge bg-surface-subtle text-fin-muted border border-border-subtle flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Optimal Position Size
          </span>
        )}
      </div>

      <p className="text-xs text-fin-body mb-5 leading-relaxed bg-surface-subtle p-3 rounded-lg border border-border-subtle">
        {recommendationReason}
      </p>

      {/* Cause → Effect Visual Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {causeEffectDiffs.map((diff, i) => (
          <div key={i} className="p-3 rounded-lg bg-surface border border-border-subtle shadow-fin-sm">
            <div className="text-[11px] font-medium text-fin-muted mb-1">{diff.metric}</div>
            <div className="flex items-center gap-1.5 text-xs text-fin-charcoal mb-1">
              <span className="line-through text-fin-light">{diff.beforeValue}</span>
              <ArrowRight className="w-3.5 h-3.5 text-fin-muted flex-shrink-0" />
              <span className="font-semibold">{diff.afterValue}</span>
            </div>
            <div className={`text-[11px] font-medium ${diff.isImprovement ? 'text-status-healthy-text' : 'text-fin-muted'}`}>
              {diff.changeLabel}
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      {isSaferAvailable && (
        <button
          onClick={() => onApplySaferPosition(saferQuantity)}
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-2.5 px-4 rounded-lg shadow-fin-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Apply Safer Position ({saferQuantity} units)</span>
        </button>
      )}
    </div>
  );
};
