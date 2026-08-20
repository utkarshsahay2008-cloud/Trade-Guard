'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Download, Database, FileSpreadsheet } from 'lucide-react';
import { ParseResult } from '@/lib/tradeParserEngine';

interface TradeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const TradeUploadModal: React.FC<TradeUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'FILE' | 'PASTE'>('FILE');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [mode, setMode] = useState<'MERGE' | 'REPLACE'>('MERGE');
  const [parsePreview, setParsePreview] = useState<ParseResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
      setErrorMsg('');
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCsv = () => {
    const sampleCsv = `Symbol,Direction,Quantity,EntryPrice,ExitPrice,StopLoss,TakeProfit,Notes
RELIANCE,LONG,50,2920,2980,2850,3050,"Disciplined swing trade at key support level"
INFY,LONG,30,1800,1835,1760,1870,"Breakout entry"
NVDA,LONG,20,125,118,115,135,"Post-earnings volatility stop out"
BTC/USD,SHORT,0.2,65000,63800,66200,62000,"Short hedge against macro resistance"`;

    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tradeguard_sample_trades.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!rawText.trim()) {
      setErrorMsg('Please select a CSV/JSON file or paste trade data.');
      return;
    }

    setIsSubmitting(true);

    try {
      const resp = await fetch('/api/upload-trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileContent: rawText,
          mode,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setParsePreview(data.parseResult);
        setSuccessMsg(data.message);
        setTimeout(() => {
          onUploadSuccess();
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Parsing failed.');
        if (data.parseResult) {
          setParsePreview(data.parseResult);
        }
      }
    } catch (err: any) {
      setErrorMsg('Server connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4">
      <div className="bg-surface rounded-2xl max-w-xl w-full p-6 shadow-fin-lg border border-border-subtle space-y-5 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-fin-muted hover:text-fin-charcoal hover:bg-surface-subtle transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-fin-charcoal text-surface flex items-center justify-center font-bold shadow-fin-sm">
            <Upload className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-fin-charcoal">Import & Parse Trade Logs</h3>
            <p className="text-xs text-fin-muted">Upload CSV or JSON trade history from any broker</p>
          </div>
        </div>

        {/* Tabs: File Upload vs Raw Text */}
        <div className="flex p-1 bg-surface-subtle rounded-xl border border-border-subtle text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('FILE')}
            className={`flex-1 py-2 font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'FILE' ? 'bg-surface text-fin-charcoal shadow-fin-sm font-semibold' : 'text-fin-muted hover:text-fin-body'
            }`}
          >
            Upload File (.csv / .json)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PASTE')}
            className={`flex-1 py-2 font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'PASTE' ? 'bg-surface text-fin-charcoal shadow-fin-sm font-semibold' : 'text-fin-muted hover:text-fin-body'
            }`}
          >
            Paste Raw Text / CSV
          </button>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-status-danger-bg border border-status-danger-border text-status-danger-text text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-status-healthy-bg border border-status-healthy-border text-status-healthy-text text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Merge Mode Selector */}
          <div className="p-3 bg-surface-subtle rounded-xl border border-border-subtle space-y-2">
            <div className="font-semibold text-fin-charcoal text-xs">Dataset Merge Mode</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('MERGE')}
                className={`p-2.5 rounded-lg text-left border text-xs transition-all cursor-pointer ${
                  mode === 'MERGE'
                    ? 'bg-surface border-fin-charcoal text-fin-charcoal shadow-fin-sm font-semibold'
                    : 'bg-surface-subtle border-border-subtle text-fin-muted'
                }`}
              >
                <div className="font-semibold">Append & Merge</div>
                <div className="text-[10px] text-fin-muted mt-0.5">Retain demo trades and append new records</div>
              </button>

              <button
                type="button"
                onClick={() => setMode('REPLACE')}
                className={`p-2.5 rounded-lg text-left border text-xs transition-all cursor-pointer ${
                  mode === 'REPLACE'
                    ? 'bg-surface border-fin-charcoal text-fin-charcoal shadow-fin-sm font-semibold'
                    : 'bg-surface-subtle border-border-subtle text-fin-muted'
                }`}
              >
                <div className="font-semibold">Replace Dataset</div>
                <div className="text-[10px] text-fin-muted mt-0.5">Overwrite existing dataset with uploaded file</div>
              </button>
            </div>
          </div>

          {/* File Upload Zone */}
          {activeTab === 'FILE' ? (
            <div className="border-2 border-dashed border-border-subtle hover:border-fin-charcoal rounded-xl p-6 text-center space-y-2 bg-surface-hover transition-colors">
              <FileSpreadsheet className="w-8 h-8 text-fin-muted mx-auto" />
              <div className="font-semibold text-fin-charcoal text-xs">
                {fileName ? fileName : 'Drag and drop your CSV or JSON trade log file here'}
              </div>
              <p className="text-[11px] text-fin-muted">Supports Zerodha, Groww, IBKR, MT4/MT5, or generic CSV</p>
              <input
                type="file"
                accept=".csv,.json,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="trade-file-input"
              />
              <label
                htmlFor="trade-file-input"
                className="fin-badge bg-fin-charcoal text-surface px-4 py-2 text-xs font-semibold cursor-pointer inline-block mt-2"
              >
                Browse File
              </label>
            </div>
          ) : (
            <div>
              <label className="block font-medium text-fin-muted mb-1">Paste CSV / JSON Raw Text</label>
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Symbol,Direction,Quantity,EntryPrice,ExitPrice,Notes&#10;RELIANCE,LONG,50,2920,2980,&quot;Support bounce&quot;"
                className="fin-input w-full font-mono text-xs"
              />
            </div>
          )}

          {/* Download Template & Action Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              className="text-xs text-fin-muted hover:text-fin-charcoal flex items-center gap-1 cursor-pointer font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sample CSV Template</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !rawText}
              className="py-2.5 px-5 bg-fin-charcoal hover:bg-slate-800 text-surface font-semibold text-xs rounded-xl shadow-fin-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>{isSubmitting ? 'Parsing Dataset...' : 'Import Trade Log'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
