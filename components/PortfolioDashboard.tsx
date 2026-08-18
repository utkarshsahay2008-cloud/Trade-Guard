'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, ExternalLink } from 'lucide-react';
import { Portfolio, Position, RiskAlert } from '@/lib/database';
import { RiskExplanationDrawer } from './RiskExplanationDrawer';
import { StructuredLLMResponse } from '@/lib/llmService';

interface PortfolioDashboardProps {
  portfolio: Portfolio | null;
  positions: Position[];
  riskAlerts: RiskAlert[];
  onDismissAlert?: (alertId: string) => void;
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  portfolio,
  positions,
  riskAlerts,
  onDismissAlert,
}) => {
  const [selectedAlert, setSelectedAlert] = useState<RiskAlert | null>(null);
  const [explanation, setExplanation] = useState<StructuredLLMResponse | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!portfolio) return null;

  const handleAlertClick = (alert: RiskAlert) => {
    setSelectedAlert(alert);
    setExplanation({
      headline: alert.title,
      conciseExplanation: alert.explanation,
      primaryRisks: [alert.whyItMatters],
      saferAlternatives: [alert.suggestedAction],
      behavioralObservation: `Triggered by ${alert.category} alert monitor.`,
      isFallback: true,
      provider: 'Trade-Guard Risk Alert System',
    });
    setIsDrawerOpen(true);
  };

  const activeAlerts = riskAlerts.filter(a => !a.isDismissed);

  return (
    <div className="space-y-6">
      
      {/* Portfolio Quick Stats Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Capital Balance */}
        <div className="bg-surface p-5 rounded-xl border border-border-subtle shadow-fin-card space-y-1">
          <div className="text-xs font-medium text-fin-muted">Total Capital Balance</div>
          <div className="text-2xl font-bold text-fin-charcoal">₹{portfolio.totalBalance.toLocaleString()}</div>
          <div className="text-[11px] text-fin-muted flex items-center gap-1 pt-1">
            <span>Cash: ₹{portfolio.availableCash.toLocaleString()}</span>
            <span>•</span>
            <span>Margin: ₹{portfolio.allocatedMargin.toLocaleString()}</span>
          </div>
        </div>

        {/* Daily P&L */}
        <div className="bg-surface p-5 rounded-xl border border-border-subtle shadow-fin-card space-y-1">
          <div className="text-xs font-medium text-fin-muted">Daily Realized P&L</div>
          <div className={`text-2xl font-bold ${portfolio.dailyPnl >= 0 ? 'text-status-healthy-text' : 'text-status-danger-text'}`}>
            {portfolio.dailyPnl >= 0 ? '+' : ''}₹{portfolio.dailyPnl.toLocaleString()}
          </div>
          <div className="text-[11px] text-fin-muted pt-1">
            Realized Net: ₹{portfolio.realizedPnl.toLocaleString()}
          </div>
        </div>

        {/* Peak Balance & Drawdown */}
        <div className="bg-surface p-5 rounded-xl border border-border-subtle shadow-fin-card space-y-1">
          <div className="text-xs font-medium text-fin-muted">Max Account Drawdown</div>
          <div className="text-2xl font-bold text-fin-charcoal">{portfolio.maxDrawdownPct}%</div>
          <div className="text-[11px] text-fin-muted pt-1">
            Peak Capital: ₹{portfolio.peakBalance.toLocaleString()}
          </div>
        </div>

        {/* Open Positions Risk Count */}
        <div className="bg-surface p-5 rounded-xl border border-border-subtle shadow-fin-card space-y-1">
          <div className="text-xs font-medium text-fin-muted">Active Positions Risk</div>
          <div className="text-2xl font-bold text-fin-charcoal">{positions.length} Open</div>
          <div className="text-[11px] text-status-warning-text font-medium pt-1">
            {activeAlerts.length} Active System Alerts
          </div>
        </div>

      </div>

      {/* Active System Risk Alerts (Clickable List as required by #3) */}
      {activeAlerts.length > 0 && (
        <div className="bg-surface p-6 rounded-xl border border-border-subtle shadow-fin-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-fin-charcoal text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-status-warning-text" />
              <span>Active System Risk Alerts ({activeAlerts.length})</span>
            </h3>
            <span className="text-xs text-fin-muted">Click any alert card for detailed explanation</span>
          </div>

          <div className="space-y-2.5">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => handleAlertClick(alert)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  alert.severity === 'DANGER'
                    ? 'bg-status-danger-bg border-status-danger-border hover:border-red-400'
                    : 'bg-status-warning-bg border-status-warning-border hover:border-amber-400'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-fin-charcoal">{alert.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-surface text-fin-body border border-border-subtle">
                      {alert.category}
                    </span>
                  </div>
                  <p className="text-xs text-fin-body leading-relaxed">{alert.explanation}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <span className="text-xs font-semibold text-fin-charcoal hover:underline flex items-center gap-1">
                    Explain <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Open Positions Table */}
      <div className="bg-surface p-6 rounded-xl border border-border-subtle shadow-fin-card space-y-4">
        <h3 className="font-semibold text-fin-charcoal text-base">
          Active Portfolio Positions ({positions.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-fin-muted font-medium">
                <th className="pb-3">Symbol</th>
                <th className="pb-3">Direction</th>
                <th className="pb-3">Quantity</th>
                <th className="pb-3">Entry Price</th>
                <th className="pb-3">Current Price</th>
                <th className="pb-3">Stop Loss</th>
                <th className="pb-3">Take Profit</th>
                <th className="pb-3 text-right">Unrealized P&L</th>
                <th className="pb-3 text-right">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {positions.map((pos) => (
                <tr key={pos.id} className="hover:bg-surface-hover">
                  <td className="py-3 font-semibold text-fin-charcoal">{pos.symbol}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${pos.direction === 'LONG' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {pos.direction} {pos.leverage > 1 ? `(${pos.leverage}x)` : ''}
                    </span>
                  </td>
                  <td className="py-3 font-mono">{pos.quantity} units</td>
                  <td className="py-3 font-mono">₹{pos.entryPrice}</td>
                  <td className="py-3 font-mono">₹{pos.currentPrice}</td>
                  <td className="py-3 font-mono text-status-danger-text">₹{pos.stopLoss}</td>
                  <td className="py-3 font-mono text-status-healthy-text">₹{pos.takeProfit}</td>
                  <td className={`py-3 text-right font-semibold font-mono ${pos.unrealizedPnl >= 0 ? 'text-status-healthy-text' : 'text-status-danger-text'}`}>
                    {pos.unrealizedPnl >= 0 ? '+' : ''}₹{pos.unrealizedPnl.toLocaleString()} ({pos.unrealizedPnlPct}%)
                  </td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${pos.riskScore >= 70 ? 'bg-status-danger-bg text-status-danger-text border-status-danger-border' : 'bg-status-warning-bg text-status-warning-text border-status-warning-border'}`}>
                      {pos.riskScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explanation Drawer */}
      <RiskExplanationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        explanation={explanation}
      />
    </div>
  );
};
