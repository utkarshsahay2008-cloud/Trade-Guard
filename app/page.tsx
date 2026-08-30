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
import { AIChatbot } from '@/components/AIChatbot';
import { Portfolio, Position, RiskAlert, User } from '@/lib/database';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  
  // Synchronous client initializer for seamless user persistence (zero Alex Vance flash)
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUserStr = localStorage.getItem('tradeguard_user');
      if (savedUserStr) {
        try {
          return JSON.parse(savedUserStr);
        } catch (e) {}
      }
    }
    return {
      id: 'usr_default',
      email: 'utkarsh@tradeguard.io',
      fullName: 'Utkarsh',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAiChatbotOpen, setIsAiChatbotOpen] = useState(false);

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
        if (!user || user.fullName === 'Alex Vance') {
          setUser(data.user);
        }
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

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tradeguard_user');
    }
    const defaultUser: User = {
      id: 'usr_default',
      email: 'utkarsh@tradeguard.io',
      fullName: 'Utkarsh',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(defaultUser);
    fetchPortfolioData();
  };

  const handleUploadSuccess = () => {
    fetchPortfolioData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas font-sans antialiased text-fin-charcoal">
      
      {/* Top Bar Header */}
      <Header
        user={user}
        portfolioName={portfolio?.name || `${user?.fullName || 'Utkarsh'}'s Portfolio`}
        totalBalance={portfolio?.totalBalance || 100000}
        dailyPnl={portfolio?.dailyPnl || -1420}
        maxDrawdownPct={portfolio?.maxDrawdownPct || 8.5}
        onResetSeed={handleResetSeedData}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenAiChatbot={() => setIsAiChatbotOpen(true)}
        onSignOut={handleSignOut}
        isResetting={isResetting}
      />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeRiskCount={riskAlerts.filter(a => !a.isDismissed).length}
      />

      {/* Main Body Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {isLoading ? (
          <div className="py-28 text-center text-fin-muted text-sm flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-3 border-fin-charcoal border-t-transparent rounded-full animate-spin" />
            <span className="font-semibold text-fin-charcoal">Loading Trade-Guard Risk Engine & Portfolio Analytics...</span>
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

      {/* Floating AI Chatbot Assistant & Navigator Widget */}
      <AIChatbot
        isOpen={isAiChatbotOpen}
        onClose={() => setIsAiChatbotOpen(false)}
        onOpen={() => setIsAiChatbotOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

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
      <footer className="w-full border-t border-border-subtle bg-surface py-5 text-center text-xs text-fin-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span>Trade-Guard Risk Engine & AI Copilot</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">PostgreSQL & Deterministic Risk Connected</span>
          </div>
          <span className="font-mono text-[11px] bg-surface-subtle px-2 py-1 rounded border border-border-subtle">
            v1.3.3 Profile Fix & Clean Dashboard Release
          </span>
        </div>
      </footer>

    </div>
  );
}
