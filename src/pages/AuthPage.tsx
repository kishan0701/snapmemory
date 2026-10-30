import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Mail, Lock, Eye, EyeOff, User,
  AlertCircle, ArrowRight, ArrowLeft,
  Sparkles, Star, CheckCircle2, ShieldCheck, Check
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { GoogleAuthModal, type GoogleAccount } from '@/components/auth/GoogleAuthModal';
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

  // Google OAuth Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
  });
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
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

  // Switch to signup with pre-filled email when account not found
  const handleSwitchToSignupWithEmail = () => {
    setSignupForm(prev => ({
      ...prev,
      email: loginForm.email,
      name: loginForm.email.split('@')[0],
    }));
    setLoginError('');
    toggleMode(true);
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
      const displayName = loginForm.email.split('@')[0];
      const capitalized = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      toast.success(`Welcome back, ${capitalized}! 🎉`);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Login failed. Please check credentials.');
    }
  };

  const handleSignup = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!signupForm.name || !signupForm.email || !signupForm.password || !signupForm.confirmPassword) {
      setSignupError('Please fill in all required fields.');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    if (!passwordRules.every(r => r.test(signupForm.password))) {
      setSignupError('Password does not meet the security requirements.');
      return;
    }

    if (!signupForm.agreeTerms) {
      setSignupError('Please agree to the Terms of Service to continue.');
      return;
    }

    try {
      await signup(signupForm.name, signupForm.email, signupForm.password);
      toast.success(`Account created! Welcome to SnapMemory, ${signupForm.name.split(' ')[0]} 🎊`);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setSignupError(err instanceof Error ? err.message : 'Signup failed. Try again.');
    }
  };

  // Handle Google OAuth Successful Consent
  const handleGoogleSuccess = async (account: GoogleAccount) => {
    try {
      await loginWithGoogle(account);
      setIsGoogleModalOpen(false);
      toast.success(`Welcome, ${account.name}! Signed in with Google 🎉`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error('Google authorization failed. Please try again.');
      throw err;
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-zA-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass) || pass.length >= 10) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(signupForm.password);
  const passwordsMatch = signupForm.confirmPassword && signupForm.password === signupForm.confirmPassword;
  const passwordsMismatch = signupForm.confirmPassword && signupForm.password !== signupForm.confirmPassword;

  return (
    <div className="min-h-screen md:min-h-screen bg-[#090714] flex items-stretch md:items-center justify-center md:p-6 overflow-hidden relative selection:bg-purple-500 selection:text-white">

      {/* ── Google OAuth Permission Modal ── */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
        suggestedEmail={isRegister ? signupForm.email : loginForm.email}
      />

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
      <div className="relative w-full md:max-w-[980px] md:min-h-[640px] md:rounded-3xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.7),0_0_60px_rgba(124,58,237,0.2)] md:border border-purple-500/20 bg-[#120d26]/90 backdrop-blur-2xl z-10 md:my-8 flex flex-col md:block min-h-screen md:min-h-0">

        {/* ── MOBILE ONLY: Header Banner & Tab Switcher ── */}
        <div className="md:hidden flex-shrink-0">
          <div className="relative h-44 overflow-hidden">
            <img
              src="/images/auth-cover.jpg"
              alt="Event Celebration"
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center 60%' }}
            />
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#120d26] via-[#120d26]/60 to-purple-950/20" />

            {/* Logo inside cover */}
            <div className="absolute top-3 left-4 flex items-center gap-2">
              <img src="/logo.png" alt="SnapMemory" className="w-7 h-7 rounded-lg object-cover shadow-md" />
              <span className="text-sm font-black tracking-tight text-white">
                Snap<span className="gradient-text-brand">Memory</span>
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-4 pb-2.5">
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
          <div className="px-4 py-2.5 border-b border-purple-500/15">
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
          </div>
        </div>

        {/* ── DESKTOP SLIDING COVER PANEL ── */}
        <div
          className={`hidden md:block absolute top-0 bottom-0 w-1/2 z-20 transition-transform duration-[680ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${isRegister ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          <div className="relative w-full h-full overflow-hidden">
            <img
              src="/images/auth-cover.jpg"
              alt="Event Celebration Crowd"
              className="absolute inset-0 w-full h-full object-cover object-center scale-105"
            />

            {/* Cinematic gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1b0d3d]/80 via-[#100726]/85 to-[#090317]/96" />
            <div className="absolute inset-0 bg-radial-at-c from-purple-600/20 via-transparent to-black/40" />
            <div className="absolute inset-0 border-x border-purple-500/25 pointer-events-none" />

            {/* Sliding Panel Content */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between p-10 text-center">

              {/* Top Tag */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-xs font-semibold text-purple-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>450+ Memories Shared</span>
                </div>
              </div>

              {/* Center Dynamic Content */}
              <AnimatePresence mode="wait">
                {isRegister ? (
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
                  Loved by 350+ event organizers & hosts
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* ── FORMS WRAPPER (Grid of two 50% sides on desktop) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[640px]">

          {/* ────────────────────────────────────────────────────────
              LEFT SIDE: SIGN UP / REGISTER FORM
          ──────────────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {(isRegister || typeof window !== 'undefined') && (
              <motion.div
                key={isRegister ? 'signup-active' : 'signup-inactive'}
                initial={{ opacity: 0, y: isRegister ? 18 : 0 }}
                animate={{ opacity: isRegister ? 1 : 0, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`w-full flex flex-col justify-start md:justify-center px-5 py-5 sm:px-8 lg:px-10 ${isRegister
                  ? 'opacity-100 pointer-events-auto'
                  : 'md:opacity-0 md:pointer-events-none hidden md:block'
                }`}
              >
                <div className="w-full max-w-sm mx-auto">
                  <div className="text-center mb-3">
                    <h1 className="text-xl font-black text-white tracking-tight">
                      Create Account
                    </h1>
                    <p className="text-xs text-purple-300/70 mt-0.5">
                      Join SnapMemory with your own profile
                    </p>
                  </div>

                  {/* Google OAuth Button with Interactive Permission Dialog */}
                  <button
                    id="signup-google-btn"
                    type="button"
                    onClick={() => setIsGoogleModalOpen(true)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 hover:border-purple-400/60 text-purple-100 font-semibold text-xs tracking-wide transition-all shadow-sm group hover:scale-[1.01]"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-purple-500/15" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-[#120d26] px-2 text-purple-400/60 font-semibold tracking-wider">
                        or register with email
                      </span>
                    </div>
                  </div>

                  {signupError && (
                    <div className="mb-3 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-2 text-xs text-red-200">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                      <span>{signupError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSignup} className="space-y-2.5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-200/80 mb-1 ml-0.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-purple-400/50 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="signup-name"
                          type="text"
                          placeholder="Your Name (e.g. Rahul Sharma)"
                          value={signupForm.name}
                          onChange={e => setSignupForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full bg-[#171233]/80 border border-purple-500/20 focus:border-purple-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
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
                        <Mail className="w-4 h-4 text-purple-400/50 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="signup-email"
                          type="email"
                          placeholder="name@example.com"
                          value={signupForm.email}
                          onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))}
                          className="w-full bg-[#171233]/80 border border-purple-500/20 focus:border-purple-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Password & Confirm Password Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Password */}
                      <div>
                        <label className="block text-[11px] font-semibold text-purple-200/80 mb-1 ml-0.5">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-purple-400/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            id="signup-password"
                            type={showSignupPass ? 'text' : 'password'}
                            placeholder="Min 8 chars"
                            value={signupForm.password}
                            onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))}
                            className="w-full bg-[#171233]/80 border border-purple-500/20 focus:border-purple-400 rounded-xl pl-8 pr-7 py-2 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPass(!showSignupPass)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400/50 hover:text-purple-300"
                          >
                            {showSignupPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-[11px] font-semibold text-purple-200/80 mb-1 ml-0.5">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-purple-400/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            id="signup-confirm-password"
                            type={showConfirmPass ? 'text' : 'password'}
                            placeholder="Repeat password"
                            value={signupForm.confirmPassword}
                            onChange={e => setSignupForm(f => ({ ...f, confirmPassword: e.target.value }))}
                            className={`w-full bg-[#171233]/80 border rounded-xl pl-8 pr-7 py-2 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 transition-all ${
                              passwordsMatch
                                ? 'border-emerald-500/50 focus:ring-emerald-500/20'
                                : passwordsMismatch
                                ? 'border-red-500/50 focus:ring-red-500/20'
                                : 'border-purple-500/20 focus:border-purple-400 focus:ring-purple-500/20'
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400/50 hover:text-purple-300"
                          >
                            {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Real-time Password Match Status Badge */}
                    {signupForm.confirmPassword && (
                      <div className="pt-0.5">
                        {passwordsMatch ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Passwords match correctly</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                            <span>Passwords do not match</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Password Strength Meter */}
                    {signupForm.password && (
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-purple-300/60 font-medium">Password strength</span>
                          <span className={`font-semibold ${
                            strength.score >= 3 ? 'text-emerald-400' : strength.score === 2 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {strength.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 h-1">
                          {[1, 2, 3, 4].map(level => (
                            <div
                              key={level}
                              className={`h-full rounded-full transition-all ${
                                strength.score >= level ? strength.color : 'bg-purple-950/60'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="signup-terms"
                        checked={signupForm.agreeTerms}
                        onChange={e => setSignupForm(f => ({ ...f, agreeTerms: e.target.checked }))}
                        className="mt-0.5 rounded border-purple-500/30 text-purple-600 focus:ring-purple-500/20 bg-[#171233]"
                      />
                      <label htmlFor="signup-terms" className="text-[11px] text-purple-300/70 leading-snug cursor-pointer">
                        I agree to SnapMemory's Terms of Service and Privacy Policy
                      </label>
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

          {/* ────────────────────────────────────────────────────────
              RIGHT SIDE: LOGIN FORM
          ──────────────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {!isRegister && (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`w-full flex flex-col justify-start md:justify-center px-5 py-5 sm:px-8 lg:px-10 ${!isRegister
                  ? 'opacity-100 pointer-events-auto block'
                  : 'md:opacity-0 md:pointer-events-none hidden md:block'
                }`}
              >
                <div className="w-full max-w-sm mx-auto">
                  <div className="text-center mb-3">
                    <h1 className="text-xl font-black text-white tracking-tight">
                      Welcome Back
                    </h1>
                    <p className="text-xs text-purple-300/70 mt-0.5">
                      Sign in to your SnapMemory account
                    </p>
                  </div>

                  {/* Google OAuth Button with Interactive Permission Dialog */}
                  <button
                    id="login-google-btn"
                    type="button"
                    onClick={() => setIsGoogleModalOpen(true)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 hover:border-purple-400/60 text-purple-100 font-semibold text-xs tracking-wide transition-all shadow-sm group hover:scale-[1.01]"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-purple-500/15" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-[#120d26] px-2 text-purple-400/60 font-semibold tracking-wider">
                        or with email
                      </span>
                    </div>
                  </div>

                  {loginError && (
                    <div className="mb-3.5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex flex-col gap-2 text-xs text-red-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                        <span>{loginError}</span>
                      </div>
                      {loginError.includes('No account found') && (
                        <button
                          type="button"
                          onClick={handleSwitchToSignupWithEmail}
                          className="self-start text-[11px] font-bold text-amber-300 hover:text-amber-200 underline mt-0.5 flex items-center gap-1"
                        >
                          Create an account for this email →
                        </button>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-3">
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
                          placeholder="Your email address"
                          value={loginForm.email}
                          onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                          className="w-full bg-[#171233]/80 border border-purple-500/20 focus:border-purple-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
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
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                          className="w-full bg-[#171233]/80 border border-purple-500/20 focus:border-purple-400 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
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

                  {/* Demo test account */}
                  <div className="mt-3 pt-2.5 border-t border-purple-500/15 text-center">
                    <p className="text-[11px] text-purple-300/60 inline-flex items-center gap-1.5 flex-wrap justify-center">
                      <span>Quick Demo:</span>
                      <button
                        type="button"
                        onClick={handleAutoFillDemo}
                        className="text-amber-300 hover:text-amber-200 font-mono font-medium hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
                        title="Click to auto-fill demo account"
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
