'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, ExternalLink, Activity, PieChart as PieIcon, Layers } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
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
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | 'ALL'>('1M');

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

  // Dynamic Equity Curve Generator based on selected timeframe
  const getEquityCurveData = (tf: '1W' | '1M' | '3M' | 'ALL') => {
    const currentVal = portfolio.totalBalance;
    if (tf === '1W') {
      return [
        { date: 'Mon', balance: currentVal - 1400, pnl: -600 },
        { date: 'Tue', balance: currentVal - 2200, pnl: -800 },
        { date: 'Wed', balance: currentVal - 900, pnl: 1300 },
        { date: 'Thu', balance: currentVal - 1420, pnl: -520 },
        { date: 'Fri', balance: currentVal, pnl: portfolio.dailyPnl },
      ];
    }
    if (tf === '1M') {
      return [
        { date: 'Aug 01', balance: currentVal - 8000, pnl: -800 },
        { date: 'Aug 05', balance: currentVal - 5500, pnl: 2500 },
        { date: 'Aug 10', balance: currentVal - 6800, pnl: -1300 },
        { date: 'Aug 15', balance: currentVal - 2200, pnl: 4600 },
        { date: 'Aug 20', balance: currentVal - 3900, pnl: -1700 },
        { date: 'Aug 25', balance: currentVal - 600, pnl: 3300 },
        { date: 'Aug 30', balance: currentVal, pnl: portfolio.dailyPnl },
      ];
    }
    if (tf === '3M') {
      return [
        { date: 'Jun', balance: currentVal - 18000, pnl: 3200 },
        { date: 'Jul', balance: currentVal - 10000, pnl: 8000 },
        { date: 'Aug', balance: currentVal, pnl: portfolio.dailyPnl },
      ];
    }
    // ALL
    return [
      { date: 'Q1', balance: 80000, pnl: 5000 },
      { date: 'Q2', balance: 88000, pnl: 8000 },
      { date: 'Q3', balance: currentVal - 5000, pnl: 7000 },
      { date: 'Current', balance: currentVal, pnl: portfolio.dailyPnl },
    ];
  };

  const equityCurveData = getEquityCurveData(timeframe);

  // Asset allocation breakdown calculation
  const totalExposure = positions.reduce((sum, p) => sum + (p.quantity * p.currentPrice), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner Hero */}
      <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-fin-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-fin-charcoal">Portfolio Overview & Safety Command Center</h2>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              LIVE MONITORING
            </span>
          </div>
          <p className="text-xs text-fin-muted mt-1">
            Real-time capital tracking, automated position allocation, and multi-factor risk detection
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex text-xs font-semibold">
            {(['1W', '1M', '3M', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  timeframe === tf
                    ? 'bg-emerald-600 text-white shadow-fin-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Quick Stats Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Capital Balance */}
        <div className="bg-surface p-5 rounded-2xl border border-border-subtle shadow-fin-card fin-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fin-muted">Total Account Equity</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-fin-charcoal font-mono">₹{portfolio.totalBalance.toLocaleString()}</div>
          <div className="text-[11px] text-fin-muted flex items-center justify-between pt-1 border-t border-border-subtle font-medium">
            <span>Cash: ₹{portfolio.availableCash.toLocaleString()}</span>
            <span>Margin: ₹{portfolio.allocatedMargin.toLocaleString()}</span>
          </div>
        </div>

        {/* Daily P&L */}
        <div className="bg-surface p-5 rounded-2xl border border-border-subtle shadow-fin-card fin-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fin-muted">Daily Realized P&L</span>
            {portfolio.dailyPnl >= 0 ? <ArrowUpRight className="w-4 h-4 text-emerald-600" /> : <ArrowDownRight className="w-4 h-4 text-rose-600" />}
          </div>
          <div className={`text-2xl font-bold font-mono ${portfolio.dailyPnl >= 0 ? 'text-status-healthy-text' : 'text-status-danger-text'}`}>
            {portfolio.dailyPnl >= 0 ? '+' : ''}₹{portfolio.dailyPnl.toLocaleString()}
          </div>
          <div className="text-[11px] text-fin-muted pt-1 border-t border-border-subtle font-medium">
            Total Net Realized: ₹{portfolio.realizedPnl.toLocaleString()}
          </div>
        </div>

        {/* Peak Balance & Drawdown */}
        <div className="bg-surface p-5 rounded-2xl border border-border-subtle shadow-fin-card fin-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fin-muted">Max Account Drawdown</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-fin-charcoal font-mono">{portfolio.maxDrawdownPct}%</div>
          <div className="text-[11px] text-fin-muted pt-1 border-t border-border-subtle font-medium">
            Peak Balance: ₹{portfolio.peakBalance.toLocaleString()}
          </div>
        </div>

        {/* Open Positions Risk Count */}
        <div className="bg-surface p-5 rounded-2xl border border-border-subtle shadow-fin-card fin-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fin-muted">Active Open Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-fin-charcoal font-mono">{positions.length} Open Positions</div>
          <div className="text-[11px] text-status-warning-text font-semibold pt-1 border-t border-border-subtle flex items-center justify-between">
            <span>{activeAlerts.length} System Risk Alerts</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>
        </div>

      </div>

      {/* Interactive Equity Growth Chart & Position Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Equity Curve Chart (8 cols) */}
        <div className="lg:col-span-8 bg-surface p-6 rounded-2xl border border-border-subtle shadow-fin-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-fin-charcoal text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Account Equity Performance ({timeframe})</span>
              </h3>
              <p className="text-xs text-fin-muted">Cumulative portfolio value growth over time</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              +8.0% Total Equity Return
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityCurveData}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E2DA" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Portfolio Equity']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFFFFF', borderRadius: '12px', fontSize: '12px', border: 'none' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#equityGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Position Capital Allocation Bar (4 cols) */}
        <div className="lg:col-span-4 bg-surface p-6 rounded-2xl border border-border-subtle shadow-fin-card space-y-4">
          <div>
            <h3 className="font-bold text-fin-charcoal text-base flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-fin-charcoal" />
              <span>Capital Allocation</span>
            </h3>
            <p className="text-xs text-fin-muted">Exposure by active asset holding</p>
          </div>

          <div className="space-y-3 pt-2">
            {positions.map((pos) => {
              const posVal = pos.quantity * pos.currentPrice;
              const pct = totalExposure > 0 ? Math.round((posVal / totalExposure) * 100) : 0;
              return (
                <div key={pos.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-fin-charcoal">{pos.symbol} ({pos.direction})</span>
                    <span className="text-fin-muted font-mono">₹{posVal.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-surface-subtle rounded-full overflow-hidden border border-border-subtle">
                    <div
                      className={`h-full rounded-full ${pos.direction === 'LONG' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-surface-subtle rounded-xl border border-border-subtle text-xs text-fin-muted leading-relaxed mt-4 font-medium">
            <span className="font-bold text-fin-charcoal">Diversification Insight:</span> Portfolio exposure is concentrated in NSE India swing assets with high risk score limits.
          </div>
        </div>

      </div>

      {/* Active System Risk Alerts (Clickable List) */}
      {activeAlerts.length > 0 && (
        <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-fin-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-fin-charcoal text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Active System Risk Alerts ({activeAlerts.length})</span>
            </h3>
            <span className="text-xs text-fin-muted">Click any alert card for detailed AI explanation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => handleAlertClick(alert)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-fin-sm hover:scale-[1.01] ${
                  alert.severity === 'DANGER'
                    ? 'bg-status-danger-bg border-status-danger-border hover:border-red-400'
                    : 'bg-status-warning-bg border-status-warning-border hover:border-amber-400'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-fin-charcoal">{alert.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-surface text-fin-body border border-border-subtle">
                      {alert.category}
                    </span>
                  </div>
                  <p className="text-xs text-fin-body leading-relaxed">{alert.explanation}</p>
                </div>

                <div className="flex items-center justify-between border-t border-black/5 pt-2 text-xs font-bold text-fin-charcoal">
                  <span>Action: {alert.suggestedAction}</span>
                  <span className="hover:underline flex items-center gap-1 text-emerald-700">
                    Explain with AI <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Open Positions Table */}
      <div className="bg-surface p-6 rounded-2xl border border-border-subtle shadow-fin-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-fin-charcoal text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-fin-charcoal" />
            <span>Active Portfolio Positions ({positions.length})</span>
          </h3>
          <span className="text-xs text-fin-muted">Realtime price updates & risk score monitor</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-fin-muted font-semibold">
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
                <tr key={pos.id} className="hover:bg-surface-hover transition-colors">
                  <td className="py-3 font-bold text-fin-charcoal">{pos.symbol}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${pos.direction === 'LONG' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {pos.direction} {pos.leverage > 1 ? `(${pos.leverage}x)` : ''}
                    </span>
                  </td>
                  <td className="py-3 font-mono">{pos.quantity} units</td>
                  <td className="py-3 font-mono">₹{pos.entryPrice}</td>
                  <td className="py-3 font-mono">₹{pos.currentPrice}</td>
                  <td className="py-3 font-mono text-status-danger-text font-medium">₹{pos.stopLoss}</td>
                  <td className="py-3 font-mono text-status-healthy-text font-medium">₹{pos.takeProfit}</td>
                  <td className={`py-3 text-right font-bold font-mono ${pos.unrealizedPnl >= 0 ? 'text-status-healthy-text' : 'text-status-danger-text'}`}>
                    {pos.unrealizedPnl >= 0 ? '+' : ''}₹{pos.unrealizedPnl.toLocaleString()} ({pos.unrealizedPnlPct}%)
                  </td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${pos.riskScore >= 70 ? 'bg-status-danger-bg text-status-danger-text border-status-danger-border' : 'bg-status-warning-bg text-status-warning-text border-status-warning-border'}`}>
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
