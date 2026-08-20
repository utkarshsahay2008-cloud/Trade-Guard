'use client';

import React from 'react';
import { ShieldCheck, RefreshCw, AlertTriangle, UserCheck, Database, Upload } from 'lucide-react';

interface HeaderProps {
  userName: string;
  portfolioName: string;
  totalBalance: number;
  dailyPnl: number;
  maxDrawdownPct: number;
  onResetSeed: () => void;
  onOpenAuthModal: () => void;
  onOpenUploadModal: () => void;
  isResetting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  portfolioName,
  totalBalance,
  dailyPnl,
  maxDrawdownPct,
  onResetSeed,
  onOpenAuthModal,
  onOpenUploadModal,
  isResetting = false,
}) => {
  const isPnlPositive = dailyPnl >= 0;

  return (
    <header className="w-full bg-surface border-b border-border-subtle sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Account Info */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-fin-charcoal text-surface flex items-center justify-center font-semibold text-base shadow-fin-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-fin-charcoal tracking-tight text-base">Trade-Guard</span>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-600" /> PostgreSQL Active
              </span>
            </div>
            <p className="text-xs text-fin-muted flex items-center gap-1">
              <span>{portfolioName}</span>
              <span className="text-border-strong">•</span>
              <span className="text-fin-body font-semibold">{userName}</span>
            </p>
          </div>
        </div>

        {/* Portfolio Realtime Quick Metrics */}
        <div className="hidden md:flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-fin-muted uppercase tracking-wider font-medium">Capital Equity</div>
            <div className="text-sm font-semibold text-fin-charcoal">₹{totalBalance.toLocaleString()}</div>
          </div>

          <div className="h-7 w-px bg-border-subtle" />

          <div className="text-right">
            <div className="text-xs text-fin-muted uppercase tracking-wider font-medium">Daily P&L</div>
            <div className={`text-sm font-semibold ${isPnlPositive ? 'text-status-healthy-text' : 'text-status-danger-text'}`}>
              {isPnlPositive ? '+' : ''}₹{dailyPnl.toLocaleString()}
            </div>
          </div>

          <div className="h-7 w-px bg-border-subtle" />

          <div className="text-right">
            <div className="text-xs text-fin-muted uppercase tracking-wider font-medium">Drawdown</div>
            <div className="text-sm font-semibold text-fin-charcoal flex items-center gap-1 justify-end">
              {maxDrawdownPct > 5.0 && <AlertTriangle className="w-3.5 h-3.5 text-status-warning-text" />}
              <span>{maxDrawdownPct}%</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Upload CSV/JSON Button */}
          <button
            onClick={onOpenUploadModal}
            className="fin-badge bg-surface-subtle hover:bg-surface-muted text-fin-charcoal border border-border-subtle transition-all cursor-pointer text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5 shadow-fin-sm"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Upload CSV/JSON</span>
          </button>

          {/* Login / Account Button */}
          <button
            onClick={onOpenAuthModal}
            className="fin-badge bg-fin-charcoal hover:bg-slate-800 text-surface transition-all cursor-pointer text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5 shadow-fin-sm"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sign In / Auth</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetSeed}
            disabled={isResetting}
            className="fin-badge bg-surface-subtle text-fin-body hover:bg-surface-muted border border-border-subtle transition-all cursor-pointer text-xs font-medium px-3 py-1.5 flex items-center gap-1.5"
            title="Reset synthetic trade history to default demo state"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-fin-muted ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isResetting ? 'Resetting...' : 'Reset Data'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
