'use client';

import React from 'react';
import { LayoutDashboard, ShieldAlert, Sliders, Dna, BookOpen, TrendingUp } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'analyzer' | 'predictor' | 'whatif' | 'behavioral' | 'journal';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeRiskCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
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
    <nav className="w-full bg-surface border-b border-border-subtle mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-surface-subtle text-fin-charcoal border border-border-subtle shadow-fin-sm font-semibold'
                    : 'text-fin-muted hover:text-fin-body hover:bg-surface-hover'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-fin-charcoal' : 'text-fin-muted'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold border ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
