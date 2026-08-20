'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Navigation, ActiveTab } from '@/components/Navigation';
import { PortfolioDashboard } from '@/components/PortfolioDashboard';
import { TradeAnalyzer } from '@/components/TradeAnalyzer';
import { StockPredictor } from '@/components/StockPredictor';
import { WhatIfMatrix } from '@/components/WhatIfMatrix';
import { TradingDNACard } from '@/components/TradingDNACard';
import { TradeJournal } from '@/components/TradeJournal';
import { AuthModal } from '@/components/AuthModal';
import { TradeUploadModal } from '@/components/TradeUploadModal';
import { Portfolio, Position, RiskAlert, User } from '@/lib/database';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setIsLoading(true);
      const resp = await fetch('/api/portfolio');
      const data = await resp.json();
      if (data.success) {
        setPortfolio(data.portfolio);
        setPositions(data.positions);
        setRiskAlerts(data.riskAlerts);
        setUser(data.user);
      }
    } catch (e) {
      console.error('Failed to load portfolio data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSeedData = async () => {
    try {
      setIsResetting(true);
      const resp = await fetch('/api/seed', { method: 'POST' });
      const data = await resp.json();
      if (data.success) {
        await fetchPortfolioData();
      }
    } catch (e) {
      console.error('Failed to reset demo data:', e);
    } finally {
      setIsResetting(false);
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    fetchPortfolioData();
  };

  const handleUploadSuccess = () => {
    fetchPortfolioData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      
      {/* Top Bar Header */}
      <Header
        userName={user?.fullName || 'Alex Vance'}
        portfolioName={portfolio?.name || 'Primary Swing & Momentum'}
        totalBalance={portfolio?.totalBalance || 100000}
        dailyPnl={portfolio?.dailyPnl || -1420}
        maxDrawdownPct={portfolio?.maxDrawdownPct || 8.5}
        onResetSeed={handleResetSeedData}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        isResetting={isResetting}
      />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeRiskCount={riskAlerts.filter(a => !a.isDismissed).length}
      />

      {/* Main Body Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {isLoading ? (
          <div className="py-24 text-center text-fin-muted text-sm flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-fin-charcoal border-t-transparent rounded-full animate-spin" />
            <span>Loading Trade-Guard Risk Engine & Portfolio Data...</span>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <PortfolioDashboard
                portfolio={portfolio}
                positions={positions}
                riskAlerts={riskAlerts}
              />
            )}

            {activeTab === 'analyzer' && (
              <TradeAnalyzer />
            )}

            {activeTab === 'predictor' && (
              <StockPredictor />
            )}

            {activeTab === 'whatif' && (
              <WhatIfMatrix />
            )}

            {activeTab === 'behavioral' && (
              <TradingDNACard />
            )}

            {activeTab === 'journal' && (
              <TradeJournal
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Upload CSV/JSON Modal */}
      <TradeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Footer */}
      <footer className="w-full border-t border-border-subtle bg-surface py-4 text-center text-xs text-fin-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Trade-Guard Financial Safety & Behavioral Risk System</span>
          <span className="font-mono text-[11px]">Deterministic Risk, Prediction & Import Engine v1.2.0</span>
        </div>
      </footer>

    </div>
  );
}
