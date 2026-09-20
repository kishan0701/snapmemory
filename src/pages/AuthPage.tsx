import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Mail, Lock, Eye, EyeOff, User,
  AlertCircle, ArrowRight, ArrowLeft,
  Sparkles, Star, CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import toast from 'react-hot-toast';

// ─── Password rules for signup ────────────────────────────────
const passwordRules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains a number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains a letter', test: (p: string) => /[a-zA-Z]/.test(p) },
];

export function AuthPage() {
  const { login, signup, loginWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  // Mode derived directly from route: false = /login, true = /signup
  const isRegister = location.pathname === '/signup';

  const toggleMode = (register: boolean) => {
    navigate(register ? '/signup' : '/login', { replace: true });
  };

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup form state
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [signupError, setSignupError] = useState('');

  // Auto-fill demo account
  const handleAutoFillDemo = () => {
    setLoginForm({
      email: 'kishan@example.com',
      password: 'password123',
    });
    setLoginError('');
    toast.success('Demo credentials filled for kishan@example.com ⚡', {
      icon: '⚡',
      style: {
        borderRadius: '10px',
        background: '#1e163b',
        color: '#e9d5ff',
        border: '1px solid rgba(168, 85, 247, 0.4)',
      },
    });
  };

  // ─── Form Handlers ─────────────────────────────────────────────
  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginForm.email || !loginForm.password) {
      setLoginError('Please enter both email and password.');
      return;
    }
    try {
      await login(loginForm.email, loginForm.password);
      toast.success('Welcome back, Kishan! 🎉');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Login failed. Please check credentials.');
    }
  };

  const handleSignup = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSignupError('');
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      setSignupError('Please fill in all required fields.');
      return;
    }
    if (!passwordRules.every(r => r.test(signupForm.password))) {
      setSignupError('Password does not meet the security requirements.');
      return;
    }
    try {
      await signup(signupForm.name, signupForm.email, signupForm.password);
      toast.success('Account created! Welcome to SnapMemory 🎊');
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setSignupError(err instanceof Error ? err.message : 'Signup failed. Try again.');
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      toast.success('Welcome! Logged in with Google');
      navigate(from, { replace: true });
    } catch {
      toast.error('Google login failed');
    }
  };

  return (
    <div className="min-h-screen md:min-h-screen bg-[#090714] flex items-stretch md:items-center justify-center md:p-6 overflow-hidden relative selection:bg-purple-500 selection:text-white">

      {/* ── Background Glow & Light Orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 35, 0], y: [0, -30, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -left-24 w-[550px] h-[550px] rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 35, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-24 -right-24 w-[550px] h-[550px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[160px] opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.12) 0%, transparent 70%)' }}
        />
      </div>

      {/* ── Top Header Logo (desktop only) ── */}
      <header className="absolute top-5 left-6 sm:top-7 sm:left-10 z-30 hidden md:flex">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="SnapMemory"
            className="w-9 h-9 rounded-xl object-cover shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform duration-200"
          />
          <span className="text-lg font-black tracking-tight text-white">
            Snap<span className="gradient-text-brand">Memory</span>
          </span>
        </Link>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          MAIN AUTH CARD CONTAINER
      ══════════════════════════════════════════════════════════════ */}
      {/* ══ MAIN AUTH CARD ══ */}
      <div className="relative w-full md:max-w-[960px] md:min-h-[620px] md:rounded-3xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.7),0_0_60px_rgba(124,58,237,0.2)] md:border border-purple-500/20 bg-[#120d26]/90 backdrop-blur-2xl z-10 md:my-10 flex flex-col md:block min-h-screen md:min-h-0">

        {/* ── MOBILE ONLY: Compact Header Banner & Tab Switcher ── */}
        <div className="md:hidden flex-shrink-0">
          <div className="relative h-52 overflow-hidden">
            <img
              src="/images/auth-cover.jpg"
              alt="Event Celebration"
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center 60%' }}
            />
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#120d26] via-[#120d26]/50 to-purple-950/10" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/10" />

            {/* Animated orbs */}
            <motion.div
              animate={{ y: [-5, 5, -5], x: [-3, 3, -3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-2 right-4 w-14 h-14 rounded-full blur-2xl opacity-60"
              style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.7) 0%, transparent 70%)' }}
            />

            {/* Logo inside cover */}
            <div className="absolute top-3 left-4 flex items-center gap-2">
              <img src="/logo.png" alt="SnapMemory" className="w-7 h-7 rounded-lg object-cover shadow-md" />
              <span className="text-sm font-black tracking-tight text-white">
                Snap<span className="gradient-text-brand">Memory</span>
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-base font-black text-white tracking-tight"
              >
                {isRegister ? 'Join SnapMemory ✨' : 'Welcome to SnapMemory 👋'}
              </motion.h2>
            </div>
          </div>

          {/* Segmented tabs */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="px-4 py-3 border-b border-purple-500/15"
          >
            <div className="grid grid-cols-2 p-1 rounded-xl bg-purple-950/40 border border-purple-500/20">
              <button
                type="button"
                onClick={() => toggleMode(false)}
                className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${!isRegister
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/50'
                    : 'text-purple-300/70 hover:text-white'
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => toggleMode(true)}
                className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${isRegister
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/50'
                    : 'text-purple-300/70 hover:text-white'
                  }`}
              >
                Create Account
              </button>
            </div>
          </motion.div>
        </div>

        {/* ── DESKTOP SLIDING COVER PANEL (With HD Event Image) ── */}
        <div
          className={`hidden md:block absolute top-0 bottom-0 w-1/2 z-20 transition-transform duration-[680ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${isRegister ? 'translate-x-full' : 'translate-x-0'
            }`}
        >
          {/* HD Image Background */}
          <div className="relative w-full h-full overflow-hidden">
            <img
              src="/images/auth-cover.jpg"
              alt="Event Celebration Crowd"
              className="absolute inset-0 w-full h-full object-cover object-center scale-105"
            />

            {/* Rich cinematic gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1b0d3d]/75 via-[#100726]/85 to-[#090317]/96" />
            <div className="absolute inset-0 bg-radial-at-c from-purple-600/20 via-transparent to-black/40" />

            {/* Subtle inner border glow */}
            <div className="absolute inset-0 border-x border-purple-500/25 pointer-events-none" />

            {/* Sliding Panel Content */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between p-10 text-center">

              {/* Top Tag */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-xs font-semibold text-purple-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>50,000+ Memories Shared</span>
                </div>
              </div>

              {/* Center Dynamic Content */}
              <AnimatePresence mode="wait">
                {isRegister ? (
                  /* Shown when in Register mode (Panel is on the RIGHT) */
                  <motion.div
                    key="register-hero"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-5 shadow-xl shadow-purple-950/60">
                      <Camera className="w-8 h-8 text-purple-200" />
                    </div>

                    <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug mb-3">
                      Already have an account?
                    </h2>

                    <p className="text-sm text-purple-200/80 leading-relaxed max-w-[280px] mb-7">
                      Sign in to continue managing your event galleries, live QR codes, and guest uploads.
                    </p>

                    <button
                      id="desktop-switch-to-login"
                      type="button"
                      onClick={() => toggleMode(false)}
                      className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-sm backdrop-blur-md border border-white/30 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      Sign In to Account
                    </button>
                  </motion.div>
                ) : (
                  /* Shown when in Login mode (Panel is on the LEFT) */
                  <motion.div
                    key="login-hero"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-5 shadow-xl shadow-purple-950/60">
                      <Sparkles className="w-8 h-8 text-amber-300" />
                    </div>

                    <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug mb-3">
                      New to SnapMemory?
                    </h2>

                    <p className="text-sm text-purple-200/80 leading-relaxed max-w-[280px] mb-7">
                      Create your free organizer account and collect every guest photo in one shared gallery.
                    </p>

                    <button
                      id="desktop-switch-to-signup"
                      type="button"
                      onClick={() => toggleMode(true)}
                      className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-sm backdrop-blur-md border border-white/30 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Create Free Account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Social Proof */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-purple-300/70 font-medium">
                  Loved by 2,400+ couples & event organizers
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* ── FORMS WRAPPER (Grid of two 50% sides on desktop) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[620px]">

          {/* ────────────────────────────────────────────────────────
              LEFT SIDE: SIGN UP / REGISTER FORM
          ──────────────────────────────────────────────────────── */}
          {/* Mobile: animated, Desktop: always rendered with CSS */}
          <AnimatePresence mode="wait">
            {(isRegister || typeof window !== 'undefined') && (
              <motion.div
                key={isRegister ? 'signup-active' : 'signup-inactive'}
                initial={{ opacity: 0, y: isRegister ? 18 : 0 }}
                animate={{ opacity: isRegister ? 1 : 0, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`w-full flex flex-col justify-start md:justify-center px-5 py-5 sm:px-10 lg:px-12 ${isRegister
                    ? 'opacity-100 pointer-events-auto'
                    : 'md:opacity-0 md:pointer-events-none hidden md:block'
                  }`}
              >
                <div className="w-full max-w-sm mx-auto">
                  <div className="text-center mb-3">
                    <h1 className="text-xl font-black text-white tracking-tight">
                      Create Account
                    </h1>
                    <p className="text-xs text-purple-300/70 mt-1">
                      Start collecting event memories in 60 seconds
                    </p>
                  </div>

                  {/* Google OAuth Button */}
                  <button
                    id="signup-google-btn"
                    type="button"
                    onClick={handleGoogle}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/25 hover:border-purple-500/50 text-purple-100 font-semibold text-xs tracking-wide transition-all shadow-sm group"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-purple-500/15" />
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase">
                      <span className="bg-[#120d26] px-2 text-purple-400/60 font-medium tracking-wider">
                        or with email
                      </span>
                    </div>
                  </div>

                  {signupError && (
                    <div className="mb-3.5 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-300">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                      <span>{signupError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSignup} className="space-y-3">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-200/80 mb-1 ml-0.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-purple-400/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="signup-name"
                          type="text"
                          placeholder="Kishan Yadav"
                          value={signupForm.name}
                          onChange={e => setSignupForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full bg-[#171233]/80 border border-purple-500/20 focus:border-purple-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-200/80 mb-1 ml-0.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-purple-400/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="signup-email"
                          type="email"
                          placeholder="kishan@example.com"
                          value={signupForm.email}
                          onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))}
                          className="w-full bg-[#171233]/80 border border-purple-500/20 focus:border-purple-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-200/80 mb-1 ml-0.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-purple-400/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="signup-password"
                          type={showSignupPass ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={signupForm.password}
                          onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))}
                          className="w-full bg-[#171233]/80 border border-purple-500/20 focus:border-purple-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPass(!showSignupPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/50 hover:text-purple-300"
                        >
                          {showSignupPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Password rules check */}
                      {signupForm.password && (
                        <div className="mt-2 p-2 rounded-lg bg-purple-950/30 border border-purple-500/15 space-y-1">
                          {passwordRules.map(r => {
                            const pass = r.test(signupForm.password);
                            return (
                              <div
                                key={r.label}
                                className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors ${pass ? 'text-emerald-400' : 'text-purple-400/50'
                                  }`}
                              >
                                <CheckCircle2 className={`w-3 h-3 ${pass ? 'text-emerald-400' : 'text-purple-500/30'}`} />
                                <span>{r.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Submit button */}
                    <button
                      id="signup-submit-btn"
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-900/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Mobile toggle link */}
                  <div className="md:hidden mt-2 text-center">
                    <p className="text-xs text-purple-300/70">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => toggleMode(false)}
                        className="text-purple-400 font-bold hover:underline"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!isRegister && (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`w-full flex flex-col justify-start md:justify-center px-5 py-5 sm:px-10 lg:px-12 ${!isRegister
                    ? 'opacity-100 pointer-events-auto block'
                    : 'md:opacity-0 md:pointer-events-none hidden md:block'
                  }`}
              >
                <div className="w-full max-w-sm mx-auto">
                  <div className="text-center mb-3">
                    <h1 className="text-xl font-black text-white tracking-tight">
                      Welcome Back
                    </h1>
                    <p className="text-xs text-purple-300/70 mt-1">
                      Sign in to your SnapMemory organizer portal
                    </p>
                  </div>

                  {/* Google OAuth Button */}
                  <button
                    id="login-google-btn"
                    type="button"
                    onClick={handleGoogle}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/25 hover:border-purple-500/50 text-purple-100 font-semibold text-xs tracking-wide transition-all shadow-sm group"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative my-2.5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-purple-500/15" />
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase">
                      <span className="bg-[#120d26] px-2 text-purple-400/60 font-medium tracking-wider">
                        or with email
                      </span>
                    </div>
                  </div>

                  {loginError && (
                    <div className="mb-3.5 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-300">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-2">
                    {/* Email Address */}
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-200/80 mb-1 ml-0.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-purple-400/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="login-email"
                          type="email"
                          placeholder="kishan@example.com"
                          value={loginForm.email}
                          onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                          className="w-full bg-[#171233]/80 border border-purple-500/20 focus:border-purple-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1 ml-0.5">
                        <label className="block text-[11px] font-semibold text-purple-200/80">
                          Password
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-purple-400/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="login-password"
                          type={showLoginPass ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={loginForm.password}
                          onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                          className="w-full bg-[#171233]/80 border border-purple-500/20 focus:border-purple-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPass(!showLoginPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/50 hover:text-purple-300"
                        >
                          {showLoginPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      id="login-submit-btn"
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-900/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Sign In to Dashboard</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Subtle small demo hint for users */}
                  <div className="mt-2.5 pt-2.5 border-t border-purple-500/10 text-center">
                    <p className="text-[11px] text-purple-300/60 inline-flex items-center gap-1.5 flex-wrap justify-center">
                      <span>Demo:</span>
                      <button
                        type="button"
                        onClick={handleAutoFillDemo}
                        className="text-amber-300 hover:text-amber-200 font-mono font-medium hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
                        title="Click to auto-fill"
                      >
                        <span>kishan@example.com</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/60 border border-purple-500/30 text-purple-200">
                          Auto-fill
                        </span>
                      </button>
                    </p>
                  </div>

                  {/* Mobile toggle link */}
                  <div className="md:hidden mt-2 text-center">
                    <p className="text-xs text-purple-300/70">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => toggleMode(true)}
                        className="text-purple-400 font-bold hover:underline"
                      >
                        Create one
                      </button>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>{/* end forms grid */}

      </div>{/* end main card */}

    </div>
  );
}
