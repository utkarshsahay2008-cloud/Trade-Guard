'use client';

import React, { useState } from 'react';
import { ShieldCheck, Mail, User, X, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleModeSwitch = (newMode: 'LOGIN' | 'REGISTER') => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
    if (newMode === 'REGISTER' && email === 'trader@tradeguard.io') {
      setEmail('');
      setPassword('');
      setFullName('');
    } else if (newMode === 'LOGIN' && !email) {
      setEmail('trader@tradeguard.io');
      setPassword('password123');
      setFullName('Alex Vance');
    }
  };

  const useDemoCredentials = () => {
    setMode('LOGIN');
    setEmail('trader@tradeguard.io');
    setPassword('password123');
    setFullName('Alex Vance');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

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
        setSuccessMsg(mode === 'LOGIN' ? `Welcome back, ${data.user.fullName}!` : `Account created for ${data.user.email}!`);
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 600);
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
            onClick={() => handleModeSwitch('LOGIN')}
            className={`flex-1 py-2 font-medium rounded-lg transition-all cursor-pointer ${
              mode === 'LOGIN' ? 'bg-surface text-fin-charcoal shadow-fin-sm font-semibold' : 'text-fin-muted hover:text-fin-body'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('REGISTER')}
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

          {mode === 'REGISTER' && (
            <div>
              <label className="block font-medium text-fin-muted mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-fin-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="fin-input w-full pl-11 pr-3 font-medium text-fin-charcoal"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-fin-muted mb-1">Login ID / Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-fin-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="fin-input w-full pl-11 pr-3 font-medium text-fin-charcoal"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-fin-muted mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-fin-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="fin-input w-full pl-11 pr-3 font-mono text-fin-charcoal"
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
          <div className="flex items-center justify-between text-[11px] text-fin-muted bg-surface-subtle p-2.5 rounded-lg border border-border-subtle">
            <span>Demo: <span className="font-semibold text-fin-charcoal">trader@tradeguard.io</span></span>
            <button
              type="button"
              onClick={useDemoCredentials}
              className="text-emerald-700 font-semibold hover:underline cursor-pointer"
            >
              Fill Demo Login
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
