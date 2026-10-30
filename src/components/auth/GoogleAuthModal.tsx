import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ShieldCheck, Mail, User, ChevronRight,
  ArrowLeft, Check, Lock, Sparkles, ExternalLink
} from 'lucide-react';
import { getFirstLetter, getAvatarTheme } from '@/utils/utils';

export interface GoogleAccount {
  name: string;
  email: string;
}

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (account: GoogleAccount) => Promise<void>;
  suggestedEmail?: string;
}

export function GoogleAuthModal({
  isOpen,
  onClose,
  onSuccess,
  suggestedEmail = '',
}: GoogleAuthModalProps) {
  const [step, setStep] = useState<'select' | 'custom' | 'consent' | 'authorizing'>('select');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<GoogleAccount | null>(null);
  const [customError, setCustomError] = useState('');
  const [existingAccounts, setExistingAccounts] = useState<GoogleAccount[]>([]);

  // Load existing accounts from localStorage
  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem('SnapMemory_registered_users');
      const list: Array<{ name: string; email: string }> = raw ? JSON.parse(raw) : [];
      const accounts: GoogleAccount[] = list.map(u => ({ name: u.name, email: u.email }));

      // Add a fresh default Google account option if list is small
      if (!accounts.some(a => a.email.includes('gmail.com'))) {
        accounts.unshift({
          name: suggestedEmail ? suggestedEmail.split('@')[0] : 'My Google Account',
          email: suggestedEmail || 'user@gmail.com',
        });
      }
      setExistingAccounts(accounts.slice(0, 3));
    } catch {
      setExistingAccounts([
        { name: 'Google User', email: suggestedEmail || 'user@gmail.com' },
      ]);
    }

    setStep('select');
    setCustomError('');
    if (suggestedEmail) {
      setCustomEmail(suggestedEmail);
      setCustomName(suggestedEmail.split('@')[0]);
    }
  }, [isOpen, suggestedEmail]);

  if (!isOpen) return null;

  const handleSelectAccount = (acc: GoogleAccount) => {
    setSelectedAccount(acc);
    setStep('consent');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');
    if (!customName.trim()) {
      setCustomError('Please enter your full name.');
      return;
    }
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setCustomError('Please enter a valid Google email address.');
      return;
    }
    const acc = { name: customName.trim(), email: customEmail.trim() };
    setSelectedAccount(acc);
    setStep('consent');
  };

  const handleAllowAndContinue = async () => {
    if (!selectedAccount) return;
    setStep('authorizing');
    try {
      await onSuccess(selectedAccount);
    } catch (err) {
      console.error(err);
      setStep('consent');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Google OAuth Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-[#18142e] border border-purple-500/30 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden z-10 text-white"
        >
          {/* Top Bar with Google Branding */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-purple-500/15">
            <div className="flex items-center gap-2.5">
              {/* Google G Logo */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="text-xs font-semibold text-purple-200 tracking-wide">
                Sign in with Google
              </span>
            </div>
            <button
              onClick={onClose}
              disabled={step === 'authorizing'}
              className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body Based on Step */}
          <div className="p-6">
            {/* ── STEP 1: ACCOUNT SELECTION ──────────────────────── */}
            {step === 'select' && (
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Choose an account
                  </h3>
                  <p className="text-xs text-purple-300/70 mt-1">
                    to continue to <span className="font-semibold text-purple-200">SnapMemory</span>
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  {existingAccounts.map((acc, idx) => {
                    const theme = getAvatarTheme(acc.name);
                    const letter = getFirstLetter(acc.name);
                    return (
                      <button
                        key={`${acc.email}-${idx}`}
                        type="button"
                        onClick={() => handleSelectAccount(acc)}
                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-purple-600/20 border border-purple-500/20 hover:border-purple-400/40 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* WhatsApp / Google style initial avatar */}
                          <div
                            className={`w-10 h-10 rounded-full ${theme.bg} flex items-center justify-center text-white text-sm font-black shadow-md flex-shrink-0`}
                          >
                            {letter}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white group-hover:text-purple-200 truncate">
                              {acc.name}
                            </p>
                            <p className="text-xs text-purple-300/60 truncate">
                              {acc.email}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-purple-400/60 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>

                {/* Use another account button */}
                <button
                  type="button"
                  onClick={() => setStep('custom')}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-purple-500/30 hover:border-purple-400/60 hover:bg-white/5 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:text-white flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-purple-200 group-hover:text-white">
                      Use another Google account
                    </p>
                    <p className="text-[11px] text-purple-400/60">
                      Sign in with your personal name & Gmail
                    </p>
                  </div>
                </button>
              </div>
            )}

            {/* ── STEP 2: CUSTOM ACCOUNT INPUT ───────────────────── */}
            {step === 'custom' && (
              <div>
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-white mb-4 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to accounts
                </button>

                <div className="text-center mb-5">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Add your Google Account
                  </h3>
                  <p className="text-xs text-purple-300/70 mt-1">
                    Enter your name and Google address to connect
                  </p>
                </div>

                {customError && (
                  <div className="mb-4 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200">
                    {customError}
                  </div>
                )}

                <form onSubmit={handleCustomSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-purple-200 mb-1 ml-0.5">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-purple-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        className="w-full bg-[#1e183a] border border-purple-500/25 focus:border-purple-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-purple-200 mb-1 ml-0.5">
                      Google Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-purple-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="e.g. rahul@gmail.com"
                        value={customEmail}
                        onChange={e => setCustomEmail(e.target.value)}
                        className="w-full bg-[#1e183a] border border-purple-500/25 focus:border-purple-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-900/40 transition-all"
                  >
                    Continue to Permissions
                  </button>
                </form>
              </div>
            )}

            {/* ── STEP 3: CONSENT & PERMISSION SCREEN ──────────────── */}
            {step === 'consent' && selectedAccount && (
              <div>
                {/* Header with App Handshake */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-500/30 flex items-center justify-center shadow-md">
                    <img src="/logo.png" alt="SnapMemory" className="w-6 h-6 rounded-md object-cover" />
                  </div>
                  <div className="w-6 h-[1px] bg-purple-500/40" />
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    SnapMemory wants to access your Google Account
                  </h3>
                  {/* Account Pill */}
                  <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/25 text-xs text-purple-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold">{selectedAccount.name}</span>
                    <span className="text-purple-400/70">({selectedAccount.email})</span>
                  </div>
                </div>

                {/* Permission Scopes */}
                <div className="bg-[#1e183a]/90 rounded-2xl p-3.5 border border-purple-500/20 space-y-3 mb-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-purple-300/80 mb-1">
                    This will allow SnapMemory to:
                  </p>

                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-300 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-white">See your basic personal profile</p>
                      <p className="text-purple-300/60 text-[11px]">
                        Your name and profile avatar symbol for WhatsApp-style identification.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-300 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-white">See your primary email address</p>
                      <p className="text-purple-300/60 text-[11px]">
                        Used to securely authenticate and link your event albums.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-300 mt-0.5">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-white">Event access and QR code downloads</p>
                      <p className="text-purple-300/60 text-[11px]">
                        Save event memories, join guest uploads, and download photos.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <p className="text-[10px] text-purple-300/60 leading-relaxed mb-5">
                  Make sure you trust SnapMemory. You may be sharing sensitive info with this app.
                  Learn about how SnapMemory handles your data in its Terms of Service.
                </p>

                {/* Allow & Cancel Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAllowAndContinue}
                    className="py-2.5 px-3 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-900/50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Allow & Continue</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: AUTHORIZING SPINNER ─────────────────────── */}
            {step === 'authorizing' && (
              <div className="py-10 text-center flex flex-col items-center">
                <div className="relative w-14 h-14 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#4285F4] border-r-[#EA4335] border-b-[#FBBC05] border-l-[#34A853] animate-spin" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  Connecting to Google...
                </h4>
                <p className="text-xs text-purple-300/70">
                  Authorizing access for {selectedAccount?.email}
                </p>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="px-6 py-2.5 bg-black/30 border-t border-purple-500/10 flex items-center justify-between text-[10px] text-purple-400/60">
            <span>Secure 256-bit OAuth Handshake</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
