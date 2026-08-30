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
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1.5 sm:space-x-3 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-300 shadow-fin-sm font-bold ring-1 ring-emerald-500/20'
                    : 'text-fin-body hover:text-fin-charcoal hover:bg-slate-100/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-fin-muted'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${tab.badgeColor}`}>
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
