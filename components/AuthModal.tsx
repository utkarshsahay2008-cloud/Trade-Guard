'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, User, X, KeyRound, ArrowRight } from 'lucide-react';
import { User as UserModel } from '@/lib/database';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserModel) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('trader@tradeguard.io');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Alex Vance');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const resp = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode,
          email,
          password,
          fullName,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.error || 'Authentication failed');
      }
    } catch (err: any) {
      setErrorMsg('Server communication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4">
      <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-fin-lg border border-border-subtle space-y-5 relative">
        
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
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-fin-charcoal">
              {mode === 'LOGIN' ? 'Sign In to Trade-Guard' : 'Create Trader Account'}
            </h3>
            <p className="text-xs text-fin-muted">Financial safety & risk intelligence portal</p>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex p-1 bg-surface-subtle rounded-xl border border-border-subtle text-xs">
          <button
            type="button"
            onClick={() => setMode('LOGIN')}
            className={`flex-1 py-2 font-medium rounded-lg transition-all cursor-pointer ${
              mode === 'LOGIN' ? 'bg-surface text-fin-charcoal shadow-fin-sm font-semibold' : 'text-fin-muted hover:text-fin-body'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('REGISTER')}
            className={`flex-1 py-2 font-medium rounded-lg transition-all cursor-pointer ${
              mode === 'REGISTER' ? 'bg-surface text-fin-charcoal shadow-fin-sm font-semibold' : 'text-fin-muted hover:text-fin-body'
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-status-danger-bg border border-status-danger-border text-status-danger-text text-xs">
              {errorMsg}
            </div>
          )}

          {mode === 'REGISTER' && (
            <div>
              <label className="block font-medium text-fin-muted mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-fin-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Vance"
                  className="fin-input w-full pl-9"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-fin-muted mb-1">Login ID / Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-fin-muted absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@tradeguard.io"
                className="fin-input w-full pl-9 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-fin-muted mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-fin-muted absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="fin-input w-full pl-9 font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-fin-charcoal hover:bg-slate-800 text-surface font-semibold text-xs rounded-xl shadow-fin-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? 'Authenticating...' : mode === 'LOGIN' ? 'Sign In to Account' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          {/* Quick Demo Hint */}
          <div className="text-[11px] text-center text-fin-muted bg-surface-subtle p-2.5 rounded-lg border border-border-subtle">
            Demo Credentials: <span className="font-semibold text-fin-charcoal">trader@tradeguard.io</span> / <span className="font-mono text-fin-charcoal">password123</span>
          </div>
        </form>

      </div>
    </div>
  );
};
