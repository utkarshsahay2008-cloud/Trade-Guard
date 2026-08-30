'use client';

import React, { useState } from 'react';
import { ShieldCheck, Mail, User, X, KeyRound, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
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
  const [email, setEmail] = useState('utkarsh@tradeguard.io');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Utkarsh');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleModeSwitch = (newMode: 'LOGIN' | 'REGISTER') => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
    if (newMode === 'REGISTER' && email === 'utkarsh@tradeguard.io') {
      setEmail('');
      setPassword('');
      setFullName('');
    } else if (newMode === 'LOGIN' && !email) {
      setEmail('utkarsh@tradeguard.io');
      setPassword('password123');
      setFullName('Utkarsh');
    }
  };

  const useDemoUser = (demoName: string, demoEmail: string) => {
    setMode('LOGIN');
    setEmail(demoEmail);
    setPassword('password123');
    setFullName(demoName);
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

    if (!password || password.length < 3) {
      setErrorMsg('Password must be at least 3 characters long.');
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
        setSuccessMsg(mode === 'LOGIN' ? `Welcome back, ${data.user.fullName}!` : `Trader account created for ${data.user.email}!`);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('tradeguard_user', JSON.stringify(data.user));
        }

        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 500);
      } else {
        setErrorMsg(data.error || 'Authentication failed');
      }
    } catch (err: any) {
      setErrorMsg('Server communication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLoginMock = (provider: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const socialUser: UserModel = {
        id: `usr_${provider.toLowerCase()}_${Date.now()}`,
        email: `trader@${provider.toLowerCase()}.com`,
        fullName: `Utkarsh (${provider})`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('tradeguard_user', JSON.stringify(socialUser));
      }

      setSuccessMsg(`Signed in with ${provider}!`);
      setIsSubmitting(false);
      setTimeout(() => {
        onLoginSuccess(socialUser);
        onClose();
      }, 500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border-subtle space-y-5 relative max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-fin-muted hover:text-fin-charcoal hover:bg-surface-subtle transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-fin-charcoal text-surface flex items-center justify-center font-bold shadow-fin-sm border border-slate-700">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-fin-charcoal">
              {mode === 'LOGIN' ? 'Sign In to Trade-Guard' : 'Create Trader Account'}
            </h3>
            <p className="text-xs text-fin-muted">Financial safety & behavioral risk portal</p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex p-1 bg-surface-subtle rounded-xl border border-border-subtle text-xs">
          <button
            type="button"
            onClick={() => handleModeSwitch('LOGIN')}
            className={`flex-1 py-2 font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'LOGIN' ? 'bg-surface text-fin-charcoal shadow-fin-sm font-bold' : 'text-fin-muted hover:text-fin-body'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('REGISTER')}
            className={`flex-1 py-2 font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'REGISTER' ? 'bg-surface text-fin-charcoal shadow-fin-sm font-bold' : 'text-fin-muted hover:text-fin-body'
            }`}
          >
            New Registration
          </button>
        </div>

        {/* Quick Social Logins */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleSocialLoginMock('Google')}
            className="py-2.5 px-3 rounded-xl border border-border-subtle bg-surface hover:bg-surface-hover font-bold text-fin-charcoal flex items-center justify-center gap-2 cursor-pointer shadow-fin-sm transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLoginMock('GitHub')}
            className="py-2.5 px-3 rounded-xl border border-border-subtle bg-surface hover:bg-surface-hover font-bold text-fin-charcoal flex items-center justify-center gap-2 cursor-pointer shadow-fin-sm transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-fin-muted my-1 font-medium">
          <div className="flex-1 h-px bg-border-subtle" />
          <span>or email authentication</span>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-status-danger-bg border border-status-danger-border text-status-danger-text text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-status-healthy-bg border border-status-healthy-border text-status-healthy-text text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'REGISTER' && (
            <div>
              <label className="block font-bold text-fin-muted mb-1 text-xs flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Full Name</span>
              </label>
              <div className="flex items-center rounded-xl border border-slate-300 bg-white focus-within:border-slate-800 focus-within:ring-2 focus-within:ring-slate-900/10 overflow-hidden shadow-fin-sm transition-all">
                <div className="px-3 py-2.5 bg-slate-100 text-slate-600 border-r border-slate-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Utkarsh"
                  style={{ paddingLeft: '12px', paddingRight: '12px' }}
                  className="w-full py-2.5 text-xs font-semibold text-slate-900 bg-transparent outline-none focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-fin-muted mb-1 text-xs flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span>Login ID / Email</span>
            </label>
            <div className="flex items-center rounded-xl border border-slate-300 bg-white focus-within:border-slate-800 focus-within:ring-2 focus-within:ring-slate-900/10 overflow-hidden shadow-fin-sm transition-all">
              <div className="px-3 py-2.5 bg-slate-100 text-slate-600 border-r border-slate-200 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-slate-600" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="utkarsh@tradeguard.io"
                style={{ paddingLeft: '12px', paddingRight: '12px' }}
                className="w-full py-2.5 text-xs font-semibold text-slate-900 bg-transparent outline-none focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-fin-muted mb-1 text-xs flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Password</span>
            </label>
            <div className="flex items-center rounded-xl border border-slate-300 bg-white focus-within:border-slate-800 focus-within:ring-2 focus-within:ring-slate-900/10 overflow-hidden shadow-fin-sm transition-all">
              <div className="px-3 py-2.5 bg-slate-100 text-slate-600 border-r border-slate-200 flex items-center justify-center flex-shrink-0">
                <KeyRound className="w-4 h-4 text-slate-600" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{ paddingLeft: '12px', paddingRight: '12px' }}
                className="w-full py-2.5 text-xs font-mono font-semibold text-slate-900 bg-transparent outline-none focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 py-2.5 text-slate-500 hover:text-slate-900 cursor-pointer flex-shrink-0"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-fin-charcoal hover:bg-slate-800 text-surface font-bold text-xs rounded-xl shadow-fin-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? 'Authenticating...' : mode === 'LOGIN' ? 'Sign In to Account' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          {/* Quick Preset Accounts */}
          <div className="pt-2 border-t border-border-subtle">
            <div className="text-[11px] font-semibold text-fin-muted mb-2 flex items-center justify-between">
              <span>Quick Demo Accounts:</span>
              <Sparkles className="w-3 h-3 text-emerald-600" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => useDemoUser('Utkarsh', 'utkarsh@tradeguard.io')}
                className="p-2.5 rounded-xl bg-surface-subtle hover:bg-surface-muted border border-border-subtle text-left transition-all cursor-pointer shadow-fin-sm"
              >
                <div className="font-bold text-fin-charcoal text-[11px]">Utkarsh</div>
                <div className="text-[10px] text-fin-muted truncate font-medium">Pro Swing Trader</div>
              </button>
              <button
                type="button"
                onClick={() => useDemoUser('Sarah Chen', 'sarah.chen@tradeguard.io')}
                className="p-2.5 rounded-xl bg-surface-subtle hover:bg-surface-muted border border-border-subtle text-left transition-all cursor-pointer shadow-fin-sm"
              >
                <div className="font-bold text-fin-charcoal text-[11px]">Sarah Chen</div>
                <div className="text-[10px] text-fin-muted truncate font-medium">Momentum Trader</div>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
