'use client';

import React from 'react';
import { X, ShieldAlert, ArrowRight, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { StructuredLLMResponse } from '@/lib/llmService';

interface RiskExplanationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: StructuredLLMResponse | null;
  isLoading?: boolean;
}

export const RiskExplanationDrawer: React.FC<RiskExplanationDrawerProps> = ({
  isOpen,
  onClose,
  explanation,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-xl bg-surface h-full shadow-fin-lg flex flex-col border-l border-border-subtle overflow-y-auto">
        
        {/* Header */}
        <div className="p-5 border-b border-border-subtle flex items-center justify-between sticky top-0 bg-surface z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-surface-subtle border border-border-subtle flex items-center justify-center text-fin-charcoal">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-fin-charcoal text-base">Risk Intelligence Analysis</h2>
              <p className="text-xs text-fin-muted">Structured position & behavioral breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-fin-muted hover:text-fin-charcoal hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-fin-muted text-sm flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-fin-charcoal border-t-transparent rounded-full animate-spin" />
              <span>Synthesizing position & behavioral data...</span>
            </div>
          ) : explanation ? (
            <>
              {/* Primary Headline */}
              <div className="bg-surface-subtle p-4 rounded-xl border border-border-subtle">
                <div className="text-xs font-semibold uppercase tracking-wider text-fin-muted mb-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-700" />
                  <span>Position Risk Headline</span>
                </div>
                <h3 className="font-semibold text-fin-charcoal text-base leading-snug">
                  {explanation.headline}
                </h3>
              </div>

              {/* Concise Explanation */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-fin-muted mb-2">
                  Why this matters →
                </div>
                <p className="text-sm text-fin-body leading-relaxed bg-surface p-4 rounded-xl border border-border-subtle shadow-fin-sm">
                  {explanation.conciseExplanation}
                </p>
              </div>

              {/* Primary Risk Factors */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-fin-muted mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-status-warning-text" />
                  <span>Primary Risk Factors</span>
                </div>
                <div className="space-y-2">
                  {explanation.primaryRisks.map((risk, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-status-warning-bg border border-status-warning-border text-xs text-status-warning-text font-medium leading-relaxed">
                      <span className="font-bold">•</span>
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safer Alternatives */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-fin-muted mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-status-healthy-text" />
                  <span>Safer Alternatives</span>
                </div>
                <div className="space-y-2">
                  {explanation.saferAlternatives.map((alt, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-status-healthy-bg border border-status-healthy-border text-xs text-status-healthy-text font-medium leading-relaxed">
                      <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{alt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Behavioral Observation */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-fin-muted mb-2">
                  Behavioral Signal Observation
                </div>
                <div className="p-3.5 rounded-lg bg-surface-subtle border border-border-subtle text-xs text-fin-body leading-relaxed">
                  {explanation.behavioralObservation}
                </div>
              </div>

              {/* Footer Metadata */}
              <div className="pt-4 border-t border-border-subtle text-[11px] text-fin-muted flex items-center justify-between">
                <span>Engine: {explanation.provider}</span>
                <span>{explanation.isFallback ? 'Deterministic Financial Calculation' : 'LLM Analysis'}</span>
              </div>
            </>
          ) : null}
        </div>

      </div>
    </div>
  );
};
