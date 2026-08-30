'use client';

import React from 'react';
import { LayoutDashboard, ShieldAlert, Sliders, Dna, BookOpen, TrendingUp, Bot, Sparkles } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'analyzer' | 'predictor' | 'whatif' | 'behavioral' | 'journal';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAiChatbot?: () => void;
  activeRiskCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenAiChatbot,
  activeRiskCount = 0,
}) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Portfolio Overview',
      icon: LayoutDashboard,
      badge: activeRiskCount > 0 ? `${activeRiskCount} Alerts` : undefined,
      badgeColor: 'bg-status-danger-bg text-status-danger-text border-status-danger-border',
    },
    {
      id: 'analyzer' as ActiveTab,
      label: 'Trade Safety Analyzer',
      icon: ShieldAlert,
    },
    {
      id: 'predictor' as ActiveTab,
      label: 'Stock Predictor & Forecast',
      icon: TrendingUp,
    },
    {
      id: 'whatif' as ActiveTab,
      label: 'What-If Stress Matrix',
      icon: Sliders,
    },
    {
      id: 'behavioral' as ActiveTab,
      label: 'Trading DNA & Behavioral Risk',
      icon: Dna,
    },
    {
      id: 'journal' as ActiveTab,
      label: 'Trade Journal & History',
      icon: BookOpen,
    },
  ];

  return (
    <nav className="w-full bg-surface border-b border-border-subtle mb-6 shadow-fin-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2.5 scrollbar-none flex-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-fin-charcoal text-surface shadow-fin-sm font-bold'
                    : 'text-fin-muted hover:text-fin-body hover:bg-surface-hover'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-fin-muted'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Prominent Navigation Copilot Button */}
        {onOpenAiChatbot && (
          <button
            onClick={onOpenAiChatbot}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-fin-sm ml-2 flex-shrink-0"
            title="Launch AI Navigator to guide you through the app"
          >
            <Bot className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>AI Copilot & Guide</span>
          </button>
        )}
      </div>
    </nav>
  );
};
