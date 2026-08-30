'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, RefreshCw, Copy, Check, ShieldCheck, User, Compass, ArrowRight, Layers, TrendingUp, Sliders, Dna, BookOpen, LayoutDashboard } from 'lucide-react';
import { ChatMessage } from '@/app/api/chat/route';
import { ActiveTab } from './Navigation';

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({
  isOpen,
  onClose,
  onOpen,
  activeTab,
  onTabChange,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      role: 'assistant',
      content: "👋 Hello! I am **Trade-Guard AI Navigator**. I can help you analyze risk, explain features, and **navigate the platform**! Try asking me to take you to any section or analyze your trades.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const presetQueries = [
    "🛡️ Take me to Trade Safety Analyzer",
    "📈 Show Stock Predictor forecast",
    "⚡ Run What-If Flash Crash simulation",
    "🧬 Check my Trading DNA revenge score",
    "📊 How is my portfolio doing?",
  ];

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputMsg;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInputMsg('');
    setIsLoading(true);

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
        }),
      });

      const data = await resp.json();
      if (data.success) {
        const botReply: ChatMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionTab: data.actionTab,
          actionLabel: data.actionLabel,
        };
        setMessages((prev) => [...prev, botReply]);

        if (data.actionTab) {
          onTabChange(data.actionTab);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch AI reply');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: "⚠️ I encountered an error connecting to the risk engine. Please try again shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `init_${Date.now()}`,
        role: 'assistant',
        content: "Chat history cleared. Where would you like to navigate or what trade would you like to analyze?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let formatted = line;

      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-bold text-fin-charcoal text-sm mt-2 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="font-bold text-fin-charcoal text-base mt-2 mb-1">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('- ')) {
        const bulletText = line.replace('- ', '');
        return (
          <li key={idx} className="ml-3 list-disc text-xs leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: parseBold(bulletText) }} />
          </li>
        );
      }
      return (
        <p key={idx} className="text-xs leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: parseBold(line) }} />
      );
    });
  };

  const parseBold = (str: string) => {
    return str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <>
      {/* Floating Action Button (Mobile & Desktop Responsive) */}
      <button
        onClick={isOpen ? onClose : onOpen}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-fin-charcoal hover:bg-slate-800 text-surface p-3.5 rounded-full shadow-2xl transition-all hover:scale-105 cursor-pointer flex items-center gap-2.5 border-2 border-emerald-400 group"
        title="Open Trade-Guard AI Navigator & Assistant"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-emerald-400" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full" />
        </div>
        <span className="font-bold text-xs pr-1 text-surface tracking-wide hidden xs:inline">
          AI Copilot & Guide
        </span>
      </button>

      {/* Slide-Up Chat Sheet / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-6 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-surface rounded-t-2xl sm:rounded-2xl w-full max-w-lg h-[88vh] sm:h-[620px] max-h-[92vh] shadow-2xl border border-border-subtle flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
            
            {/* Header */}
            <div className="p-4 bg-fin-charcoal text-surface flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                  <Bot className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-surface">Trade-Guard AI Navigator</h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30 font-mono">
                      LIVE GUIDE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Context-Aware Financial Co-Pilot & Tab Navigator</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 text-slate-400 hover:text-surface rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Clear Chat History"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-surface rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close Assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Suggestion Pills */}
            <div className="p-2.5 bg-surface-subtle border-b border-border-subtle overflow-x-auto scrollbar-none flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              {presetQueries.map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(query)}
                  className="text-[11px] font-semibold bg-surface hover:bg-surface-hover text-fin-charcoal border border-border-subtle px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer shadow-fin-sm flex-shrink-0"
                >
                  {query}
                </button>
              ))}
            </div>

            {/* Quick Tab Jump Shortcuts Bar inside Chatbot */}
            <div className="px-3 py-2 bg-surface border-b border-border-subtle flex items-center gap-1 text-[11px] overflow-x-auto scrollbar-none">
              <span className="text-fin-muted font-semibold mr-1 flex-shrink-0 flex items-center gap-1">
                <Compass className="w-3 h-3 text-emerald-600" /> Jump:
              </span>
              {[
                { id: 'dashboard' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
                { id: 'analyzer' as ActiveTab, label: 'Safety Analyzer', icon: ShieldCheck },
                { id: 'predictor' as ActiveTab, label: 'Predictor', icon: TrendingUp },
                { id: 'whatif' as ActiveTab, label: 'What-If', icon: Sliders },
                { id: 'behavioral' as ActiveTab, label: 'Trading DNA', icon: Dna },
                { id: 'journal' as ActiveTab, label: 'Journal', icon: BookOpen },
              ].map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onTabChange(t.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                      isActive ? 'bg-emerald-600 text-white font-bold' : 'bg-surface-subtle text-fin-muted hover:text-fin-charcoal'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-canvas">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-surface'
                        : 'bg-fin-charcoal text-emerald-400'
                    }`}
                  >
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`relative max-w-[84%] rounded-2xl p-3.5 shadow-fin-sm border text-xs space-y-2 ${
                    msg.role === 'user'
                      ? 'bg-fin-charcoal text-surface border-slate-800 rounded-tr-none'
                      : 'bg-surface text-fin-body border-border-subtle rounded-tl-none'
                  }`}>
                    {msg.role === 'assistant' ? (
                      formatMarkdown(msg.content)
                    ) : (
                      <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                    )}

                    {msg.actionTab && (
                      <div className="pt-2 border-t border-border-subtle/50">
                        <button
                          onClick={() => onTabChange(msg.actionTab!)}
                          className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-fin-sm"
                        >
                          <span>{msg.actionLabel || `Switch to ${msg.actionTab}`}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-border-subtle/40 text-[10px] opacity-70">
                      <span>{msg.timestamp}</span>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="hover:text-fin-charcoal cursor-pointer flex items-center gap-1"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs font-semibold text-fin-muted py-2 px-3 bg-surface rounded-xl border border-border-subtle w-fit animate-pulse">
                  <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span>Trade-Guard AI is processing risk navigation...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-surface border-t border-border-subtle flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Ask Trade-Guard AI to navigate or analyze risk..."
                className="fin-input flex-1 text-xs py-2 px-3 font-medium"
              />
              <button
                type="submit"
                disabled={!inputMsg.trim() || isLoading}
                className="p-2 bg-fin-charcoal hover:bg-slate-800 disabled:opacity-50 text-surface rounded-xl transition-all cursor-pointer shadow-fin-sm flex items-center justify-center"
              >
                <Send className="w-4 h-4 text-emerald-400" />
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
};
