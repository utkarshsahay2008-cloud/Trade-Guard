'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Filter, Calendar, Tag, AlertCircle, Upload } from 'lucide-react';
import { Trade, TradeJournal as TradeJournalModel } from '@/lib/database';

interface TradeJournalProps {
  onOpenUploadModal?: () => void;
}

export const TradeJournal: React.FC<TradeJournalProps> = ({ onOpenUploadModal }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New Trade Form State
  const [symbol, setSymbol] = useState('RELIANCE');
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [quantity, setQuantity] = useState<number>(25);
  const [entryPrice, setEntryPrice] = useState<number>(2950);
  const [exitPrice, setExitPrice] = useState<number>(2990);
  const [stopLoss, setStopLoss] = useState<number>(2900);
  const [takeProfit, setTakeProfit] = useState<number>(3050);
  const [notes, setNotes] = useState('');
  const [emotionalState, setEmotionalState] = useState<'CALM' | 'ANXIOUS' | 'CONFIDENT' | 'REVENGE' | 'FOMO'>('CALM');
  const [convictionLevel, setConvictionLevel] = useState<number>(4);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      setIsLoading(true);
      const resp = await fetch('/api/trades');
      const data = await resp.json();
      if (data.success) {
        setTrades(data.trades);
      }
    } catch (e) {
      console.error('Failed to load trade journal history:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          direction,
          quantity,
          entryPrice,
          exitPrice,
          stopLoss,
          takeProfit,
          notes,
          emotionalState,
          convictionLevel,
          tags: [emotionalState, 'JOURNAL_LOG'],
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchTrades(); // Refresh trades list
        setNotes('');
      }
    } catch (err) {
      console.error('Failed to create trade entry:', err);
    }
  };

  const filteredTrades = trades.filter(t => {
    const matchesSearch = t.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-surface p-6 rounded-xl border border-border-subtle shadow-fin-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-fin-charcoal">Trade Journal & Execution Log</h2>
          <p className="text-xs text-fin-muted mt-1">
            Stored historical execution history, trader psychological state notes, and conviction tracking
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenUploadModal && (
            <button
              onClick={onOpenUploadModal}
              className="fin-badge bg-surface-subtle hover:bg-surface-muted text-fin-charcoal border border-border-subtle px-3.5 py-2 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shadow-fin-sm"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Import CSV/JSON</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="fin-badge bg-fin-charcoal hover:bg-slate-800 text-surface px-4 py-2 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shadow-fin-sm"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Log New Trade</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-fin-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by symbol (e.g. RELIANCE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="fin-input w-full pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-fin-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="fin-input text-xs font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="CLOSED">Closed Trades</option>
            <option value="OPEN">Active Open Trades</option>
          </select>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-surface p-6 rounded-xl border border-border-subtle shadow-fin-card">
        {isLoading ? (
          <div className="py-12 text-center text-fin-muted text-sm flex flex-col items-center gap-3">
            <div className="w-5 h-5 border-2 border-fin-charcoal border-t-transparent rounded-full animate-spin" />
            <span>Loading trade log persistence...</span>
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="py-12 text-center text-fin-muted text-sm">
            No trade history matching query filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-fin-muted font-medium">
                  <th className="pb-3">Symbol</th>
                  <th className="pb-3">Direction</th>
                  <th className="pb-3">Quantity</th>
                  <th className="pb-3">Entry / Exit</th>
                  <th className="pb-3 text-right">Realized P&L</th>
                  <th className="pb-3 text-right">Risk Score</th>
                  <th className="pb-3">Journal Notes / Emotional State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredTrades.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-hover">
                    <td className="py-3 font-semibold text-fin-charcoal">{t.symbol}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${t.direction === 'LONG' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {t.direction} {t.leverage > 1 ? `(${t.leverage}x)` : ''}
                      </span>
                    </td>
                    <td className="py-3 font-mono">{t.quantity} units</td>
                    <td className="py-3 font-mono text-fin-body">
                      ₹{t.entryPrice} {t.exitPrice ? `→ ₹${t.exitPrice}` : ''}
                    </td>
                    <td className={`py-3 text-right font-semibold font-mono ${t.pnl >= 0 ? 'text-status-healthy-text' : 'text-status-danger-text'}`}>
                      {t.pnl >= 0 ? '+' : ''}₹{t.pnl.toLocaleString()} ({t.pnlPct}%)
                    </td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${t.riskScoreAtEntry >= 70 ? 'bg-status-danger-bg text-status-danger-text border-status-danger-border' : 'bg-surface-subtle text-fin-body border-border-subtle'}`}>
                        {t.riskScoreAtEntry}
                      </span>
                    </td>
                    <td className="py-3 max-w-xs">
                      {t.journalEntry ? (
                        <div className="space-y-1">
                          <p className="text-[11px] text-fin-body line-clamp-2 italic">"{t.journalEntry.notes}"</p>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              t.journalEntry.emotionalState === 'REVENGE' ? 'bg-rose-100 text-rose-800' :
                              t.journalEntry.emotionalState === 'FOMO' ? 'bg-amber-100 text-amber-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {t.journalEntry.emotionalState}
                            </span>
                            <span className="text-[10px] text-fin-muted">Conviction: {t.journalEntry.convictionLevel}/5</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-fin-light">No notes logged</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Trade Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4">
          <div className="bg-surface rounded-xl max-w-lg w-full p-6 shadow-fin-lg border border-border-subtle space-y-4">
            <h3 className="font-semibold text-fin-charcoal text-base">Log Executed Trade to Journal</h3>

            <form onSubmit={handleCreateTrade} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-fin-muted mb-1">Symbol</label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    className="fin-input w-full font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-fin-muted mb-1">Direction</label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as any)}
                    className="fin-input w-full"
                  >
                    <option value="LONG">LONG</option>
                    <option value="SHORT">SHORT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-fin-muted mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="fin-input w-full font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-fin-muted mb-1">Entry Price (₹)</label>
                  <input
                    type="number"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Number(e.target.value))}
                    className="fin-input w-full font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-fin-muted mb-1">Exit Price (₹)</label>
                  <input
                    type="number"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(Number(e.target.value))}
                    className="fin-input w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block text-fin-muted mb-1">Stop Loss (₹)</label>
                  <input
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(Number(e.target.value))}
                    className="fin-input w-full font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-fin-muted mb-1">Emotional State</label>
                <select
                  value={emotionalState}
                  onChange={(e) => setEmotionalState(e.target.value as any)}
                  className="fin-input w-full"
                >
                  <option value="CALM">CALM (Disciplined Plan Execution)</option>
                  <option value="ANXIOUS">ANXIOUS (Hesitant Entry)</option>
                  <option value="CONFIDENT">CONFIDENT (High Conviction setup)</option>
                  <option value="REVENGE">REVENGE (Post-Loss Capital Escalation)</option>
                  <option value="FOMO">FOMO (Chasing Market Momentum)</option>
                </select>
              </div>

              <div>
                <label className="block text-fin-muted mb-1">Trader Journal Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record trade reasoning, setup context, or emotional observations..."
                  className="fin-input w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border-subtle text-fin-body hover:bg-surface-hover font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-fin-charcoal hover:bg-slate-800 text-surface font-semibold cursor-pointer shadow-fin-sm"
                >
                  Save Trade Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
