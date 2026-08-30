'use client';

import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, AlertTriangle, UserCheck, Database, Upload, Bot, LogOut, ChevronDown, User, Sparkles } from 'lucide-react';
import { User as UserModel } from '@/lib/database';

interface HeaderProps {
  user: UserModel | null;
  portfolioName: string;
  totalBalance: number;
  dailyPnl: number;
  maxDrawdownPct: number;
  onResetSeed: () => void;
  onOpenAuthModal: () => void;
  onOpenUploadModal: () => void;
  onOpenAiChatbot: () => void;
  onSignOut: () => void;
  isResetting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  portfolioName,
  totalBalance,
  dailyPnl,
  maxDrawdownPct,
  onResetSeed,
  onOpenAuthModal,
  onOpenUploadModal,
  onOpenAiChatbot,
  onSignOut,
  isResetting = false,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const isPnlPositive = dailyPnl >= 0;
  const userName = user?.fullName || 'Alex Vance';
  const userEmail = user?.email || 'alex.vance@tradeguard.io';

  const handleBrandLogoClick = () => {
    window.location.reload();
  };

  return (
    <header className="w-full bg-surface border-b border-border-subtle sticky top-0 z-30 shadow-fin-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Account Info (Clickable logo refreshes app) */}
        <div
          onClick={handleBrandLogoClick}
          className="flex items-center gap-3 cursor-pointer group hover:opacity-95 transition-opacity"
          title="Click Trade-Guard logo to refresh application"
        >
          <div className="h-10 w-10 rounded-xl bg-fin-charcoal text-surface flex items-center justify-center font-semibold text-base shadow-fin-sm border border-slate-700 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-fin-charcoal tracking-tight text-base group-hover:text-emerald-700 transition-colors">
                Trade-Guard
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-600" /> DB Connected
              </span>
            </div>
            <p className="text-xs text-fin-muted flex items-center gap-1.5">
              <span className="font-medium">{portfolioName}</span>
              <span className="text-[10px] text-emerald-600 font-semibold hidden sm:inline">(Click logo to refresh)</span>
            </p>
          </div>
        </div>

        {/* Portfolio Realtime Quick Metrics */}
        <div className="hidden lg:flex items-center gap-6 bg-surface-subtle px-4 py-1.5 rounded-xl border border-border-subtle">
          <div className="text-right">
            <div className="text-[10px] text-fin-muted uppercase tracking-wider font-semibold">Total Equity</div>
            <div className="text-sm font-bold text-fin-charcoal font-mono">₹{totalBalance.toLocaleString()}</div>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="text-right">
            <div className="text-[10px] text-fin-muted uppercase tracking-wider font-semibold">Daily P&L</div>
            <div className={`text-sm font-bold font-mono ${isPnlPositive ? 'text-status-healthy-text' : 'text-status-danger-text'}`}>
              {isPnlPositive ? '+' : ''}₹{dailyPnl.toLocaleString()}
            </div>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="text-right">
            <div className="text-[10px] text-fin-muted uppercase tracking-wider font-semibold">Drawdown</div>
            <div className="text-sm font-bold text-fin-charcoal flex items-center gap-1 justify-end font-mono">
              {maxDrawdownPct > 5.0 && <AlertTriangle className="w-3.5 h-3.5 text-status-warning-text" />}
              <span>{maxDrawdownPct}%</span>
            </div>
          </div>
        </div>

        {/* Action Controls & User Dropdown */}
        <div className="flex items-center gap-2">
          {/* AI Assistant Button */}
          <button
            onClick={onOpenAiChatbot}
            className="fin-badge bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all cursor-pointer text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5 shadow-fin-sm"
            title="Launch LLM AI Copilot Assistant"
          >
            <Bot className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Upload CSV/JSON Button */}
          <button
            onClick={onOpenUploadModal}
            className="fin-badge bg-surface-subtle hover:bg-surface-muted text-fin-charcoal border border-border-subtle transition-all cursor-pointer text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5 shadow-fin-sm"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* User Profile Avatar / Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1.5 bg-surface-subtle hover:bg-surface-muted rounded-xl border border-border-subtle transition-all cursor-pointer"
            >
              <div className="h-7 w-7 rounded-lg bg-fin-charcoal text-surface font-bold text-xs flex items-center justify-center border border-slate-700">
                {userName.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-fin-charcoal hidden md:inline max-w-[100px] truncate">
                {userName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-fin-muted" />
            </button>

            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-2xl border border-border-subtle py-2 z-50 animate-in fade-in duration-100 space-y-1">
                <div className="px-3 py-2 border-b border-border-subtle">
                  <div className="font-bold text-xs text-fin-charcoal">{userName}</div>
                  <div className="text-[11px] text-fin-muted truncate">{userEmail}</div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Trader Session</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenAuthModal();
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-fin-body hover:bg-surface-hover flex items-center gap-2 font-medium cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-fin-muted" />
                  <span>Switch Account / Sign In</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onResetSeed();
                  }}
                  disabled={isResetting}
                  className="w-full px-3 py-2 text-left text-xs text-fin-body hover:bg-surface-hover flex items-center gap-2 font-medium cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 text-fin-muted ${isResetting ? 'animate-spin' : ''}`} />
                  <span>{isResetting ? 'Resetting Demo Data...' : 'Reset Demo Data'}</span>
                </button>

                <div className="border-t border-border-subtle pt-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSignOut();
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-status-danger-text hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-status-danger-text" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
